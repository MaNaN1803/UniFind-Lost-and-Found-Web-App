require("dotenv").config();
const express = require("express");
const app = express();
const allowedOrigins = process.env.BASE_URL
  ? process.env.BASE_URL.split(",").map((o) => o.trim())
  : ["http://localhost:3000", "http://localhost:5173"];
const cors = require("cors");
const http = require("http");
const connection = require("./db");
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const lostItemRoutes = require("./routes/lostItem");
const foundItemRoutes = require("./routes/foundItem");
const claimFoundItemRoutes = require("./routes/claimFoundItem");
const { Server } = require("socket.io");
const feedRoutes = require("./routes/Feed");
const adminRoutes = require("./routes/admin");
const rewardsRoutes = require("./routes/rewards");
const notificationsRoutes = require("./routes/notifications");
const passwordResetRoutes = require("./routes/passwordReset");
const FeedItem = require("./models/feedItem");
const Notification = require("./models/notification");
const path = require("path");
const UserModel = require("./models/usermodel");
const { User } = require("./models/user");
const nodemailer = require("nodemailer");
const { upload } = require("./utils/cloudinary");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

connection();

// Initialize Automated Maintenance
require("./utils/cronJobs")();

app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static("public"));
app.use(express.json());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    credentials: true,
  })
);
app.use("/api/feed", feedRoutes);
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/lostitem", lostItemRoutes);
app.use("/api/founditem", foundItemRoutes);
app.use("/api/claimfounditem", claimFoundItemRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/rewards", rewardsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/password-reset", passwordResetRoutes);

app.post("/uploads", upload.single("file"), (req, res) => {
  UserModel.create({ image: req.file.path })
    .then((result) => res.json(result))
    .catch((err) => console.log(err));
});

// [NEW] API Route for Chat Image Uploads
app.post("/api/upload/image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided." });
  }
  // Construct a public URL path directly from Cloudinary
  const imageUrl = req.file.path;
  res.status(200).json({ imageUrl });
});

app.get("/getImage", (req, res) => {
  UserModel.find()
    .then((users) => res.json(users))
    .catch((err) => res.json(err));
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Socket.IO CORS blocked: " + origin));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling", "websocket"],
});

const userSocketMap = new Map(); // Track userId -> socketId
const roomUsers = {}; // Track active users in each room

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Register a user's socket ID when they log in/load app
  socket.on("register_user", (userId) => {
    userSocketMap.set(userId, socket.id);
    console.log(`User ID ${userId} registered with socket ${socket.id}`);
  });

  socket.on("join_room", (data) => {
    const { room, username } = data;
    socket.join(room);

    // Track user identity in this socket
    socket.room = room;
    socket.username = username;

    if (!roomUsers[room]) roomUsers[room] = [];
    roomUsers[room].push({ id: socket.id, username });

    console.log(`User ${username} (${socket.id}) joined room: ${room}`);

    // Broadcast active users to room
    io.to(room).emit("room_users_update", roomUsers[room]);
  });

  socket.on("leave_room", (room) => {
    socket.leave(room);
    if (roomUsers[room]) {
      const leavingUser = socket.username;
      roomUsers[room] = roomUsers[room].filter((user) => user.id !== socket.id);

      // Update roster
      io.to(room).emit("room_users_update", roomUsers[room]);

      // Broadcast departure message
      if (leavingUser) {
        const time = new Date(Date.now()).getHours() + ":" + String(new Date(Date.now()).getMinutes()).padStart(2, '0');
        io.to(room).emit("receive_message", {
          room: room,
          author: "System",
          message: `${leavingUser} has left the chat.`,
          time: time
        });
      }
    }
  });

  socket.on("send_message", (data) => {
    io.to(data.room).emit("receive_message", data);
  });

  // Handle invitation to chat
  socket.on("invite_to_chat", async (data) => {
    const { targetUserId, senderName, itemId, roomId } = data;

    try {
      // Save notification to MongoDB
      await new Notification({
        userId: targetUserId,
        type: 'chat_invite',
        message: `${senderName} has invited you to a chat. Join room ID: ${roomId}`,
        link: `/#chat`
      }).save();

      // Retrieve User Email
      const targetUser = await User.findById(targetUserId);
      if (targetUser && targetUser.email) {
        transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: targetUser.email,
          subject: "New Chat Invitation via UniFind",
          text: `Hello ${targetUser.firstName},\n\n${senderName} has invited you to a direct chat regarding an item.\n\nPlease go to UniFind and join room ID: ${roomId}\n\nThank you!`
        }).catch(console.error);
      }
    } catch (err) {
      console.error("Failed to save or send chat invite notification:", err);
    }

    const targetSocketId = userSocketMap.get(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit("chat_invitation", {
        senderName,
        itemId,
        roomId
      });
      console.log(`Invite sent to user ${targetUserId} via socket ${targetSocketId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    // Remove from chat rooms
    if (socket.room && roomUsers[socket.room]) {
      const leavingUser = socket.username;
      const room = socket.room;

      roomUsers[room] = roomUsers[room].filter((u) => u.id !== socket.id);
      io.to(room).emit("room_users_update", roomUsers[room]);

      // Broadcast departure message
      if (leavingUser) {
        const time = new Date(Date.now()).getHours() + ":" + String(new Date(Date.now()).getMinutes()).padStart(2, '0');
        io.to(room).emit("receive_message", {
          room: room,
          author: "System",
          message: `${leavingUser} has disconnected.`,
          time: time
        });
      }
    }

    // Clean up mapping
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  });
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
