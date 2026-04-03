const File = require("../models/File");
const { encrypt, decrypt } = require("../services/cryptoService");

exports.uploadFile = async (req, res) => {
  try {
    const { password, expiryMinutes } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password required" });
    }

    const { encrypted, salt, iv } = encrypt(req.file.buffer, password);

    const expiresAt = new Date(Date.now() + expiryMinutes * 60000);

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
};

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
    res.status(403).json({ error: "Wrong password" });
  }
};

exports.getFiles = async (req, res) => {
  const files = await File.find().select("_id filename expiresAt");
  res.json(files);
};