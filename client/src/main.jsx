import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SearchDialog from "./components/searchDialog/SearchDialog.jsx";
import "./index.css";
import DashboardLayout from "./layouts/dashboardLayout/DashboardLayout .jsx";
import RootLayout from "./layouts/rootLayout/RootLayout.jsx";
import store from "./redux/store/store.js";
import ChatPage from "./routes/chatPage/ChatPage.jsx";
import DashboardPage from "./routes/dashboardPage/DashboardPage.jsx";
import HomePage from "./routes/homepage/Homepage.jsx";
import SignInPage from "./routes/signIn/SignInPage.jsx";
import SignUpPage from "./routes/signUp/SignUpPage.jsx";
import { viVN } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/clerk-react";
import StatsDashboard from "./routes/statsDashboard/StatsDashboard.jsx";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

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
            path: "/dashboard/chats",
            element: <DashboardPage />,
          },
          {
            path: "/dashboard/chats/:id",
            element: <ChatPage />,
          },
          {
            path: "/dashboard/stats",
            element: <StatsDashboard />,
          },
        ],
      },
      { path: "/dialog", element: <SearchDialog /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      localization={viVN}
    >
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </ClerkProvider>
  </React.StrictMode>
);
