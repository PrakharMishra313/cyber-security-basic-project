const File = require("../models/File");
const { FRONTEND_URL } = require("../config/config");
const { encrypt, decrypt } = require("../services/cryptoService");

// POST /api/upload
exports.uploadFile = async (req, res) => {
  try {
    const { password, expiryMinutes } = req.body;

    if (!password) return res.status(400).json({ error: "Password required" });
    if (!req.file) return res.status(400).json({ error: "File required" });
    const expiry = Number.parseInt(expiryMinutes, 10);
    if (!Number.isFinite(expiry) || expiry <= 0) {
      return res.status(400).json({ error: "expiryMinutes must be a positive integer" });
    }

    const { encrypted, salt, iv } = encrypt(req.file.buffer, password);
    const expiresAt = new Date(Date.now() + expiry * 60000);

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
      link: `${FRONTEND_URL}/download/${file._id}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/download/:id
exports.downloadFile = async (req, res) => {
  try {
    const { password } = req.body;
    const file = await File.findById(req.params.id);

    if (!file) return res.status(404).json({ error: "File not found" });

    if (file.expiresAt && new Date() > file.expiresAt) {
      return res.status(403).json({ error: "File expired" });
    }

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
  } catch {
    res.status(403).json({ error: "Wrong password or decryption failed" });
  }
};

// GET /api/files
exports.listFiles = async (req, res) => {
  try {
    const files = await File.find().select("_id filename expiresAt");
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/file/:id
exports.getFileInfo = async (req, res) => {
  try {
    const file = await File.findById(req.params.id).select("filename contentType");
    if (!file) return res.status(404).json({ error: "File not found" });
    res.json({ id: file._id, name: file.filename, contentType: file.contentType });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
