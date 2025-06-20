import { useMediaQuery } from "@mui/material";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { setDrawer } from "../../redux/actions/drawerActions";
import "./chatListGuest.css";
import HomeIcon from "@mui/icons-material/Home";
import InsertCommentIcon from "@mui/icons-material/InsertComment";
import { useEffect } from "react";
import { setMenuOpen } from "../../redux/actions/menuActions";

function ChatListGuest({ menuOpen }) {
  const isMobile = useMediaQuery("(max-width:768px)");
  const dispatch = useDispatch();
  const closeDrawer = () => {
    dispatch(setDrawer(false));
  };

  //
  useEffect(() => {
  dispatch(setMenuOpen(!isMobile)); // Mở menu nếu không phải là thiết bị di động
    // Nếu là thiết bị di động, đóng menu
  }, [isMobile, dispatch]);

  return (
    <div className="ChatList">
      {isMobile || menuOpen && <span className="title">BẢNG ĐIỀU KHIỂN</span>}
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
    </div>
  );
}

export default ChatListGuest;
