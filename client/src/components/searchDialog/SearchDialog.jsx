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
import { Fragment, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ListSection from "../listSection/ListSection";
import { isSameDay, now, today, yesterday } from "../../utils/dateFilters";
import { getAllUserChats } from "../../redux/actions/chatActions";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { highlightMatch } from "../../utils/highlightMatch";

export default function ChatSearchDialog() {
  const open = useSelector((state) => state.dialog.openDialog);
  const { isGuest } = useSelector((state) => state.auth);
  const { user, isSignedIn } = useUser();

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
    if (!isGuest && isSignedIn && user) {
      dispatch(getAllUserChats());
    }
  }, [dispatch, isGuest, isSignedIn, user]);

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

  // Lấy các mục chat có ngày tạo là hôm nay
  const todayItems = allChats.filter((item) =>
    isSameDay(item.createdAt, today)
  );

  // Lấy các mục chat có ngày tạo là hôm qua
  const yesterdayItems = allChats.filter((item) =>
    isSameDay(item.createdAt, yesterday)
  );

  // Lấy các mục chat có ngày tạo tính từ 7 ngày trước (ngoại trừ hôm nay và hôm qua)
  const last7DaysItems = allChats.filter((item) => {
    const date = new Date(item.createdAt);
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays > 1 && diffDays <= 7;
  });

  const navigate = useNavigate();

  console.log("todayItems", todayItems);
  console.log("yesterdayItems", yesterdayItems);
  console.log("last7DaysItems", last7DaysItems);

  // Nhóm kết quả theo _id
  const groupedResults = searchResults.reduce((acc, item) => {
    if (!acc[item._id]) {
      acc[item._id] = {
        title: item.title,
        createdAt: item.createdAt,
        texts: [],
      };
    }
    if (item.text && item.text.trim() !== "") {
      acc[item._id].texts.push(item.text);
    }
    return acc;
  }, {});

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
          {debounceKeyword ? (
            isLoading ? (
              <Box sx={{ textAlign: "center", py: 2 }}>
                <p>Đang tìm kiếm...</p>
              </Box>
            ) : searchResults.length === 0 ? (
              <List>
                <ListItem
                  sx={{
                    justifyContent: "center",
                    color: "var(--text-secondary-color)",
                    fontStyle: "italic",
                    pointerEvents: "none",
                  }}
                >
                  Không tìm thấy kết quả nào.
                </ListItem>
              </List>
            ) : searchResults.length > 0 ? (
              <List>
                {Object.entries(groupedResults).map(([id, group]) =>
                  group.texts.length === 0 ? (
                    // Trường hợp chỉ có title, không có text
                    <ListItem
                      key={id}
                      button
                      onClick={() => {
                        handleClose();
                        navigate(`/dashboard/chats/${id}`);
                        dispatch(setOpenDialog(false));
                      }}
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
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{ color: "var(--icon-dialog-color)", minWidth: 40 }}
                      >
                        <ChatBubbleOutlineIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={highlightMatch(
                          group.title || "Cuộc trò chuyện mới",
                          debounceKeyword
                        )}
                      />
                    </ListItem>
                  ) : (
                    // Trường hợp có nhiều đoạn text cho cùng một title
                    <Fragment key={id}>
                      <ListSubheader
                        component="div"
                        sx={{
                          backgroundColor: "inherit",
                          fontWeight: "bold",
                          color: "var(--text-color)",
                          fontSize: "var(--fs-small)",
                          position: "static",
                        }}
                      >
                        {group.title || "Cuộc trò chuyện mới"}
                      </ListSubheader>
                      {group.texts.map((text, index) => (
                        <ListItem
                          key={`${id}-${index}`}
                          button
                          onClick={() => {
                            handleClose();
                            navigate(`/dashboard/chats/${id}`);
                            dispatch(setOpenDialog(false));
                          }}
                          sx={{
                            cursor: "pointer",
                            pl: 4,
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
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              color: "var(--icon-dialog-color)",
                              minWidth: 40,
                            }}
                          >
                            <ChatBubbleOutlineIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={highlightMatch(
                              text.length > 100
                                ? `${text.slice(0, 100)}...`
                                : text,
                              debounceKeyword
                            )}
                          />
                        </ListItem>
                      ))}
                    </Fragment>
                  )
                )}
              </List>
            ) : (
              <Box sx={{ textAlign: "center", py: 2 }}>
                <p>Không có kết quả tìm kiếm.</p>
              </Box>
            )
          ) : (
            <>
              <List>
                <ListItem
                  button
                  onClick={() => {
                    navigate("/dashboard/chats");
                    dispatch(setOpenDialog(false));
                  }}
                  selected={false}
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
                    primary="Tạo cuộc trò chuyện mới"
                    slotProps={{
                      primary: {
                        color: "var(--text-dialog-color)",
                        fontSize: "var(--fs-super-small)",
                      },
                    }}
                  />
                </ListItem>
              </List>

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
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
