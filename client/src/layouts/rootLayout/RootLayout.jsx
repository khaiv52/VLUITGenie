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
import { Link, Outlet } from "react-router-dom";
import ChatList from "../../components/chatList/ChatList";
import { setDrawer } from "../../redux/actions/drawerActions";
import DrawerList from "../drawerList/DrawerList";
import "./rootLayout.css";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

// Create a client
const queryClient = new QueryClient();

// Set trạng thái thanh drawer khi click vào item con hoặc click ngoài

function RootLayout() {
  const isDrawerOpen = useSelector((state) => state.drawer.open);
  const dispatch = useDispatch();

  const toggleDrawer = (newOpen) => () => {
    dispatch(setDrawer(newOpen));
  };

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
              <div className="mobile-only">
                <Button onClick={toggleDrawer(true)}>
                  <DashboardIcon
                    sx={{
                      backgroundColor: "black",
                      color: "white",
                      "&hover": {
                        backgroundColor: "#f0f0f0",
                      },
                      fontSize: "20px",
                    }}
                  />
                </Button>
                <Drawer
                  open={isDrawerOpen}
                  variant="temporary"
                  onClose={toggleDrawer(false)}
                >
                  <DrawerList>
                    <ChatList />
                  </DrawerList>
                </Drawer>
              </div>
              <div className="user">
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
