const express = require("express");
const ImageKit = require("imagekit");
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const chat = require("./models/chat");
const userChats = require("./models/userChats");
const user = require("./models/users");
const { clerkClient, requireAuth, getAuth } = require("@clerk/express");

const port = process.env.PORT || 3000;
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    // credentials trong CORS: Cho phép backend chấp nhận cookie
    // hoặc thông tin xác thực từ client.
    credentials: true,
  })
);

app.use(express.json());

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

const imagekit = new ImageKit({
  urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
});

app.get("/api/upload", (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  res.send(result);
});

app.get("/api/test", requireAuth(), (req, res) => {
  const { userId } = getAuth(req);
  console.log(userId);
  res.send("Success");
});

app.post("/api/chats", requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const { text } = req.body;
  try {
    // Tạo chat mới
    const newChat = new chat({
      userId: userId,
      history: [{ role: "user", parts: [{ text }] }],
    });

    const savedChat = await newChat.save();

    // Kiểm tra chat của người dùng đã tồn tại hay chưa
    const existingUserChats = await userChats.find({ userId: userId });

    // Nếu chat của người dùng chưa tồn tại, tạo mới
    if (!existingUserChats.length) {
      const newUserChats = new userChats({
        userId: userId,
        chats: [
          {
            _id: savedChat._id,
            title: text.substring(0, 30) + "...",
          },
        ],
      });
      await newUserChats.save();
    } else {
      // Nếu chat của người dùng đang tồn tại, thêm chat mới vào danh sách
      await userChats.updateOne(
        { userId: userId },
        {
          $push: {
            chats: {
              _id: savedChat._id,
              title: text.substring(0, 40) + "...",
            },
          },
        }
      );
    }
    res.status(201).send(newChat._id); // Trả về ID của chat mới tạo để client có thể sử dụng
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/userchats", requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  try {
    const existingUserChats = await userChats.find({ userId: userId });
    if (!existingUserChats) {
      return res.status(404).send("User chats not found");
    }
    res.status(200).send(existingUserChats[0].chats);
    console.log(existingUserChats[0].chats);
  } catch (error) {
    console.error("Error fetching user chats:", error);
    res.status(500).send("Internal Server Error");
  }
});

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
    console.error("Error fetching chat:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.put("/api/chats/:id", requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);

  const { inputMessage, botResponse, image_url } = req.body;

  console.log("Dữ liệu người dùng nhập: ", inputMessage);
  console.log("Phản hồi của chatbot", botResponse);

  // Tạo các mục mới để thêm vào lịch sử
  const newItems = [
    ...(inputMessage
      ? [{ role: "user", parts: [{ text: inputMessage }] }]
      : []),
    ...(image_url ? [{ role: "user", img: image_url }] : []),
    ...(botResponse ? [{ role: "model", parts: [{ text: botResponse }] }] : []),
  ];

  try {
    // Cập nhật lịch sử chat trong cơ sở dữ liệu
    const updatedChat = await chat.updateOne(
      { _id: req.params.id, userId },
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
    console.error("Error updating chat:", error);
    res.status(500).send("Internal Server Error");
  }
});

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

app.listen(port, () => {
  console.log("server running on 3000");
  connect();
});
