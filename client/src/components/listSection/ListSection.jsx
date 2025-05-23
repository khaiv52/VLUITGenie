import React from "react";
import { useNavigate } from "react-router-dom";
import ChatListItem from "../chatListItem/ChatListItem";
import { List, ListSubheader } from "@mui/material";

const ListSection = ({ title, items, onItemClick }) => {
  const navigate = useNavigate();

  return (
    <List
      subheader={
        <ListSubheader
          disableSticky
          sx={{
            bgcolor: "transparent",
            color: "var(--text-title-dialog-color)",
            fontSize: "var(--fs-super-small)",
            fontWeight: "var(--fw-medium)",
          }}
        >
          {title}
        </ListSubheader>
      }
    >
      {items.map((item) => (
        <ChatListItem
          key={item._id}
          text={item.title}
          onClick={() => {
            navigate(`/dashboard/chats/${item._id}`);
            if(onItemClick) onItemClick(item);
          }}
          isActive={false}
        />
      ))}
    </List>
  );
};

export default ListSection;
