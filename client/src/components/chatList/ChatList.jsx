import HomeIcon from "@mui/icons-material/Home";
import InsertCommentIcon from "@mui/icons-material/InsertComment";
import SearchIcon from "@mui/icons-material/Search";
import { useMediaQuery } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setDrawer, setOpenDialog } from "../../redux/actions/drawerActions";
import ChatItemWithMenu from "../../routes/chatItemWithMenu/ChatItemWithMenu";
import BarChartIcon from "@mui/icons-material/BarChart";

import "./chatList.css";
import { groupChatsByTime } from "../../utils/groupChatsByTime";

function ChatList({ menuOpen }) {
  const navigate = useNavigate();

  const { isLoading, error, data } = useQuery({
    queryKey: ["userChats"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
        // credentials trong fetch: Yêu cầu trình duyệt gửi cookie
        // hoặc thông tin xác thực đến backend.
        credentials: "include",
      });
      if (!res.ok) {
        // Ném lỗi để react-query nhận biết lỗi HTTP hay userChats rỗng
        throw new Error("Phản hồi network có vấn đề");
      }
      return res.json();
    },
  });
  console.log(data);

  const isMobile = useMediaQuery("(max-width:768px)");
  // Lưu trạng thái click để active class thay màu
  const [selectedChatId, setSelectedChatId] = useState(null);

  const dispatch = useDispatch();
  const closeDrawer = () => {
    dispatch(setDrawer(false));
  };

  // Hàm mở dialog tìm kiếm
  // Hàm này sẽ được gọi khi người dùng nhấn vào biểu tượng tìm kiếm
  const handleOpenSearchDialog = () => {
    dispatch(setOpenDialog(true));
  };

  return (
    <div className="ChatList">
      {isMobile || (menuOpen && <span className="title">BẢNG ĐIỀU KHIỂN</span>)}
      <Link to="/" className="dashboard-link" onClick={closeDrawer}>
        <HomeIcon />
        {(isMobile || menuOpen) && <span>Khám phá VLUITGenie</span>}
      </Link>
      <Link
        to="/dashboard/chats"
        className="dashboard-link"
        onClick={closeDrawer}
      >
        <InsertCommentIcon />
        {(isMobile || menuOpen) && <span>Tạo cuộc trò chuyện mới</span>}
      </Link>
      <div className="dashboard-link" onClick={handleOpenSearchDialog}>
        <SearchIcon className="search-icon" />
        {(isMobile || menuOpen) && <span>Tìm kiếm đoạn chat</span>}
      </div>
      <div
        className="dashboard-link"
        onClick={() => {
          navigate("/dashboard/stats");
        }}
      >
        <BarChartIcon />
        {(isMobile || menuOpen) && <span>Thống kê</span>}
      </div>
      {(isMobile || menuOpen) && <hr />}
      {(isMobile || menuOpen) && (
        <span className="title">CUỘC TRÒ CHUYỆN</span>
      )}
      {(isMobile || menuOpen) && (
        <div className="list">
          {isLoading ? (
            <p>Đang tải...</p>
          ) : error ? (
            <p>Có lỗi xảy ra</p>
          ) : !data || data.length === 0 ? (
            <p>Chưa có cuộc trò chuyện nào</p>
          ) : (
            <>
              {Object.entries(groupChatsByTime(data)).map(
                ([section, chats]) => {
                  if (!Array.isArray(chats)) return null; // Bỏ qua months/years (đối tượng) lúc này
                  if (chats.length == 0) return null;
                  return (
                    <div key={section}>
                      <h4 className="section-title">{section}</h4>
                      {chats.map((chat) => (
                        <ChatItemWithMenu
                          key={chat._id}
                          chat={chat}
                          isActive={selectedChatId === chat._id} // Truyền trạng thái Active
                          onSelect={() => setSelectedChatId(chat._id)} // Hàm chọn Item
                        />
                      ))}
                    </div>
                  );
                }
              )}

              {/* Hiển thị theo tháng cụ thể */}
              {Object.entries(groupChatsByTime(data).months).map(
                ([monthLabel, chats]) =>
                  chats.length > 0 && (
                    <div key={monthLabel}>
                      <h4 className="section-title">{monthLabel}</h4>
                      {chats.map((chat) => (
                        <ChatItemWithMenu
                          key={chat._id}
                          chat={chat}
                          isActive={selectedChatId === chat._id}
                          onSelect={() => setSelectedChatId(chat._id)}
                        />
                      ))}
                    </div>
                  )
              )}

              {/* Năm cũ */}
              {Object.entries(groupChatsByTime(data).years).map(
                ([year, chats]) =>
                  chats.length > 0 && (
                    <div key={year}>
                      <h4 className="section-title">Năm {year}</h4>
                      {chats.map((chat) => (
                        <ChatItemWithMenu
                          key={chat._id}
                          chat={chat}
                          isActive={selectedChatId === chat._id}
                          onSelect={() => setSelectedChatId(chat._id)}
                        />
                      ))}
                    </div>
                  )
              )}
            </>
          )}
        </div>
      )}
      {(isMobile || menuOpen) && <hr />}
    </div>
  );
}

export default ChatList;
