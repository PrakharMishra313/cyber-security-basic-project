const express = require("express");
const multer = require("multer");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Malware scan (very light heuristic)
router.post("/scan", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "file required" });
  const filename = req.file.originalname;

  const suspicious = [".exe", ".bat", ".sh", ".js"];
  const isMalicious = suspicious.some((ext) => filename.toLowerCase().endsWith(ext));

  const safe = !isMalicious;
  res.json({
    safe,
    status: safe ? "Safe File ✅" : "Suspicious File ⚠️",
  });
});

// URL scan (very light heuristic)
router.post("/scan-url", (req, res) => {
  const { url } = req.body || {};
  const u = String(url || "");
  if (!u.trim()) return res.status(400).json({ error: "url required" });

  const suspicious = ["login", "verify", "free", "bank"];
  const isPhishing = suspicious.some((word) => u.toLowerCase().includes(word));

  const safe = !isPhishing;
  res.json({
    safe,
    result: safe ? "Safe URL ✅" : "Phishing Suspected ⚠️",
  });
});

module.exports = router;

