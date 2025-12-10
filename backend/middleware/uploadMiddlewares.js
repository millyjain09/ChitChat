// const multer = require("multer");
// const path = require("path");

// // Storage setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   },
// });

// // File filter fix ✅
// const fileFilter = (req, file, cb) => {
//   const allowedExts = [
//     ".jpeg", ".jpg", ".png", ".gif", ".webp",
//     ".pdf", ".mp4", ".mp3", ".wav", ".ogg",
//     ".doc", ".docx", ".txt"
//   ];

//   const allowedMimes = [
//     "image/jpeg", "image/png", "image/gif", "image/webp",
//     "application/pdf", "video/mp4",
//     "audio/mpeg", "audio/wav", "audio/ogg",
//     "application/msword",
//     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     "text/plain"
//   ];

//   const ext = path.extname(file.originalname).toLowerCase();
//   const mime = file.mimetype.toLowerCase();

//   if (allowedExts.includes(ext) && allowedMimes.includes(mime)) {
//     cb(null, true);
//   } else {
//     cb(new Error(`Invalid file type: ${ext} (${mime})`));
//   }
// };

// // Initialize multer
// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
// });

// module.exports = upload;
const multer = require("multer");
const path = require("path");

// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Make sure 'uploads/' folder exists in your project root
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Updated File Filter Logic (Focusing on MIME Type for reliability) ✅
const fileFilter = (req, file, cb) => {
  // Allowed Extensions: Used primarily as a backup and for reference
  const allowedExts = [
    ".jpeg", ".jpg", ".png", ".gif", ".webp",
    ".pdf", ".mp4", ".mp3", ".wav", ".ogg",
    ".doc", ".docx", ".txt",".ppt", ".pptx"
  ];

  // Allowed MIME Types: This is the primary check
  const allowedMimes = [
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "application/pdf", 
    "video/mp4",
    "audio/mpeg", "audio/wav", "audio/ogg",
    // Word Docs
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "text/plain",
    "application/vnd.ms-powerpoint", // .ppt
    "application/vnd.openxmlformats-officedocument.presentationml.presentation" // .pptx

  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  // Logic Change: Check if the MIME type is allowed, OR if the extension is allowed 
  // (to cover cases where MIME type might be generic like application/octet-stream)
  // This is more forgiving than the previous AND condition.
  if (allowedMimes.includes(mime) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    // If you want a STRICT check, remove || allowedExts.includes(ext)
    cb(new Error(`Invalid file type: ${ext} (${mime}). File rejected.`));
  }
};

// Initialize multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
});

module.exports = upload;