import { Menu, MenuItem } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setDrawer } from "../../redux/actions/drawerActions";

function ChatItemWithMenu({ chat, isActive, onSelect }) {
  const [contextMenu, setContextMenu] = useState(null);

  //   console.log(chat._id);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

      setTimeout(() => {
        // Thêm delay để đợi gọi sau khi context menu render xong
        selection.addRange(range); //  thêm lại vùng chọn ban đầu → khôi phục lại đoạn văn bản bôi đen.
      });
    }
  };

  const mutation = useMutation({
    mutationFn: ({ id }) => {
      console.log("Gửi request DELETE tới:", id);
      return fetch(`${import.meta.env.VITE_API_URL}/api/chats/${id}`, {
        method: "DELETE",
        credentials: "include", // luôn gửi cookie, kể cả cross-origin
        headers: {
          "Content-type": "application/json",
        },
      }).then(async (res) => {
        const data = await res.json();
        console.log("Phản hồi từ server:", data);
      });
    },
    onSuccess: async () => {
      // Lấy danh sách mới sau khi xóa thành công
      console.log("Xóa thành công! Tải lại danh sách...");
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Không thể lấy danh sách chat");

        const userChats = res.json();
        const chats = userChats.chats;
        const lastChat = chats[chats.length - 1];

        if (lastChat) {
          console.log("Chuyển tới đoạn chat cuối: ", lastChat._id);
          navigate(`/dashboard/chats/${lastChat._id}`);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách chat: ", error.message);
      }
    },
    onError: (error) => {
      console.error("Lỗi khi xóa!", error.message);
    },
  });
  const handleDelete = () => {
    console.log("Đang xóa:", chat._id); // <--- kiểm tra
    mutation.mutate({ id: chat._id });
    setContextMenu(null);
  };

  // Hàm đóng menu
  const handleClose = () => {
    setContextMenu(null);
  };

  const dispatch = useDispatch();

  // hàm xử lý click item thì đóng drawer
  const handleClick = () => {
    onSelect();
    dispatch(setDrawer(false));
  };
  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        style={{ cursor: "context-menu" }}
        className="listMenu"
      >
        <Link
          to={`dashboard/chats/${chat._id}`}
          onClick={handleClick}
          className={isActive ? "active" : ""}
        >
          {chat.title}
        </Link>

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
          <MenuItem onClick={handleDelete}>Xóa</MenuItem>
          {/* <MenuItem onClick={handleClose}>Đổi tên</MenuItem> */}
        </Menu>
      </div>
    </>
  );
}

export default ChatItemWithMenu;
