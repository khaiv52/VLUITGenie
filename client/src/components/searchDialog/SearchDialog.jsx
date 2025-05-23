import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Box,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useDispatch, useSelector } from "react-redux";
import { setOpenDialog } from "../../redux/actions/drawerActions";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ListSection from "../listSection/ListSection";
import { isSameDay, now, today, yesterday } from "../../utils/dateFilters";
import { getAllUserChats } from "../../redux/actions/chatActions";

export default function ChatSearchDialog() {
  const open = useSelector((state) => state.dialog.openDialog);

  // Lấy ra toàn bộ danh sách chat
  const allChats = useSelector((state) => state.userChat.allChats);

  console.log("Tất cả chat: ", allChats);

  // Khởi tạo keyword lấy từ input của người dùng
  const [keyword, setKeyword] = useState("");
  const [debounceKeyword, setDebouncedKeyword] = useState("");

  const dispatch = useDispatch();

  // Hàm đóng dialog dựa trên trạng thái open (redux)
  const handleClose = () => {
    dispatch(setOpenDialog(false));
  };

  // Chỉ fetch 1 lần khi component mount.
  useEffect(() => {
    dispatch(getAllUserChats());
  }, [dispatch]);

  // Debounce keyword để tránh gọi API liên tục
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [keyword]);

  // Fetch list danh sách chat dựa trên từ khóa người dùng nhập
  // Lọc theo hôm nay, ngày trước và 7 ngày trước đó
  const { data: searchResults = [], isLoading = false } = useQuery({
    queryKey: ["searchChats", debounceKeyword],
    queryFn: async () => {
      if (!debounceKeyword) return [];
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/userchats/search?keyword=${encodeURIComponent(debounceKeyword)}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!debounceKeyword, // Chỉ fetch khi có từ khóa
    keepPreviousData: true,
  });

  console.log("searchResults", searchResults);
  console.log("isLoading", isLoading);

  // Nếu có từ khóa người dùng nhập (debounceKeyword thì lấy ngược lại hiển thị toàn bộ danh sách chat)
  const sourceChats = debounceKeyword ? searchResults : allChats;

  // Lấy các mục chat có ngày tạo là hôm nay
  const todayItems = sourceChats.filter((item) =>
    isSameDay(item.createdAt, today)
  );

  // Lấy các mục chat có ngày tạo là hôm qua
  const yesterdayItems = sourceChats.filter((item) =>
    isSameDay(item.createdAt, yesterday)
  );

  // Lấy các mục chat có ngày tạo tính từ 7 ngày trước (ngoại trừ hôm nay và hôm qua)
  const last7DaysItems = sourceChats.filter((item) => {
    const date = new Date(item.createdAt);
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays > 1 && diffDays <= 7;
  });

  return (
    <Box>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              // backgroundColor: "#2c2937", // dark mode bg
              backgroundColor: "var(--bg-dashboard)", // dark mode bg
              color: "var(--text-color)", // dark mode text color
            },
          },
        }}
      >
        <DialogTitle sx={{ position: "relative" }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm đoạn chat..."
            variant="standard"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            slotProps={{
              input: {
                sx: { color: "var(--text-color)" },
                disableUnderline: true,
              },
            }}
          />
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "var(--icon-color)",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider sx={{ bgcolor: "var(--divider-color)" }} />
        <DialogContent
          sx={{
            maxHeight: 400,
            overflowY: "auto",
            pt: 0,
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "var(--scrollbar-thumb-color)",
              borderRadius: "4px",
              minHeight: "24px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "var(--scrollbar-track-color)",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "var(--scrollbar-thumb-hover-color)",
            },
          }}
        >
          {/* <List
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
                Hôm nay
              </ListSubheader>
            }
          >
            {[
              "Tạo mũi tên trắng",
              "Tư vấn tuyển sinh 2",
              "Test trong Visual Studio",
            ].map((text) => (
              <ListItem
                button
                key={text}
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
            ))}
          </List>

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
                Hôm qua
              </ListSubheader>
            }
          >
            {["Tạo màu shadow tương tự", "Tạo mũi tên trắng"].map((text) => (
              <ListItem
                button
                key={text}
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
            ))}
          </List>

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
                7 ngày trước đó
              </ListSubheader>
            }
          >
            {["Tạo màu shadow tương tự", "Tạo mũi tên trắng"].map((text) => (
              <ListItem
                button
                key={text}
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
            ))}
          </List> */}

          <ListSection
            title="Hôm nay"
            items={todayItems}
            onItemClick={() => dispatch(setOpenDialog(false))}
          />
          <ListSection
            title="Hôm qua"
            items={yesterdayItems}
            onItemClick={() => dispatch(setOpenDialog(false))}
          />
          <ListSection
            title="7 ngày trước đó"
            items={last7DaysItems}
            onItemClick={() => dispatch(setOpenDialog(false))}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
