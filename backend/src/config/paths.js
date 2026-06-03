const path = require("path");

const uploadRoot = path.join(__dirname, "..", "..", "uploads");

function ticketUploadDir(ticketId) {
  return path.join(uploadRoot, ticketId);
}

module.exports = { uploadRoot, ticketUploadDir };
