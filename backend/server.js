const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const colors = require("colors");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");
const fs = require('fs');


dotenv.config(); // IMPORTANT for Render

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    console.log('Creating uploads directory...');
    fs.mkdirSync(uploadDir, { recursive: true });
}

connectDB();

const app = express();

// -------- CORS CONFIG FOR PRODUCTION ----------
app.use(cors({
  origin: process.env.CLIENT_URL, // ONLY YOUR VERCEL FRONTEND
  credentials: true,
}));

app.use(express.json());

// Static uploads (Not recommended for Render)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// ROOT ROUTE
app.get("/", (req, res) => {
  res.send("Backend API is Running Successfully...");
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
const server = app.listen(
  port,
  () => console.log(`Backend running on PORT ${port}...`.yellow.bold)
);

// -------- SOCKET.IO SETUP ----------
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

// Map to track online users
let onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.userId = userData._id;

    onlineUsers.set(userData._id, socket.id);
    io.emit("user online", Array.from(onlineUsers.keys()));

    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("typing", (room) => socket.to(room).emit("typing"));
  socket.on("stop typing", (room) => socket.to(room).emit("stop typing"));

  socket.on("new message", (msg) => {
    const chat = msg.chat;
    if (!chat || !chat.users) return;

    chat.users.forEach((user) => {
      if (user._id === msg.sender._id) return;
      io.to(user._id).emit("message received", msg);
    });
  });

  socket.on("message delivered", ({ messageId, chat }) => {
    chat.users.forEach((user) => {
      if (user._id === socket.userId) return;
      io.to(user._id).emit("message delivered update", messageId);
    });
  });

  socket.on("message seen", ({ messageId, chat }) => {
    chat.users.forEach((user) => {
      if (user._id === socket.userId) return;
      io.to(user._id).emit("message seen update", messageId);
    });
  });

  // ---- Call Events ----
  socket.on("callUser", (data) => {
    socket.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
      isVideo: data.isVideo
    });
  });

  socket.on("answerCall", (data) => {
    socket.to(data.to).emit("callAccepted", data.signal);
  });

  socket.on("endCall", (data) => {
    socket.to(data.id).emit("leaveCall");
  });

  socket.on("rejectCall", (data) => {
    socket.to(data.to).emit("callRejected");
  });

  socket.on("disconnect", () => {
    for (const [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(uid);
        io.emit("user offline", uid);
        io.emit("user online", Array.from(onlineUsers.keys()));
        break;
      }
    }
    console.log("Socket disconnected:", socket.id);
  });
});
