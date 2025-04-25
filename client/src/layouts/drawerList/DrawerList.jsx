import { Box } from "@mui/material";
import React from "react";
import "./drawerList.css";

function DrawerList({ toggleDrawer, children }) {
  const handleClick = (event) => {
    if (typeof toggleDrawer === "function") {
      toggleDrawer(false)(event); // gọi toggleDrawer nếu tồn tại
    }
  };

  return (
    <div className="drawerList">
      <Box width={250} role="presentation" onClick={handleClick}>
        {children}
      </Box>
    </div>
  );
}

export default DrawerList;
