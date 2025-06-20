import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { IKImage } from "imagekitio-react";
import React, { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import NewPrompt from "../../components/newPrompt/NewPrompt";
import ChatSearchDialog from "../../components/searchDialog/SearchDialog";
import "./chatPage.css";
import { checkAuthStatus } from "../../redux/actions/authActions";

function ChatPage() {
  const path = useLocation().pathname;
  const chatId = path.split("/").pop(); // Lấy id từ đường dẫn
  const navigate = useNavigate();
  const { isGuest } = useSelector((state) => state.auth); // Lấy trạng thái guest từ Redux store
  const { isSignedIn } = useAuth(); // Lấy trạng thái đăng nhập từ Clerk
  console.log("Guest status:", isGuest);
  console.log("Signed in status:", isSignedIn);

  const dispatch = useDispatch();
  // Tạo trạng thái gõ của chatbot
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Khi người dùng vào trang chat, gọi làm hàm api/auth để xác định trạng thái đăng nhập
    dispatch(checkAuthStatus());
  }, [dispatch]);

  const apiPath =
    isGuest && !isSignedIn
      ? `/api/guest/chats/${chatId}`
      : `/api/chats/${chatId}`;

  console.log(apiPath);

  const { isPending, error, data, refetch } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}${apiPath}`, {
        // credentials trong fetch: Yêu cầu trình duyệt gửi cookie
        // hoặc thông tin xác thực đến backend.
        credentials: "include",
      })
        .then((res) => {
          console.log("Response status:", res.status); // Kiểm tra mã trạng thái
          return res.json();
        })
        .then((data) => {
          console.log("Response data:", data); // Kiểm tra dữ liệu trả về
          return data;
        }),
  });

  console.log(data);

  // Xư lý sự kiện cuộn (hiển thị nút)
  const chatRef = useRef(null);
  const endRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const chatDiv = chatRef.current;

    const handleScroll = () => {
      if (!chatDiv) return;
      const { scrollTop, scrollHeight, clientHeight } = chatDiv;

      setShowScrollButton(scrollTop + clientHeight < scrollHeight - 50);
    };

    chatDiv?.addEventListener("scroll", handleScroll);
    return () => chatDiv?.removeEventListener("scroll", handleScroll);
  }, []);

  // Lắng nghe phản hồi của bot để tắt isTyping
  useEffect(() => {
    const lastMessage = data?.history?.[data.history.length - 1];
    if (lastMessage?.role === "model") {
      setIsTyping(false);
    }
  }, [data]);

  // Xử lý sự kiện người dùng guest nhấn f5 để làm mới trang
  useEffect(() => {
    // Nếu là guest và người dùng reload trang (F5), điều hướng về trang danh sách chat
    // Chỉ xử lý khi trạng thái đăng nhập đã xác định (isSignedIn là true/false)
    if (
      typeof isSignedIn === "boolean" &&
      isGuest &&
      !isSignedIn &&
      performance.getEntriesByType("navigation")[0]?.type === "reload"
    ) {
      navigate("/dashboard/chats");
    }
  }, [isGuest, isSignedIn, navigate]);

  useEffect(() => {
    if (
      // Khi người dùng đăng nhập, reload trang tự động gọi lại dữ liệu chat
      // Chỉ thực hiện khi trạng thái đăng nhập đã xác định
      typeof isSignedIn === "boolean" &&
      performance.getEntriesByType("navigation")[0]?.type === "reload"
    ) {
      refetch();
    }
  }, [isSignedIn, refetch]);

  // Nếu chatId không tồn tại hoặc không thuộc user hiện tại, backend sẽ trả về 404.
  // điều hướng người dùng về /dashboard/chats:
  useEffect(() => {
    // Chỉ điều hướng nếu chắc chắn là không tìm thấy chat (ví dụ, trả về 404 từ backend).
    if (!isPending && error && error.status === 404) {
      navigate("/dashboard/chats");
    }
  }, [isPending, error, navigate]);

  return (
    <div className="chatPage">
      <div className="wrapper" ref={chatRef}>
        <div className="chat">
          {isPending
            ? "Loading..."
            : !data
            ? "Chưa có cuộc trò chuyện nào"
            : error
            ? "Có lỗi xảy ra"
            : data?.history?.map((message, i) => (
                <React.Fragment key={i}>
                  {message?.img && (
                    <IKImage
                      urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                      path={message.img}
                      height={300}
                      width={400}
                      transformation={[{ height: 300, width: 400 }]}
                      loading="lazy"
                      lqip={{ active: true, quality: 20 }}
                    />
                  )}
                  <div
                    className={
                      message.role === "user" ? "message user" : "message"
                    }
                    key={i}
                  >
                    <Markdown>
                      {message.role === "user"
                        ? message.parts[0]?.text
                        : message.parts[0].text.replace(
                            // Bắt url tương ứng [text](url). VD: [Đại học Văn Lang](https://www.vlu.edu.vn) -> Ký tự được regex bắt: ](https://www.vlu.edu.vn)
                            /(\]\([^)]+?\))\./g,
                            "$1" // Lấy kết quả khớp đầu tiên
                          )}
                    </Markdown>
                  </div>
                </React.Fragment>
              ))}

          {/* Khi bot đang gõ - hiển thị typing indicator */}
          {isTyping && (
            <div className="message">
              <TypeAnimation
                sequence={["Vui lòng đợi phản hồi...", 1000]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                cursor={true}
                style={{
                  fontStyle: "italic",
                  color: "var(--text-color)",
                  display: "inline-block",
                }}
              />
            </div>
          )}

          {/* Nội dung cũ load từ database - (Phương thức GET và hiển thị ở trên) 
              - nội dung tương tác mới được chèn bổ sung trong NewPrompt */}
          {data && (
            <NewPrompt endRef={endRef} data={data} setIsTyping={setIsTyping} />
          )}
          <ChatSearchDialog />
        </div>

        <button
          className={`scrollButton ${showScrollButton ? "show" : "hide"}`}
          onClick={scrollToBottom}
        >
          {/* <ArrowDownwardRounded fontSize="medium" /> */}
          <img className="arrow_image" alt="" src="/arrow.png"></img>
        </button>
      </div>
    </div>
  );
}

export default ChatPage;
