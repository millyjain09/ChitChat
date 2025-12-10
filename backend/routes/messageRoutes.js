// const express = require("express");
// const {
//   allMessages,
//   sendMessage,
//   updateMessageStatus,
//   deleteMessage,
//   editMessage,
//   pinMessage,
//   reactToMessage,
//   logCall,
//   getCallLogs
// } = require("../controllers/messageControllers");
// const { protect } = require("../middleware/authMiddleware");

// const router = express.Router();

// // ✅ IMPORTANT: Specific Routes Upar rakho
// router.route("/logs").get(protect, getCallLogs);
// router.route("/logcall").post(protect, logCall);

// router.route("/edit").put(protect, editMessage);
// router.route("/pin").put(protect, pinMessage);
// router.route("/react").put(protect, reactToMessage);
// router.route("/status").put(protect, updateMessageStatus);

// router.route("/").post(protect, sendMessage);

// // ✅ Dynamic Routes (/:id) Sabse Neeche
// router.route("/:chatId").get(protect, allMessages);
// router.route("/:messageId").delete(protect, deleteMessage);

// module.exports = router;


const express = require("express");
// ✅ Import the Multer configuration (assuming the file is in '../middleware/')
const upload = require("../middleware/uploadMiddlewares.js"); 
const {
  allMessages,
  sendMessage,
  updateMessageStatus,
  deleteMessage,
  editMessage,
  pinMessage,
  reactToMessage,
  logCall,
  getCallLogs
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// --- 1. Specific PUT/POST Routes ---
router.route("/logs").get(protect, getCallLogs);
router.route("/logcall").post(protect, logCall);

router.route("/edit").put(protect, editMessage);
router.route("/pin").put(protect, pinMessage);
router.route("/react").put(protect, reactToMessage);
router.route("/status").put(protect, updateMessageStatus);

// 📢 CRITICAL FIX: Add upload.single('file') middleware here
router.route("/").post(protect, upload.single('file'), sendMessage);

// --- 2. Dynamic Routes (/:id) ---
// Note: These paths are fine because they use different HTTP methods (GET and DELETE)
router.route("/:chatId").get(protect, allMessages);
router.route("/:messageId").delete(protect, deleteMessage);

module.exports = router;