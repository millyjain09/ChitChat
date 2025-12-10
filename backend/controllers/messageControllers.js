const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const allMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "name pic email")
    .populate("chat")
    .populate({ path: "replyTo", populate: { path: "sender", select: "name" } })
    .populate("reactions.user", "name pic");
  res.json(messages);
});

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId, replyTo } = req.body;
  if (!chatId && !req.file) return res.status(400).json({ message: "Invalid data" });

  let newMessage = {
    sender: req.user._id,
    content: content || "",
    chat: chatId,
    replyTo: replyTo || null
  };

  if (req.file) {
    newMessage.file = `/uploads/${req.file.filename}`;
    newMessage.fileType = req.file.mimetype;
    newMessage.fileName = req.file.originalname;
  }

  try {
    let message = await Message.create(newMessage);
    message = await message.populate("sender", "name pic email");
    message = await message.populate("chat");
    message = await message.populate({ path: "replyTo", populate: { path: "sender", select: "name" } });
    message = await User.populate(message, { path: "chat.users", select: "name pic email" });
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
    res.json(message);
  } catch (error) { res.status(500); throw new Error(error.message); }
});

const updateMessageStatus = asyncHandler(async (req, res) => {
  const { messageId, status } = req.body;
  const message = await Message.findByIdAndUpdate(messageId, { status }, { new: true });
  res.json(message);
});

const deleteMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);
    if (!message) return res.status(404);
    if (message.sender.toString() !== req.user._id.toString()) return res.status(401);
    message.isDeleted = true;
    message.content = "This message was deleted";
    message.file = null;
    message.reactions = [];
    await message.save();
    res.json(message);
});

const editMessage = asyncHandler(async (req, res) => {
    const { messageId, newContent } = req.body;
    const message = await Message.findById(messageId);
    if (!message) return res.status(404);
    if (message.sender.toString() !== req.user._id.toString()) return res.status(401);
    message.content = newContent;
    message.isEdited = true;
    await message.save();
    res.json(message);
});

const pinMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.body;
    const message = await Message.findById(messageId);
    if(!message) return res.status(404);
    message.isPinned = !message.isPinned;
    await message.save();
    res.json(message);
});

const reactToMessage = asyncHandler(async (req, res) => {
    const { messageId, emoji } = req.body;
    const message = await Message.findById(messageId);
    if(!message) return res.status(404);
    const existingReaction = message.reactions.find(r => r.user.toString() === req.user._id.toString());
    if (existingReaction) {
        if (existingReaction.emoji === emoji) message.reactions = message.reactions.filter(r => r.user.toString() !== req.user._id.toString());
        else existingReaction.emoji = emoji;
    } else {
        message.reactions.push({ user: req.user._id, emoji });
    }
    await message.save();
    await message.populate("reactions.user", "name pic");
    res.json(message);
});

// ✅ Log Call (Isse check karo)
const logCall = asyncHandler(async (req, res) => {
    const { chatId, callDuration, callStatus, callType } = req.body;
    if (!chatId) return res.status(400).json({ message: "Chat ID required" });

    let newMessage = {
        sender: req.user._id,
        content: `${callType} Call ${callStatus}`,
        chat: chatId,
        isCallLog: true,
        callDuration,
        callStatus,
        callType
    };

    try {
        let message = await Message.create(newMessage);
        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// ✅ UPDATED: Get Call Logs (Smart Search)
const getCallLogs = asyncHandler(async (req, res) => {
  try {
    const userChats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } });
    const chatIds = userChats.map(c => c._id);

    // ✅ JAADU YAHAN HAI:
    // Hum check kar rahe hain ki ya to 'isCallLog' true ho
    // YA FIR message ke andar "Call" aur "Ended/Missed" likha ho.
    const calls = await Message.find({
        chat: { $in: chatIds },
        $or: [
            { isCallLog: true },
            { content: { $regex: "Call Ended", $options: "i" } },
            { content: { $regex: "Missed Call", $options: "i" } },
            { content: { $regex: "Video Call", $options: "i" } }
        ]
    })
    .populate("sender", "name pic")
    .populate({
        path: "chat",
        populate: {
            path: "users",
            select: "name pic email",
        },
    })
    .sort({ createdAt: -1 });

    res.json(calls);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  allMessages, sendMessage, updateMessageStatus, deleteMessage, editMessage,
  pinMessage, reactToMessage, logCall, getCallLogs
};