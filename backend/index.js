const express = require("express");
const ImageKit = require("imagekit");
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const chat = require("./models/chat");
const userChats = require("./models/userChats");
const user = require("./models/users");
const {
  clerkClient,
  requireAuth,
  getAuth,
  clerkMiddleware,
} = require("@clerk/express");
const removeVietnameseTones = require("./utils/removeTones");
const cookieParser = require("cookie-parser");
const { getDataRange } = require("./utils/getDateRange");

const port = process.env.PORT || 3000;
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL, // Địa chỉ frontend
    // credentials trong CORS: Cho phép backend chấp nhận cookie
    // hoặc thông tin xác thực từ client.
    credentials: true,
  })
);
app.use(cookieParser()); // dùng cookies (cho guestId)
// Đảm bảo đăng ký middleware Clerk TRƯỚC các route
app.use(clerkMiddleware());

// Middleware để phân tích dữ liệu JSON trong yêu cầu
app.use(express.json());

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Đã kết nối MongoDB");
  } catch (error) {
    console.error("Lỗi trong khi kết nối đến MongoDB:", error);
  }
};

const imagekit = new ImageKit({
  urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
});

// Kiểm tra kết nối API của ImageKit
app.get("/api/upload", (req, res) => {
  const result = imagekit.getAuthenticationParameters(); // Lấy thông tin xác thực
  res.send(result);
});

// app.get("/api/test", requireAuth(), (req, res) => {
//   const { userId } = getAuth(req);
//   console.log(userId);
//   res.send("Success");
// });

// API khởi tạo guestId, chì dành cho người dùng chưa đăng nhập (guest)
app.get("/api/guest/init", (req, res) => {
  // Kiểm tra đã đăng nhập chưa
  let userId = null;
  try {
    userId = getAuth(req)?.userId;
  } catch (e) {
    userId = null;
  }

  if (userId) {
    // Nếu đã đăng nhập thì không cần guestId
    return res.json({ message: "Đã đăng nhập, không cần guestId" });
  }

  let guestId = req.cookies.guestId;
  if (!guestId) {
    guestId = Math.random().toString(36).substring(2);
    res.cookie("guestId", guestId, { maxAge: 1000 * 60 * 60 * 24 * 7 }); // 7 ngày
    return res.json({ guestId, created: true });
  } else {
    res.json({ guestId, created: false });
  }
});

