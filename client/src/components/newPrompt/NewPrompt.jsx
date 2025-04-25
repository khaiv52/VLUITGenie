import React, { useEffect, useState } from "react";
import "./NewPrompt.css";
import Upload from "../../components/upload/Upload.jsx";
import { IKImage } from "imagekitio-react";
import { getClient } from "@botpress/webchat";
import Markdown from "react-markdown";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function NewPrompt({ endRef, data, setIsTyping }) {
  // Xử lý nhập / gửi chat
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [shouldSendToServer, setShouldSendToServer] = useState(false); // kiểm tra trạng thái để gọi mutate
  const [latestUserMessage, setLatestUserMessage] = useState(""); // lấy đầu vào mới nhất nhập từ người dùng
  const [isConnected, setIsConnected] = useState(false);
  const [client, setClient] = useState(null);
  // Biến tăng dòng cho textarea
  const [rows, setRows] = useState(1);
  const clientId = import.meta.env.VITE_CLIENT_ID;

  const [img, setImg] = useState({
    isLoading: false,
    error: "",
    dbData: {},
    aiData: {},
  });

  useEffect(() => {
    if (endRef?.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, img.dbData, endRef]);

  const queryClient = useQueryClient();

  // useEffect(() => {
  //   console.log(messages);
  //   console.log(img);
  // }, [messages]);

  const mutation = useMutation({
    mutationFn: ({ inputMessage, botResponse, image }) => {
      const imagePath =
        image && image.dbData && typeof image.dbData.filePath === "string"
          ? image.dbData.filePath
          : undefined;

      // Log kiểm tra sending của client
      console.log(
        "Sending PUT request to:",
        `${import.meta.env.VITE_API_URL}/api/chats/${data._id}`
      );
      console.log("Request body:", {
        inputMessage: inputMessage.length ? inputMessage : undefined,
        botResponse: botResponse.length ? botResponse : undefined,
        image_url: image?.dbData?.filePath || undefined, // optional
      });

      return fetch(`${import.meta.env.VITE_API_URL}/api/chats/${data._id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        // Gửi dữ liệu dưới dạng JSON

        body: JSON.stringify({
          inputMessage: inputMessage.length ? inputMessage : undefined,
          botResponse: botResponse.length ? botResponse : undefined, // Phản hồi từ chatbot
          image_url: imagePath,
        }),
      }).then((res) => res.json());
    },
    // server response trả về id của chat mới tạo
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: ["chat", data._id] })
        .then(() => {
          setInputMessage(""); // Reset dữ liệu người dùng nhập (Input Form)
          setLatestUserMessage(""); // Reset lời nhắn của người dùng
          // tránh trường hợp bị lỗi khi gửi ảnh mà vẫn còn input message đã gửi là text trước đó
          setMessages([]); // Reset messages
          setImg({ isLoading: false, error: "", dbData: {}, aiData: {} }); // Reset ảnh
        });
    },
    onError: (error) => {
      console.error("Error updating chat:", error);
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

  const sendMessage = async (message, isInitialMessage) => {
    if (!message.trim()) return;

    if (!client || !isConnected) {
      console.error("Client is not connected. Cannot send message.");
      return;
    }

    try {
      console.log("Sending message:", message); // Log tin nhắn trước khi gửi
      if (typeof message === "string") {
        await client.sendMessage({ type: "text", text: message });
        setMessages((prevMessages) => [
          ...prevMessages,
          { payload: { block: { text: message } }, authorId: "user" },
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

  // Theo dõi phản hồi bot -> kích hoạt PUT request khi có phản hồi từ bot

  const handleChange = (event) => {
    setInputMessage(event.target.value);

    const lineBreaks = event.target.value.split("\n").length;
    setRows(Math.min(7, Math.max(1, lineBreaks))); // Giới hạn từ 1 đến 7 dòng
  };

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
      textarea.style.height = "auto";
    }
  };

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

        sendMessage(inputMessage, false);
        setIsTyping(true);
        textarea.style.height = "auto"; // reset chiều cao
      }
    }
  };

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

  // Nếu người dùng nhập vào đoạn chat lần đầu, thì gửi đoạn chat từ db lên để bot response và lưu vào database
  const [hasSentInitialMessage, setHasSentInitialMessage] = useState(false);

  useEffect(() => {
    // Log dữ liệu data để kiểm tra xem nó đã có giá trị hợp lệ chưa
    console.log("data:", data);

    // Kiểm tra nếu chưa gửi tin nhắn ban đầu và dữ liệu đã sẵn sàng
    if (
      !hasSentInitialMessage &&
      isConnected &&
      client &&
      data?.history?.length > 0 &&
      data.history[0].parts?.[0]?.text
    ) {
      const inputMessage = data.history[0].parts[0].text;
      const isInitialMessage = data?.history?.length == 1;
      console.log("Sending initial message:", inputMessage);

      // Gửi tin nhắn đầu tiên
      sendMessage(inputMessage, isInitialMessage);
      setIsTyping(true);

      // Đánh dấu đã gửi tin nhắn ban đầu
      setHasSentInitialMessage(true);
    }
  }, [isConnected, client, data?.history, hasSentInitialMessage]);

  return (
    <>
      {/* Người dùng tương tác chat, nội dung mới dược hiển thị ở đây */}
      {/* {messages.map((msg, index) => {
        const isUser = msg?.authorId === "user";
        const hasImage = msg?.payload?.block?.img_url;
        const messageText =
          msg.payload?.block?.text || msg.payload?.blocks?.[0]?.block?.text;

        if (hasImage) return null; // Nếu có ảnh, không hiển thị gì cảz

        return (
          <div key={index} className={isUser ? "message user" : "message"}>
            <Markdown>{messageText || ""}</Markdown>
          </div>
        );
      })} */}

      {/* Hiển thị ảnh */}
      {/* {img.isLoading && <div className="">Đang tải...</div>}
      {img.dbData?.filePath && (
        <IKImage
          urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
          path={img.dbData?.filePath}
          width="380"
          transformation={[{ width: "380", height: "auto" }]}
        />
      )} */}
      <div className="endChat" ref={endRef}>
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
                disabled={!isConnected}
                onChange={handleChange}
                value={inputMessage}
                rows={rows}
              ></textarea>
            </div>
            <div className="button_container">
              <Upload
                setImg={setImg}
                setMessages={setMessages}
                isConnected={isConnected}
                client={client}
                data={data}
                setShouldSendToServer={setShouldSendToServer}
              />
              <input
                id="file"
                type="file"
                multiple={false}
                hidden
                disabled={!isConnected}
              ></input>
              <button
                type="submit"
                disabled={!isConnected}
                style={
                  isConnected ? {} : { background: "rgba(117, 117, 117, 0.4)" }
                }
              >
                <img src="/arrow.png" alt=""></img>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default NewPrompt;
