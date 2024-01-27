const express = require("express");
const app = express();
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
const FeedItem = require("./models/feedItem");
const multer = require("multer");
const path = require("path");
const UserModel = require("./models/usermodel");
const nodemailer = require("nodemailer");
connection();

app.use(express.static("Public"));
app.use(express.json());
app.use(cors());
app.use("/api/feed", feedRoutes);
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/lostitem", lostItemRoutes);
app.use("/api/founditem", foundItemRoutes);
app.use("/api/claimfounditem", claimFoundItemRoutes);

const sendMail = async (req, res) => {
  let testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "suzanne55@ethereal.email",
      pass: "zgTsx2KnkFBsRa4rjR",
    },
  });
  let info = await transporter.sendMail({
    from: '"Manan Telrandhe 👻" <telrandhemanan@gmail.com>',
    to: "telrandhemanan@gmail.com, manantelrandhe210238@gmail.com",
    subject: "Welcome To UniFind",
    text: "You have successfully logged in into UniFind",
    html: "<b>Hello Manan ,</b>",
  });
  console.log("Message sent: %s", info.messageId);
  res.json(info);
};

app.post("/send-email-on-login", (req, res) => {
  sendMail(req, res);
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Public/images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
});

app.post("/uploads", upload.single("file"), (req, res) => {
  UserModel.create({ image: req.file.filename })
    .then((result) => res.json(result))
    .catch((err) => console.log(err));
});

app.get("/getImage", (req, res) => {
  UserModel.find()
    .then((users) => res.json(users))
    .catch((err) => res.json(err));
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User with ID: ${socket.id} joined room: ${room}`);
  });

  socket.on("send_message", (data) => {
    io.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
