const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
  updateUserProfile
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// --- Routes ---
router.route("/").post(registerUser).get(protect, allUsers);
router.post("/login", authUser);

// ✅ FILE UPLOAD SETUP (Multer)
// Hume alag file ki zarurat nahi, yahi setup kar dete hain
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Images 'uploads' folder m jayengi
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname); // Unique naam
    },
});

const uploadMiddleware = multer({ storage });

// ✅ Profile Update Route (Ab ye chalega)
router.route("/profile").put(protect, uploadMiddleware.single("pic"), updateUserProfile);

module.exports = router;