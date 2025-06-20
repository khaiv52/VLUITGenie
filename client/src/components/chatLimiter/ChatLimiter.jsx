import { Alert, AlertTitle, Box, IconButton, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, { useState } from "react";

function ChatLimiter({
  maxCount = 5,
  currentCount = 0,
  onSend,
  disabled,
}) {
  const [open, setOpen] = useState(true);
  const isLimitReached = currentCount >= maxCount;

  if (!isLimitReached || !open) return null;

  return (
    <Box sx={{ mt: 2, position: "relative" }}>
      <Alert
        severity="warning"
        sx={{ mb: 2, pr: 10, position: "relative" }}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => setOpen(false)}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <AlertTitle>Giới hạn trò chuyện</AlertTitle>
        Bạn đã đạt đến giới hạn {maxCount} lượt chat. Vui lòng đăng nhập để tiếp
        tục.
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={onSend}
            disabled={disabled}
          >
            Đoạn chat mới
          </Button>
        </Box>
      </Alert>
    </Box>
  );
}

export default ChatLimiter;
