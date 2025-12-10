const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      trim: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    file: {
      type: String,
      default: null,
    },
    fileType: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
    },
    status: {
      type: String,
      enum: ["not_sent", "sent", "delivered", "seen"],
      default: "sent",
    },
    // Time tracking
    sentAt: { type: Date, default: Date.now },
    deliveredAt: { type: Date },
    seenAt: { type: Date },

    // ✅ NEW FIELDS FOR FEATURES (Reply, Edit, Delete)
    replyTo: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Message",
       default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isEdited: {
        type: Boolean,
        default: false
    }
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;