const multer = require("multer");
const path = require("path");

const MAX_FILES = 12;
const MAX_SIZE = 12 * 1024 * 1024; // 12 MB por arquivo

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE, files: MAX_FILES },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const blocked = [".exe", ".bat", ".cmd", ".msi", ".scr", ".ps1"];
    if (blocked.includes(ext)) {
      return cb(new Error("Tipo de arquivo não permitido"));
    }
    cb(null, true);
  },
});

const ticketFilesUpload = upload.array("attachments", MAX_FILES);

module.exports = { ticketFilesUpload, MAX_FILES, MAX_SIZE };