// phương thức xác thực người dùng login (clerk) hay guest
app.get("/api/auth", async (req, res) => {
  try {
    const auth = getAuth(req);
    if (auth && auth.userId) {
      const userInfo = await clerkClient.users.getUser(auth.userId);

      // Xóa guestId cookie nếu đã đăng nhập
      res.clearCookie("guestId", {
        httpOnly: true,
        sameSite: "lax",
      });
      return res.json({
        type: "authenticated",
        userId: auth.userId,
        email: userInfo.emailAddresses?.[0]?.emailAddress || null,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
      });
    } else {
      // Nếu chưa đăng nhập, kiểm tra guestId
      const guestId = req.cookies.guestId;
      if (guestId) {
        return res.json({
          type: "guest",
          guestId,
        });
      } else {
        return res.status(401).json({
          type: "unauthorized",
          message: "Người dùng chưa được kiểm duyệt",
        });
      }
    }
  } catch (error) {
    console.error("Error in /api/auth", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// API lấy danh sách chat của guest (không cần đăng nhập)
// app.get("/api/guestchats", async (req, res) => {
//   const guestId = req.cookies.guestId;
//   if (!guestId) {
//     return res.status(401).json({ message: "GuestId not found in cookie" });
//   }
//   try {
//     const chats = await chat.find({ guestId, guest: true });
//     res.status(200).json(chats);
//   } catch (error) {
//     console.error("Error fetching guest chats:", error);
//     res.status(500).send({ message: "Internal Server Error" });
//   }
// });

// Clerk: Thêm đoạn chat mới vào cơ sở dữ liệu (đã đăng nhập)
app.post("/api/chats", requireAuth(), async (req, res) => {
  try {
    const authData = getAuth(req);
    const userId = authData?.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Người dùng chưa đăng nhập." });
    }

    const { text } = req.body;
    console.log("POST /api/chats", { userId, text });

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ message: "Text là bắt buộc" });
    }

    // Tạo chat mới với userId và guestId
    const newChat = new chat({
      userId,
      history: [{ role: "user", parts: [{ text }] }],
    });

    const savedChat = await newChat.save(); // Lưu chat vào cơ sở dữ liệu

    // Kiểm tra chat của người dùng đã tồn tại hay chưa
    const existingUserChats = await userChats.find({ userId: userId });

    if (!existingUserChats.length) {
      // Nếu chưa có, tạo mới
      const newUserChats = new userChats({
        userId: userId,
        chats: [
          {
            _id: savedChat._id,
            title: text,
          },
        ],
      });
      await newUserChats.save();
    } else {
      // Nếu đã có, thêm chat mới vào danh sách
      await userChats.updateOne(
        { userId: userId },
        {
          $push: {
            chats: {
              _id: savedChat._id,
              title: text,
            },
          },
        }
      );
    }
    res.status(201).send(newChat._id); // Trả về ID của chat mới tạo để client có thể sử dụng
  } catch (error) {
    console.error("Lỗi trong quá trình tạo chat:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Guest: tạo chat mới cho người dùng guest
app.post("/api/chats/guest", async (req, res) => {
  let guestId = req.cookies.guestId;
  if (!guestId) {
    guestId = Math.random().toString(36).substring(2);
    res.cookie("guestId", guestId, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: "Lax",
    }); // hoặc "None" nếu chạy khác domain và dùng HTTPS });
  }

  const { text } = req.body;
  if (!text || typeof text != "string" || !text.trim()) {
    return res.status(400).json({ message: "Input là bắt buộc nhập" });
  }

  try {
    const newChat = new chat({
      guest: true,
      guestId,
      history: [{ role: "user", parts: [{ text }] }],
    });
    const savedChat = await newChat.save();
    res.status(201).json({ id: savedChat._id }); // Gửi về client Id chat mới tạo
  } catch (error) {
    console.error("Lỗi trong khi tạo chat cho người dùng guest:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Clerk: Lấy danh sách chat của người dùng
app.get("/api/userchats", requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  try {
    const existingUserChats = await userChats.find({ userId: userId });
    if (!existingUserChats) {
      // Không có bản ghi, trả về mảng rỗng
      return res.status(200).json([]);
    }
    res.status(200).send(existingUserChats[0].chats);
    console.log(existingUserChats[0].chats);
  } catch (error) {
    console.error("Lỗi khi fetching user chats:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Clerk: Lấy chat theo ID cho người dùng clerk (đã đăng nhập)
app.get("/api/chats/:id", requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  try {
    const existingChat = await chat.findOne({ _id: req.params.id, userId });
    if (!existingChat) {
      return res.status(404).send("User chats not found");
    }
    res.status(200).send(existingChat);
    console.log(existingChat);
  } catch (error) {
    console.error("Lỗi khi fetching chat:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Guest: Lấy chat theo ID cho người dùng guest
app.get("/api/guest/chats/:id", async (req, res) => {
  try {
    const chatId = req.params.id;
    const existingChat = await chat.findOne({ _id: chatId, guest: true });

    if (!existingChat) {
      return res.status(404).send({ message: "Không tìm thấy Guest chat" });
    }
    res.status(200).send(existingChat);
  } catch (error) {
    console.error("Lỗi khi fetching guest chat: ", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Clerk: Cập nhật chat theo ID cho người dùng đã đăng nhập
app.put("/api/chats/:id", requireAuth(), async (req, res) => {
  const chatId = req.params.id;
  const { inputMessage, botResponse, image_url } = req.body;

  try {
    const currentChat = await chat.findById(chatId);
    if (!currentChat || currentChat.guest) {
      return res.status(404).send({
        message:
          "Forbidden: Người dùng chưa đăng nhập hoặc đang là người dùng guest",
      });
    }

    // Nếu là người dùng đã đăng nhập -> Yêu cầu xác thực
    const { userId } = getAuth(req);
    if (!userId || String(currentChat.userId) !== String(userId)) {
      return res
        .status(401)
        .send({ message: "Forbidden: Không phải người sở hữu chat" });
    }

    console.log("Dữ liệu người dùng nhập: ", inputMessage);
    console.log("Phản hồi của chatbot", botResponse);

    // Tạo các mục mới để thêm vào lịch sử
    const newItems = [
      ...(inputMessage
        ? [{ role: "user", parts: [{ text: inputMessage }] }]
        : []),
      ...(image_url ? [{ role: "user", img: image_url }] : []),
      ...(botResponse
        ? [{ role: "model", parts: [{ text: botResponse }] }]
        : []),
    ];

    // Cập nhật lịch sử chat trong cơ sở dữ liệu
    const updatedChat = await chat.updateOne(
      { _id: chatId },
      {
        $push: {
          history: {
            $each: newItems,
          },
        },
      }
    );
    res.status(200).send(updatedChat);
  } catch (error) {
    console.error("Lỗi cập nhật chat:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Guest: cập nhật chat theo ID cho người dùng guest
app.put("/api/chats/guest/:id", async (req, res) => {
  const chatId = req.params.id;
  const { inputMessage, botResponse, image_url } = req.body;

  try {
    const currentChat = await chat.findById(chatId);
    if (!currentChat || !currentChat.guest) {
      return res.status(403).json({
        message:
          "Fobidden: Chat không tồn tại hoặc người dùng không phải guest",
      });
    }

    // Đếm số lần chat của guest
    const guestUserMessagesCount = currentChat.history.filter(
      (item) => item.role === "user"
    ).length;

    if (guestUserMessagesCount >= 5) {
      return res.status(403).json({
        message: "Bạn chỉ được chat tối đa 5 lần khi chưa đăng nhập.",
      });
    }

    const newItems = [
      ...(inputMessage
        ? [{ role: "user", parts: [{ text: inputMessage }] }]
        : []),
      ...(image_url ? [{ role: "user", img: image_url }] : []),
      ...(botResponse
        ? [{ role: "model", parts: [{ text: botResponse }] }]
        : []),
    ];

    const updatedChat = await chat.updateOne(
      { _id: chatId },
      {
        $push: {
          history: {
            $each: newItems,
          },
        },
      }
    );
    res.status(200).send(updatedChat);
  } catch (error) {
    console.error("Lỗi cập nhật guest chat: ", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// Guest: Đếm số lượng chat của get
app.get("/api/chats/guest/:id/count", async (req, res) => {
  const chatId = req.params.id;

  try {
    const currentChat = await chat.findById(chatId);
    if (!currentChat || !currentChat.guest) {
      return res.status(403).json({
        message:
          "Forbidden: Chat không tồn tại hoặc người dùng không phải guest",
      });
    }

    // Đếm số lần chat có role = "user"
    const userMessageCount = currentChat.history.filter(
      (item) => item.role === "user"
    ).length;

    res.status(200).json({ userMessageCount });
    console.log("Đếm số lượng chat của guest:", userMessageCount);
  } catch (error) {
    console.error("Lỗi khi lấy số lượng chat guest: ", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// Clerk: Xóa chat theo ID
app.delete("/api/chats/:id", requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const chatId = req.params.id;

  try {
    const deleteChat = await chat.deleteOne({ _id: chatId, userId });

    if (deleteChat.deletedCount === 0) {
      return res
        .status(400)
        .json({ message: "Chat not found or unauthorized" });
    }

    // Xóa chat trong mảng `userChats.chats`
    await userChats.updateOne(
      { userId },
      { $pull: { chats: { _id: chatId } } }
    );
    res.status(200).json({ message: "chat deleted successfully!" });
  } catch (error) {
    console.error("Error deleting chat");
    res.status(500).send("Internal Server Error");
  }
});

// Tìm kiếm danh sách chat dựa tên từ khóa người dùng nhập
app.get("/api/userchats/search", requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const { keyword } = req.query;
  const normalizeKeyword = removeVietnameseTones(keyword.trim());

  try {
    const userChatsDoc = await userChats.findOne({ userId });
    if (!userChatsDoc) return res.json([]);

    const chatsDoc = await chat.find({ userId });

    const finalResults = [];

    for (const chatDoc of chatsDoc) {
      const chatMeta = userChatsDoc.chats.find(
        (item) => item._id.toString() === chatDoc._id.toString()
      );
      const title = chatMeta?.title || "(Không có tiêu đề)";
      const titleMatched =
        removeVietnameseTones(title).includes(normalizeKeyword);

      // Nếu title khớp → thêm kết quả
      if (titleMatched) {
        finalResults.push({
          _id: chatDoc._id,
          title,
          text: "", // Không có text cụ thể
          createdAt: chatDoc.createdAt,
        });
      }

      // Tìm tất cả các đoạn chat history khớp
      for (const message of chatDoc.history) {
        for (const part of message.parts) {
          if (
            part.text &&
            removeVietnameseTones(part.text).includes(normalizeKeyword)
          ) {
            finalResults.push({
              _id: chatDoc._id,
              title,
              text: part.text,
              createdAt: chatDoc.createdAt,
            });
          }
        }
      }
    }

    res.json(finalResults);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/stats", requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { range, date, month, year } = req.query;

    // Chuyển date từ string về Date object (nếu cần)
    const customDate = date ? new Date(date) : null;

    // Debug xem dữ liệu đến đúng chưa
    console.log({ range, date, month, year });

    if (["daily", "monthly", "yearly"].includes(range) && !customDate) {
      return res.status(400).json({ message: "Missing or invalid date" });
    }

    const { startDate, endDate } = getDataRange(range, customDate); // Lấy khoảng thời gian dựa trên range và customDate

    // Lấy tất cả chat của người dùng trong khoảng thời gian đã chọn
    const chats = await chat.find({
      userId,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Tổng số tin nhắn của người dùng
    const totalUserMessages = chats.reduce(
      (acc, chat) => acc + chat.history.filter((h) => h.role === "user").length,
      0
    );

    // Tổng số tin nhắn của bot
    const totalBotMessages = chats.reduce(
      (acc, chat) =>
        acc + chat.history.filter((h) => h.role === "model").length,
      0
    );

    // Group by day/month/year
    const statsMap = {}; // key là label, value là { userMessages, botMessages }.

    // Group by day/month/year cho tổng số phiên trò chuyện
    const sessionsMap = {}; // key là label, value là số phiên chat

    chats.forEach((chat) => {
      const d = new Date(chat.createdAt);
      let label;

      //  Nếu thống kê theo năm: gộp theo tháng (VD: 2025-06).
      if (range === "yearly") {
        label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
        // Nếu theo tháng: gộp theo ngày (VD: 2025-06-01).
      } else if (range === "monthly") {
        label = d.toISOString().split("T")[0];
        // Nếu theo ngày: gộp theo giờ (VD: 14:00).
      } else if (range === "daily") {
        label = `${d.getHours()}:00`;
      } else {
        // Nếu không phải trong ngày, theo tháng, năm: gộp theo ngày (đối với 7 ngày và 30 ngày gần nhất) (VD: 2025-06-01).
        label = d.toISOString().split("T")[0];
      }

      // Nếu label chưa có trong statsMap, khởi tạo một record mới.
      if (!statsMap[label]) {
        statsMap[label] = { date: label, userMessages: 0, botMessages: 0 };
      }

      // Nếu đã có, thì chỉ việc cộng thêm số tin nhắn.

      // Cộng dồn số lượng tin nhắn của người dùng
      statsMap[label].userMessages += chat.history.filter(
        (h) => h.role === "user"
      ).length;

      // Cộng dồn số lượng tin nhắn của bot
      statsMap[label].botMessages += chat.history.filter(
        (h) => h.role === "model"
      ).length;

      if (!sessionsMap[label]) {
        // sessionsMap dùng để đếm số phiên chat
        sessionsMap[label] = 0; // Khởi tạo số phiên chat cho label này
      }
      sessionsMap[label] += 1; // Tăng số phiên chat cho label này
    });

    // Chuyển đổi object statsMap thành mảng và sắp xếp theo ngày
    const dailyStats = Object.values(statsMap).sort(
      (a, b) => new Date(a.date) - new Date(b.date) // Sắp xếp theo ngày tăng dần
    );

    // chuyển đổi sessionsStats để phù hợp với định dạng trả về
    const sessionsStats = Object.entries(sessionsMap)
      .map(([date, count]) => ({
        date,
        sessions: count,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      totalUserMessages,
      totalBotMessages,
      dailyStats,
      sessionsStats,
      startDate,
      endDate,
    });
  } catch (err) {
    console.error("Error in stats route:", err.message);
    res.status(400).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log("Server chạy trên port 3000");
  connect();
});
