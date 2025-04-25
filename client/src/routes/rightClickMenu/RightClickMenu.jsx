import { Menu, MenuItem, Typography } from "@mui/material";
import { useState } from "react";

const RightClickMenu = () => {
  const [contextMenu, setContextMenu] = useState(null);

  const handleContextMenu = (event) => {
    event.preventDefault();

    setContextMenu(
      contextMenu === null
        ? { mouseX: event.clientX + 2, mouseY: event.clientY - 6 } // vị trí của menu dựa trên vị trí con trỏ chuột
        : null
    );

    // Prevent text selection lost after opening the context menu on Safari and Firefox
    const selection = document.getSelection(); // Trả về đối tượng selection (vùng mà người dùng đã bôi đen)
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0); // range là đoạn từ điểm đầu đến điểm cuói mà người dùng đã bôi đen

      setTimeout(() => { // Thêm delay để đợi gọi sau khi context menu render xong
        selection.addRange(range); //  thêm lại vùng chọn ban đầu → khôi phục lại đoạn văn bản bôi đen.
      });
    }
  };

  const handleClose = () => {
    setContextMenu(null);
  };
  return (
    <>
      <div onContextMenu={handleContextMenu} style={{ cursor: "context-menu" }}>
        <Typography>Danh sách giảng viên thỉnh giảng</Typography>

        <Menu
          open={contextMenu != null}
          onClose={handleClose}
          anchorReference="anchorPosition" // Định vị toạ độ hiển thị theo anchorPosition
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          <MenuItem onClick={handleClose}>Xóa</MenuItem>
          {/* <MenuItem onClick={handleClose}>Đổi tên</MenuItem> */}
        </Menu>
      </div>
    </>
  );
};

export default RightClickMenu;
