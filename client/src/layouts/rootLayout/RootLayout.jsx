import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { Button, Drawer } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import ChatList from "../../components/chatList/ChatList";
import ChatListGuest from "../../components/chatListGuest/ChatListGuest";
import ToggleDarkMode from "../../components/toggleDarkMode/ToggleDarkMode";
import { setDrawer } from "../../redux/actions/drawerActions";
import { toggleMenu } from "../../redux/actions/menuActions";
import DrawerList from "../drawerList/DrawerList";
import "./rootLayout.css";
import ChatIcon from "@mui/icons-material/Chat";

// Create a client
const queryClient = new QueryClient();

function RootLayout() {
  const isDrawerOpen = useSelector((state) => state.drawer.open);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleDrawer = (newOpen) => () => {
    dispatch(setDrawer(newOpen));
  };

  const { isSignedIn } = useUser();

  const [redirectUrl, setRedirectUrl] = useState(null); // Khởi tạo redirectUrl là null

  const cameFromChat = useSelector((state) => state.auth.cameFromChat);

  useEffect(() => {
    // Kiểm tra xem có cameFromChat (true nếu người dùng guest chọn đăng nhập từ chat)
    if (cameFromChat) {
      setRedirectUrl("/dashboard/chats");
    } else {
      setRedirectUrl("/");
    }
  }, [cameFromChat]);

  // const handleToggleDrawer = (open) => () => {
  //   dispatch(setDrawer(open));
  //   dispatch(setMenuOpen(false)); // Đóng menu khi mở drawer
  // };

  // Đóng mở danh sách menu
  const menuOpen = useSelector((state) => state.menu.menuOpen);

  const handleToggle = () => {
    dispatch(toggleMenu());
  };

  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <QueryClientProvider client={queryClient}>
      <div className="rootLayout">
        <header>
          <Link to="/" className="logo">
            <img src="/logoVLU.png" alt="" loading="lazy" />
            <span>VLUITGenie</span>
          </Link>

          <div className="group-control">
            <div className="user">
              <div className="mobile-only">
                <Button
                  sx={{
                    padding: "10px",
                    margin: 0,
                    minWidth: "unset", // Xoá chiều rộng tối thiểu mặc định của Button
                    lineHeight: 1, // Đảm bảo không bị giãn dòng
                    background: "transparent", // Tuỳ chọn: để loại bỏ background mặc định
                  }}
                  onClick={toggleDrawer(true)}
                >
                  <DashboardIcon
                    className="dashboard-icon"
                    // sx={{
                    //   color: "var(--icon-color)",
                    //   "&:hover": {
                    //     color: "var(--icon-hover-color)",
                    //   },
                    //   "&:active": {
                    //     color: "var(--icon-active-color)",
                    //     backgroundColor: "var(--icon-active-bg)",
                    //   },
                    //   fontSize: "20px",
                    // }}
                  />
                </Button>
                <Drawer
                  open={isDrawerOpen}
                  variant="temporary"
                  onClose={toggleDrawer(false)}
                >
                  <DrawerList>
                    <div className="flex items-center justify-between item-group-header">
                      <ToggleDarkMode mobile={true} />
                      <SignedOut>
                        <SignInButton
                          mode="modal"
                          forceRedirectUrl={redirectUrl}
                        >
                          <p className="signInButton">Đăng nhập</p>
                        </SignInButton>
                      </SignedOut>

                      {/* Hiển thị UserButton nếu đã đăng nhập */}
                      <SignedIn>
                        <UserButton />
                      </SignedIn>
                    </div>
                    {/* Hiển thị SignInButton nếu chưa đăng nhập */}

                    {/* Hiển thị UserButton nếu đã đăng nhập */}
                    {isSignedIn ? <ChatList /> : <ChatListGuest />}
                  </DrawerList>
                </Drawer>
              </div>

              <div className="desktop-only">
                {!isHomePage && (
                  <div className="menu-header">
                    <button
                      className={`toggle-menu ${menuOpen ? "open" : "closed"}`}
                      onClick={handleToggle}
                    >
                      <DashboardIcon />
                    </button>
                  </div>
                )}
                {isHomePage && (
                  <div className="menu-header">
                    <button
                      className={`toggle-menu ${menuOpen ? "open" : "closed"}`}
                      onClick={() => navigate("/dashboard/chats")}
                    >
                      <ChatIcon />
                    </button>
                  </div>
                )}
                <ToggleDarkMode />
                {/* Hiển thị SignInButton nếu chưa đăng nhập */}
                <SignedOut>
                  <SignInButton mode="modal" forceRedirectUrl={redirectUrl}>
                    <p className="signInButton">Đăng nhập</p>
                  </SignInButton>
                </SignedOut>

                {/* Hiển thị UserButton nếu đã đăng nhập */}
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </div>
        </header>
        <main className="content-container">
          <Outlet />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default RootLayout;
