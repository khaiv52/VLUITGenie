import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setDrawer } from "../../redux/actions/drawerActions";

function ChatItemWithMenu({ chat, isActive, onSelect }) {
  const [contextMenu, setContextMenu] = useState(null);

  // Xử lý trạng thái xóa
  const [isDeleting, setIsDeleting] = useState(false);
  //   console.log(chat._id);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Hàm xử lý sự kiện chuột phải để mở menu
  // const handleContextMenu = (event) => {
  //   event.preventDefault();

  //   setContextMenu(
  //     contextMenu === null
  //       ? { mouseX: event.clientX + 2, mouseY: event.clientY - 6 } // vị trí của menu dựa trên vị trí con trỏ chuột
  //       : null
  //   );

  //   // Prevent text selection lost after opening the context menu on Safari and Firefox
  //   const selection = document.getSelection(); // Trả về đối tượng selection (vùng mà người dùng đã bôi đen)
  //   if (selection && selection.rangeCount > 0) {
  //     const range = selection.getRangeAt(0); // range là đoạn từ điểm đầu đến điểm cuói mà người dùng đã bôi đen

  //     setTimeout(() => {
  //       // Thêm delay để đợi gọi sau khi context menu render xong
  //       selection.addRange(range); //  thêm lại vùng chọn ban đầu → khôi phục lại đoạn văn bản bôi đen.
  //     });
  //   }
  // };

  // Dialog xác nhận xóa
  const [openDialog, setOpenDialog] = useState(false);

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
      navigate("/dashboard/chats"); // Điều hướng ngay lập tức về trang tạo chat mới
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
    },
    onError: (error) => {
      console.error("Lỗi khi xóa!", error.message);
    },
  });
  const handleDelete = () => {
    console.log("Đang xóa:", chat._id); // <--- kiểm tra
    setIsDeleting(true); // Bắt đầu trạng thái xóa
    // Gọi hàm mutation để xóa chat
    mutation.mutate(
      { id: chat._id },
      { onSettled: () => setIsDeleting(false) } // Reset trạng thái sau khi xóa xong (thành công hoặc lỗi)
    );
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
        // onContextMenu={handleContextMenu}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "context-menu",
          paddingRight: "8px",
        }}
        className={`listMenu ${isActive ? "active" : ""}`} // Thêm class active nếu isActive là true
      >
        <Link to={`dashboard/chats/${chat._id}`} onClick={handleClick}>
          {chat.title.substring(0, 30) || "Chưa có tiêu đề"}{" "}
        </Link>

        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault(); // Ngăn chuyển hướng khi click icon
            setContextMenu({ mouseX: e.clientX + 2, mouseY: e.clientY - 6 });
          }}
        >
          <MoreHorizIcon fontSize="small" sx={{ color: "var(--icon-color)" }} />
        </IconButton>

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
          <MenuItem
            onClick={() => {
              setOpenDialog(true); // Mở dialog xác nhận xóa
              handleClose(); // Đóng menu
            }}
          >
            <DeleteOutlineIcon sx={{ mr: 1 }} style={{ fontSize: "1rem" }} />
            Xóa
          </MenuItem>
        </Menu>
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogContent>
            Bạn có chắc chắn muốn xóa đoạn chat này không?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="primary">
              Hủy
            </Button>
            <Button
              onClick={() => {
                handleDelete();
                setOpenDialog(false);
              }}
              color="error"
              disabled={isDeleting} // Disable nếu đang xóa
            >
              {isDeleting ? "Đang xóa" : "Xóa"}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
}

export default ChatItemWithMenu;
