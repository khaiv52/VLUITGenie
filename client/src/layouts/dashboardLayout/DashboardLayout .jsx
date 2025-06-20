// import { useAuth } from "@clerk/clerk-react";
// import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import ChatList from "../../components/chatList/ChatList";

import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ChatListGuest from "../../components/chatListGuest/ChatListGuest";
import ChatSearchDialog from "../../components/searchDialog/SearchDialog";
import { checkAuthStatus } from "../../redux/actions/authActions";
import "./dashboardLayout.css";

function DashboardLayout() {
  // const { userId, isLoaded } = useAuth();
  // const navigate = useNavigate();

  // useEffect(() => {
  //   if (isLoaded && !userId) {
  //     navigate("/sign-in");
  //   }
  // }, [isLoaded, userId, navigate]);

  // if (!isLoaded) {
  //   return "Loading....";
  // }

  // Nếu chưa đăng nhập
  const { isGuest } = useSelector((state) => state.auth);
  // console.log("Người dùng guest: ", isGuest);

  // Kiêm tra nếu đã đăng nhập thì gọi hàm checkAuth để xóa guestId cookies
  const { isSignedIn } = useAuth();
  const dispatch = useDispatch();

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    if (isSignedIn) {
      dispatch(checkAuthStatus());
    }
  }, [dispatch, isSignedIn]);

  // Đóng mở danh sách menu
  const menuOpen = useSelector((state) => state.menu.menuOpen);

  return (
    <div className="dashboardLayout">
      {/* {!isMobile && (
        <div className="menu">{isGuest ? <ChatListGuest /> : <ChatList />}</div>
      )} */}

      <div className="menu-wrapper">

        <div className={`menu ${menuOpen ? "open" : "closed"}`}>
          {isGuest ? (
            <ChatListGuest menuOpen={menuOpen} />
          ) : (
            <ChatList menuOpen={menuOpen} />
          )}
        </div>
      </div>

      <div className="content">
        <Outlet />
      </div>
      <ChatSearchDialog />
    </div>
  );
}

export default DashboardLayout;
