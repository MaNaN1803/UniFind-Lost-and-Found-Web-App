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
const { sendEmail } = require("./utils/email");
const { upload } = require("./utils/cloudinary");

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
const pendingInvites = new Map(); // Track roomId -> { senderUserId, targetUserId, senderName }

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Register a user's socket ID when they log in/load app
  socket.on("register_user", (userId) => {
    userSocketMap.set(userId, socket.id);
    console.log(`User ID ${userId} registered with socket ${socket.id}`);
  });

  socket.on("join_room", async (data) => {
    const { room, username } = data;
    socket.join(room);

    // Track user identity in this socket
    socket.room = room;
    socket.username = username;

    if (!roomUsers[room]) roomUsers[room] = [];

    // Check if user is already in the room to prevent duplicate join messages
    const alreadyInRoom = roomUsers[room].some(u => u.username === username);

    if (!alreadyInRoom) {
      roomUsers[room].push({ id: socket.id, username });

      // [EXPANSION] Check if this room has a pending invite map
      try {
        const inviteData = pendingInvites.get(room);

        if (inviteData && inviteData.senderUserId && inviteData.targetUserId) {
          // If the person joining is the TARGET (the invited one), notify the SENDER
          // We can verify this by checking if the username matches the target's name, or we just notify the sender anytime someone joins their room
          if (username !== inviteData.senderName) {
            const dbSender = await User.findById(inviteData.senderUserId);

            if (dbSender) {
              await new Notification({
                userId: dbSender._id,
                type: 'chat_joined',
                message: `${username} just joined your active chat room!`,
                link: `/#chat`
              }).save();

              if (dbSender.email) {
                await sendEmail({
                  to: dbSender.email,
                  subject: `${username} joined the chat! 💬`,
                  text: `${username} just joined your chat room on UniFind.\n\nLog in now to continue the conversation in room: ${room}`,
                  html: `
                      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #6366f1;">${username} joined the chat! 💬</h2>
                        <p>Good news! <strong>${username}</strong> just joined your active chat room on UniFind.</p>
                        <a href="${process.env.BASE_URL || 'https://unifind-lost-and-found.vercel.app'}" style="display: inline-block; padding: 10px 20px; margin-top: 10px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Chat</a>
                      </div>
                    `
                });
              }
              // Remove the pending invite once successful so we don't spam them on every join
              pendingInvites.delete(room);
            }
          }
        } else if (roomUsers[room].length > 1) {
          // Fallback logic for organically joined rooms without an invite
          const otherUsers = roomUsers[room].filter(u => u.username !== username);
          for (const otherUser of otherUsers) {
            // Find the user ID based on socket mapping
            for (const [mappedUserId, mappedSocketId] of userSocketMap.entries()) {
              if (mappedSocketId === otherUser.id) {
                // We found the DB User ID of the person waiting
                const dbUser = await User.findById(mappedUserId);
                if (dbUser) {
                  // [EXPANSION] 1. Send In-App Notification
                  await new Notification({
                    userId: dbUser._id,
                    type: 'chat_joined',
                    message: `${username} just joined your active chat room!`,
                    link: `/ #chat`
                  }).save();

                  // [EXPANSION] 2. Send Email Alert
                  if (dbUser.email) {
                    await sendEmail({
                      to: dbUser.email,
                      subject: `${username} joined the chat! 💬`,
                      text: `${username} just joined your chat room on UniFind.\n\nLog in now to continue the conversation in room: ${room} `,
                      html: `
                < div style = "font-family: Arial, sans-serif; padding: 20px; color: #333;" >
                          <h2 style="color: #6366f1;">${username} joined the chat! 💬</h2>
                          <p>Good news! <strong>${username}</strong> just joined your active chat room on UniFind.</p>
                          <a href="${process.env.BASE_URL || 'https://unifind-lost-and-found.vercel.app'}" style="display: inline-block; padding: 10px 20px; margin-top: 10px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Chat</a>
                        </div >
                `
                    });
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to send chat joined email:", err);
      }
    }

    console.log(`User ${username} (${socket.id}) joined room: ${room} `);

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
    const { targetUserId, senderUserId, senderName, itemId, roomId } = data;

    // Save invite to memory so when targetUserId joins, senderUserId gets emailed
    if (senderUserId) {
      pendingInvites.set(roomId, { senderUserId, targetUserId, senderName });
    }

    try {
      // Save notification to MongoDB
      await new Notification({
        userId: targetUserId,
        type: 'chat_invite',
        message: `${senderName} has invited you to a chat.Join room ID: ${roomId} `,
        link: `/ #chat`
      }).save();

      // Retrieve User Email
      const targetUser = await User.findById(targetUserId);
      if (targetUser && targetUser.email) {
        await sendEmail({
          to: targetUser.email,
          subject: "New Chat Invitation via UniFind 💬",
          text: `Hello ${targetUser.firstName}, \n\n${senderName} has invited you to a direct chat regarding an item.\n\nPlease go to UniFind and join room ID: ${roomId} \n\nThank you!`,
          html: `
    < div style = "font-family: Arial, sans-serif; padding: 20px; color: #333;" >
              <h2 style="color: #6366f1;">New Chat Invitation 💬</h2>
              <p>Hello ${targetUser.firstName},</p>
              <p><strong>${senderName}</strong> has invited you to a direct chat regarding an item.</p>
              <div style="margin: 20px 0; padding: 20px; background: #fafafa; border-left: 4px solid #6366f1;">
                <p style="margin: 0;">Room ID: <strong>${roomId}</strong></p>
              </div>
              <a href="${process.env.BASE_URL || 'https://unifind-lost-and-found.vercel.app'}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Join Chat Room</a>
            </div >
    `
        });
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
      console.log(`Invite sent to user ${targetUserId} via socket ${targetSocketId} `);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id} `);

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
