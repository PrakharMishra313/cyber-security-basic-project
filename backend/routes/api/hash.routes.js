const express = require("express");
const multer = require("multer");
const crypto = require("crypto");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/hash", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "file required" });
  const hash = crypto.createHash("sha256").update(req.file.buffer).digest("hex");
  res.json({ hash });
});

router.post("/verify", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "file required" });
  const originalHash = req.body.originalHash || req.body.original;
  const newHash = crypto.createHash("sha256").update(req.file.buffer).digest("hex");
  const match = originalHash === newHash;
  res.json({ match, valid: match });
});

// 🧪 Integrity check (frontend uses /integrity)
router.post("/integrity", upload.single("file"), (req, res) => {
  const originalHash = req.body.original || req.body.originalHash;
  if (!originalHash) return res.status(400).json({ error: "original hash required" });
  if (!req.file) return res.status(400).json({ error: "file required" });

  const newHash = crypto.createHash("sha256").update(req.file.buffer).digest("hex");
  const match = originalHash === newHash;
  res.json({ match, valid: match });
});

module.exports = router;

