import { useAuth } from "@clerk/clerk-react";
import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import ChatList from "../../components/chatList/ChatList";
import { useMediaQuery } from "@mui/material";

import "./dashboardLayout.css";
import { Search } from "@mui/icons-material";
import ChatSearchDialog from "../../components/searchDialog/SearchDialog";

function DashboardLayout() {
  const { userId, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !userId) {
      navigate("/sign-in");
    }
  }, [isLoaded, userId, navigate]);

  const isMobile = useMediaQuery("(max-width:768px");

  if (!isLoaded) {
    return "Loading....";
  }

  return (
    <div className="dashboardLayout">
      {!isMobile && (
        <div className="menu">
          <ChatList />
        </div>
      )}
      <div className="content">
        <Outlet />
      </div>
      <ChatSearchDialog />
    </div>
  );
}

export default DashboardLayout;
