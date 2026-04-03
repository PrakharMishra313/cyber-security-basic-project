const express = require("express");
const multer = require("multer");
const crypto = require("crypto");

const File = require("../../models/File");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 🔐 Generate key using password
function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");
}

// 🔐 Encrypt
function encrypt(buffer, password) {
  const salt = crypto.randomBytes(16);
  const key = deriveKey(password, salt);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

  return { encrypted, salt, iv };
}

// 🔓 Decrypt
function decrypt(encrypted, password, salt, iv) {
  const key = deriveKey(password, salt);

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

//
// 📤 Upload (Password + Expiry)
//
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { password, expiryMinutes } = req.body;

    if (!password) return res.status(400).json({ error: "Password required" });
    if (!req.file) return res.status(400).json({ error: "file required" });

    const { encrypted, salt, iv } = encrypt(req.file.buffer, password);
    const expiresAt = new Date(Date.now() + parseInt(expiryMinutes, 10) * 60000);

    const file = await File.create({
      filename: req.file.originalname,
      data: encrypted,
      contentType: req.file.mimetype,
      salt: salt.toString("hex"),
      iv: iv.toString("hex"),
      expiresAt,
    });

    res.json({
      id: file._id,
      link: `http://localhost:5173/download/${file._id}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//
// 📥 Download (Password required)
//
router.post("/download/:id", async (req, res) => {
  try {
    const { password } = req.body;

    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });

    // ⏳ Expiry check
    if (file.expiresAt && new Date() > file.expiresAt) {
      return res.status(403).json({ error: "File expired" });
    }

    // 🔓 Decrypt
    const decrypted = decrypt(
      file.data,
      password,
      Buffer.from(file.salt, "hex"),
      Buffer.from(file.iv, "hex")
    );

    res.set({
      "Content-Type": file.contentType,
      "Content-Disposition": `attachment; filename=${file.filename}`,
    });

    res.send(decrypted);
  } catch (err) {
    res.status(403).json({ error: "Wrong password or decryption failed" });
  }
});

//
// 📂 List files (without sensitive data)
//
router.get("/files", async (req, res) => {
  try {
    const files = await File.find().select("_id filename expiresAt");
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📄 File metadata for the React download page
// Frontend expects: GET /api/file/:id -> { name: "filename" }
router.get("/file/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id).select("filename contentType");
    if (!file) return res.status(404).json({ error: "File not found" });
    res.json({
      id: file._id,
      name: file.filename,
      contentType: file.contentType,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

