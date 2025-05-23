import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { viVN } from "@clerk/localizations";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { Button, Drawer } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { Link, matchPath, Outlet, useLocation } from "react-router-dom";
import ChatList from "../../components/chatList/ChatList";
import { setDrawer, setOpenDialog } from "../../redux/actions/drawerActions";
import DrawerList from "../drawerList/DrawerList";
import "./rootLayout.css";
import ToggleDarkMode from "../../components/toggleDarkMode/ToggleDarkMode";
import SearchIcon from "@mui/icons-material/Search";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

// Create a client
const queryClient = new QueryClient();

function RootLayout() {
  const isDrawerOpen = useSelector((state) => state.drawer.open);
  const dispatch = useDispatch();

  const toggleDrawer = (newOpen) => () => {
    dispatch(setDrawer(newOpen));
  };

  // Hàm mở dialog tìm kiếm
  // Hàm này sẽ được gọi khi người dùng nhấn vào biểu tượng tìm kiếm
  const handleOpenSearchDialog = () => {
    dispatch(setOpenDialog(true));
  };

  const location = useLocation();
  const isChatRoute =
    matchPath("/dashboard/chats", location.pathname) ||
    matchPath("/dashboard/chats/:id", location.pathname);

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      localization={viVN}
    >
      <QueryClientProvider client={queryClient}>
        <div className="rootLayout">
          <header>
            <Link to="/" className="logo">
              <img src="./logoVLU.png" alt="" loading="lazy" />
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
                      <div className="flex items-center justify-between">
                        {isChatRoute && (
                          <div
                            className="search"
                            onClick={handleOpenSearchDialog}
                          >
                            <SearchIcon className="search-icon" />
                          </div>
                        )}
                        <ToggleDarkMode />
                      </div>
                      {/* Hiển thị SignInButton nếu chưa đăng nhập */}

                      {/* Hiển thị UserButton nếu đã đăng nhập */}
                      <ChatList />
                    </DrawerList>
                  </Drawer>
                </div>

                <div className="desktop-only">
                  <div className="flex flex-row">
                    {isChatRoute && (
                    <div className="search" onClick={handleOpenSearchDialog}>
                      <SearchIcon className="search-icon" />
                    </div>
                  )}
                  <ToggleDarkMode />
                  </div>
                </div>
                
                {/* Hiển thị SignInButton nếu chưa đăng nhập */}
                <SignedOut>
                  <SignInButton mode="modal" redirectUrl="/dashboard/chats">
                    <p className="signInButton">Đăng nhập</p>
                  </SignInButton>
                </SignedOut>

                {/* Hiển thị UserButton nếu đã đăng nhập */}
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </header>
          <main>
            <Outlet />
          </main>
        </div>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default RootLayout;
