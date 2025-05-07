import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./chatList.css";
import { useQuery } from "@tanstack/react-query";
import ChatItemWithMenu from "../../routes/chatItemWithMenu/ChatItemWithMenu";
import DrawerList from "../../layouts/drawerList/DrawerList";
import { useMediaQuery } from "@mui/material";
import { setDrawer } from "../../redux/actions/drawerActions";
import { useDispatch } from "react-redux";

function ChatList() {
  const { isLoading, error, data } = useQuery({
    queryKey: ["userChats"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
        // credentials trong fetch: Yêu cầu trình duyệt gửi cookie
        // hoặc thông tin xác thực đến backend.
        credentials: "include",
      }).then((res) => res.json()),
  });
  console.log(data);

  const isMobile = useMediaQuery("(max-width:768px)");
  // Lưu trạng thái click để active class thay màu
  const [selectedChatId, setSelectedChatId] = useState(null);

  const dispatch = useDispatch();
  const closeDrawer = () => {
    dispatch(setDrawer(false));
  };

  return (
    <div className="ChatList">
      {!isMobile && <span className="title">BẢNG ĐIỀU KHIỂN</span>}
      <Link to="/dashboard/chats" className="dashBoardLink" onClick={closeDrawer}>
        Tạo cuộc trò chuyện mới
      </Link>
      <Link to="/" className="dashBoardLink" onClick={closeDrawer}>
        Khám phá VLUITGenie
      </Link>
      <hr />
      <span className="title">CUỘC TRÒ CHUYỆN GẦN ĐÂY</span>{" "}
      <div className="list">
        {isLoading
          ? "Đang tải..."
          : error
          ? "Có lỗi xảy ra"
          : !data || data.length === 0
          ? "Chưa có cuộc trò chuyện nào"
          : data.map((chat) => (
              <ChatItemWithMenu
                key={chat._id}
                chat={chat}
                isActive={selectedChatId === chat._id} // Truyền trạng thái Active
                onSelect={() => setSelectedChatId(chat._id)} // Hàm chọn Item
              />
            ))}
      </div>
      <hr />
    </div>
  );
}

export default ChatList;
