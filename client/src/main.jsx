import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import DashboardLayout from "./layouts/dashboardLayout/DashboardLayout .jsx";
import RootLayout from "./layouts/rootLayout/RootLayout.jsx";
import ChatPage from "./routes/chatPage/ChatPage.jsx";
import DashboardPage from "./routes/dashboardPage/DashboardPage.jsx";
import HomePage from "./routes/homepage/Homepage.jsx";
import SignInPage from "./routes/signIn/SignInPage.jsx";
import SignUpPage from "./routes/signUp/SignUpPage.jsx";
import RightClickMenu from "./routes/rightClickMenu/RightClickMenu.jsx";
import { Provider } from "react-redux";
import store from "./redux/store/store.js";
import TestTheme from "./components/testTheme/TestTheme.jsx";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/sign-in",
        element: <SignInPage />,
      },
      {
        path: "/sign-up",
        element: <SignUpPage />,
      },
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            path: "/dashboard/chats/:id",
            element: <ChatPage />,
          },
        ],
      },
      {
        path: "/test/theme",
        element: <TestTheme />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
