import { ArrowDownwardRounded } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { IKImage } from "imagekitio-react";
import React, { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import { useLocation } from "react-router-dom";
import NewPrompt from "../../components/newPrompt/NewPrompt";
import "./chatPage.css";
import ChatSearchDialog from "../../components/searchDialog/SearchDialog";

function ChatPage() {
  const path = useLocation().pathname;
  const chatId = path.split("/").pop(); // Lấy id từ đường dẫn

  // Tạo trạng thái gõ của chatbot
  const [isTyping, setIsTyping] = useState(false);

  const { isPending, error, data } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
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

  // Nếu không còn tin nhắn nào (userchats bị xóa) thin điều hướng về trang tạo chat mới
  // useEffect(() => {
  //   console.log("Data:", data); // Kiểm tra dữ liệu
  //   if (!data) {
  //     console.log(
  //       "Không còn cuộc trò chuyện nào. Điều hướng về trang tạo mới."
  //     );
  //     navigate("/dashboard/chats"); // Điều hướng về trang tạo chat mới
  //   }
  // }, [data]);

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
                    <Markdown>{message.parts[0]?.text}</Markdown>
                  </div>
                </React.Fragment>
              ))}
          {/* Khi bot đang gõ - hiển thị typing indicator */}
          {isTyping && (
            <div className="message">
              <i>Bot đang gõ...</i>
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
          <img class="arrow_image" alt="" src="/arrow.png"></img>
        </button>
      </div>
    </div>
  );
}

export default ChatPage;
