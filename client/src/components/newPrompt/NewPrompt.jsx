import { getClient } from "@botpress/webchat";
import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Upload from "../../components/upload/Upload.jsx";
import { getGuestChatCount } from "../../redux/actions/authActions.js";
import ChatLimiter from "../chatLimiter/ChatLimiter.jsx";
import "./NewPrompt.css";

function NewPrompt({ endRef, data, setIsTyping }) {
  // Xử lý nhập / gửi chat
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [shouldSendToServer, setShouldSendToServer] = useState(false); // kiểm tra trạng thái để gọi mutate
  const [latestUserMessage, setLatestUserMessage] = useState(""); // lấy đầu vào mới nhất nhập từ người dùng
  const [isConnected, setIsConnected] = useState(false);
  const [client, setClient] = useState(null);
  const [limitError, setLimitError] = useState(false);

  const path = useLocation().pathname;
  const chatId = path.split("/").pop(); // Lấy chatId Từ URL

  // Biến tăng dòng cho textarea
  const [rows, setRows] = useState(1);
  const clientId = import.meta.env.VITE_CLIENT_ID;

  // Biến kiểm tra trạng thái đăng nhập
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Giới hạn chat cho guest, ví dụ max 5 tin nhắn
  const guestChatLimit = 5;
  // Thêm state lưu số chat count hiện tại của guest
  const { guestChatCount } = useSelector((state) => state.auth);
  console.log(guestChatCount);

  // Khi là guest thì gọi action lấy số chat count
  useEffect(() => {
    if (!isSignedIn && data?._id) {
      dispatch(getGuestChatCount(data._id));
    }
  }, [isSignedIn, data?._id, dispatch]);

  const [img, setImg] = useState({
    isLoading: false,
    error: "",
    dbData: {},
    aiData: {},
  });

  // Hàm reset chiều cao và đặt tự chiều cao theo nội dung của textarea (vùng nhập)
  const autoResizeTextarea = (element) => {
    if (element) {
      element.style.height = "auto"; // Reset trước
      element.style.height = element.scrollHeight + "px"; // Đặt chiều cao theo nội dung
    }
  };

  // Theo dõi phản hồi bot -> kích hoạt PUT request khi có phản hồi từ bot
  const handleChange = (event) => {
    const value = event.target.value;
    setInputMessage(value);

    const lineBreaks = value.split("\n").length;
    setRows(Math.min(7, Math.max(1, lineBreaks))); // Giới hạn từ 1 đến 7 dòng

    autoResizeTextarea(event.target);
  };

  useEffect(() => {
    if (endRef?.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, img.dbData, endRef]);

  const queryClient = useQueryClient();

  // reset khi input rỗng
  useEffect(() => {
    if (inputMessage.trim() === "") {
      setRows(1); // Reset về 1 dòng
      const textarea = document.querySelector("textarea");
      if (textarea) {
        textarea.style.height = "auto";
      }
    }
  }, [inputMessage]);

  const handleKeyDown = (event) => {
    if (!isConnected) return; // Không cho nhập khi chưa kết nối

    const textarea = event.target;

    if (event.key === "Enter") {
      if (event.shiftKey) {
        event.preventDefault(); // Chặn hành vi mặc định để tránh xuống 2 dòng
        setInputMessage((prev) => prev + "\n"); // Xuống dòng đúng 1 lần
        textarea.style.height = textarea.scrollHeight + "px";
      } else {
        event.preventDefault(); // Chặn hành vi xuống dòng mặc định

        // nếu là guest và vượt limit
        if (!isSignedIn && guestChatCount >= guestChatLimit) {
          setLimitError(true);
          setIsTyping(false);
          return;
        }

        sendMessage(inputMessage, false);
        setIsTyping(true);
        textarea.style.height = "auto"; // reset chiều cao
      }
    }
  };

  // useEffect(() => {
  //   console.log(messages);
  //   console.log(img);
  // }, [messages]);

  const endpoint = isSignedIn
    ? `${import.meta.env.VITE_API_URL}/api/chats/${data._id}`
    : `${import.meta.env.VITE_API_URL}/api/chats/guest/${data._id}`;

  // console.log(endpoint);

  const mutation = useMutation({
    mutationFn: ({ inputMessage, botResponse, image }) => {
      const imagePath =
        image && image.dbData && typeof image.dbData.filePath === "string"
          ? image.dbData.filePath
          : undefined;

      // Log kiểm tra sending của client
      console.log("Sending PUT request to: ", endpoint);
      console.log("Request body:", {
        inputMessage: inputMessage.length ? inputMessage : undefined,
        botResponse: botResponse.length ? botResponse : undefined,
        image_url: image?.dbData?.filePath || undefined, // optional
      });

      return fetch(endpoint, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputMessage: inputMessage.length ? inputMessage : undefined,
          botResponse: botResponse.length ? botResponse : undefined,
          image_url: imagePath,
        }),
      }).then(async (res) => {
        if (!res.ok) {
          const error = await res.json();
          throw { status: res.status, message: error.message };
        }
        return res.json();
      });
    },
    // server response trả về id của chat mới tạo
    onSuccess: (data) => {
      console.log("Success Data: ", data);
      queryClient.invalidateQueries({ queryKey: ["chat", chatId] }).then(() => {
        setInputMessage(""); // Reset dữ liệu người dùng nhập (Input Form)
        setLatestUserMessage(""); // Reset lời nhắn của người dùng
        // tránh trường hợp bị lỗi khi gửi ảnh mà vẫn còn input message đã gửi là text trước đó
        setMessages([]); // Reset messages
        setImg({ isLoading: false, error: "", dbData: {}, aiData: {} }); // Reset ảnh
        setIsTyping(false);
        setLimitError(false); // reset nếu thành công

        if (!isSignedIn && data.userMessageCount !== undefined) {
          dispatch(getGuestChatCount(data._id));
        }
      });
    },
    onError: (error) => {
      if (error?.status === 403) {
        setLimitError(true); // chỉ set boolean true
        setIsTyping(false);
      } else {
        console.error("Đã xảy ra lỗi:", error);
      }
    },
  });

  useEffect(() => {
    const clientInstance = getClient({ clientId });

    clientInstance.on("message", (message) => {
      console.log("received message: ", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    const connectClient = async () => {
      try {
        await clientInstance.connect();
        setIsConnected(true);
        setClient(clientInstance);
      } catch (error) {
        console.error("Error Connecting Botpress", error);
        setIsConnected(false);
      }
    };
    connectClient();
  }, []);

  // Hàm sendMessage cho botpress (ban đầu sẽ chạy useEffect kiểm tra initial message)
  const sendMessage = async (message, isInitialMessage) => {
    if (!message.trim()) return;

    if (!client || !isConnected) {
      console.error("Client is not connected. Cannot send message.");
      return;
    }

    // Kiểm tra limit cho guest
    if (!isSignedIn && guestChatCount >= guestChatLimit) {
      setLimitError(true);
      setIsTyping(false);
      return;
    }

    try {
      console.log("Sending message:", message); // Log tin nhắn trước khi gửi
      if (typeof message === "string") {
        // Gửi message lên botpress xử lý
        await client.sendMessage({ type: "text", text: message });
        setMessages((prevMessages) => [
          ...prevMessages,
          { payload: { block: { text: message } }, authorId: "user" }, // Lưu đối tượng giống dạng object từ Botpress trả về
        ]);

        setShouldSendToServer(true); // flag để kích hoạt mutation trong useEffect

        // Nếu là message đầu, bỏ qua và không lưu câu hỏi của user, ngược lại thì lưu message để mutation (vì câu hỏi đã được post lúc đâu rồi)
        if (!isInitialMessage) {
          setLatestUserMessage(message); // lưu message lại để gửi lên server sau
        }
      }
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  // Chạy đầu tiên
  useEffect(() => {
    console.log("useEffect running with:", {
      shouldSendToServer,
      messages,
      latestUserMessage,
      data,
    });
    if (!shouldSendToServer) return;

    const lastBotMsg = messages
      .slice()
      .reverse()
      .find((m) => m.authorId !== "user");

    if (lastBotMsg && data?._id) {
      const botText =
        lastBotMsg?.payload?.block?.text ||
        lastBotMsg?.payload?.blocks?.[0]?.block?.text ||
        "";

      // console.log(img);

      mutation.mutate({
        inputMessage: latestUserMessage,
        botResponse: botText,
        image: img,
      });
      setShouldSendToServer(false); // reset sau mutation
    }
  }, [messages, shouldSendToServer, img]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn reload trang

    sendMessage(inputMessage, false);
    setIsTyping(true);
    const textarea = e.target;

    if (textarea) {
      textarea.style.height = "auto"; // reset chiều cao của textarea khi message (input) đã được gửi
    }
  };

  // Kiểm tra nếu trạng thái đã được lưu trong localStorage
  const hassentMessage = localStorage.getItem(
    `hasSentInitialMessage_${data?._id}`
  );

  const handleNewChat = () => {
    navigate("/dashboard/chats/");
    setLimitError(false);
  };

  useEffect(() => {
    // Log dữ liệu data để kiểm tra xem nó đã có giá trị hợp lệ chưa
    console.log("data:", data);

    // Kiểm tra nếu chưa gửi tin nhắn ban đầu và dữ liệu đã sẵn sàng
    if (
      !hassentMessage &&
      isConnected &&
      client &&
      data?.history?.length > 0 &&
      data.history.length < 3 && // Chỉ gửi nếu lịch sử có 2 mục hoặc ít hơn
      data.history[0].parts?.[0]?.text // kiểm tra tin hấn ban đầu
    ) {
      const inputMessage = data.history[0].parts[0].text; // lấy tin nhắn ban đầu (từ người dùng trong CSDL MongoDB)
      const isInitialMessage = data?.history?.length == 1;
      console.log("Sending initial message:", inputMessage);

      // Gửi tin nhắn đầu tiên
      sendMessage(inputMessage, isInitialMessage);
      setIsTyping(true);

      // Đánh dấu đã gửi tin nhắn ban đầu và lưu vào localStorage
      localStorage.setItem(`hasSentInitialMessage_${data?._id}`, "true");
    }
  }, [isConnected, client, data?.history, hassentMessage]);

  return (
    <>
      <div className="endChat" ref={endRef}>
        {limitError && !isSignedIn && (
          <ChatLimiter
            maxCount={guestChatLimit}
            currentCount={guestChatCount}
            onSend={() => {
              handleNewChat();
            }}
            disabled={false}
          />
        )}
        <div
          className="newPrompt"
          style={{ marginTop: rows === 1 ? "40px" : `${rows * 30}px` }}
        >
          <form className="newForm" onSubmit={handleSubmit}>
            <div className="area">
              <textarea
                type="text"
                name="text"
                placeholder="Hỏi bất kỳ điều gì..."
                onKeyDown={handleKeyDown}
                disabled={!isConnected || limitError}
                onChange={handleChange}
                value={inputMessage}
                rows={rows}
              ></textarea>
            </div>
            <div className="button_container">
              <Upload
                setImg={setImg}
                setMessages={setMessages}
                setIsTyping={setIsTyping}
                isConnected={isConnected}
                limitError={limitError}
                client={client}
                data={data}
                setShouldSendToServer={setShouldSendToServer}
              />
              <input
                id="file"
                type="file"
                multiple={false}
                hidden
                disabled={!isConnected || limitError}
              ></input>
              <button
                type="submit"
                disabled={!isConnected || limitError || !inputMessage.trim()}
                style={{
                  cursor:
                    !isConnected || limitError || !inputMessage.trim()
                      ? "not-allowed"
                      : "pointer",
                  opacity: !isConnected || limitError ? 0.6 : 1,
                }}
              >
                <img className="arrow_image" src="/arrow.png" alt="" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default NewPrompt;
