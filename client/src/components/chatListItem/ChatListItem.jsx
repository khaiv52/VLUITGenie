import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

const ChatListItem = ({ text, onClick, isActive }) => {
  return (
    <ListItem
      button
      onClick={onClick}
      selected={isActive}
      sx={{
        cursor: "pointer",
        ":hover": {
          backgroundColor: "var(--icon-hover-bg)",
          transition: "background-color 0.3s ease",
          "& .MuiListItemText-primary": {
            color: "var(--text-dialog-hover-color)",
          },
          "& .MuiListItemIcon-root": {
            color: "var(--icon-dialog-hover-color)",
          },
        },
        ":active": {
          backgroundColor: "var(--icon-active-bg)",
          transition: "background-color 0.3s ease",
        },
      }}
    >
      <ListItemIcon
        sx={{
          color: "var(--icon-dialog-color)",
          fontWeight: "var(--fw-small)",
          fontSize: "var(--fs-medium)",
          minWidth: 40,
        }}
      >
        <ChatBubbleOutlineIcon />
      </ListItemIcon>
      <ListItemText
        primary={text}
        slotProps={{
          primary: {
            color: "var(--text-dialog-color)",
            fontSize: "var(--fs-super-small)",
          },
        }}
      />
    </ListItem>
  );
};

export default ChatListItem;
