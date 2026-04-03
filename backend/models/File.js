const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: String,
  data: Buffer,
  contentType: String,

  salt: String,     // 🔐 for PBKDF2
  iv: String,       // 🔐 encryption IV

  expiresAt: Date,  // ⏳ expiry time

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("File", fileSchema);