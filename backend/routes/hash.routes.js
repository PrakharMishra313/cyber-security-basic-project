
const express = require("express");
const crypto = require("crypto");
const multer = require("multer");

const router = express.Router();

// store file in memory
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), (req, res) => {
  console.log("🔥 FILE HASH ROUTE HIT");

  // ✅ FIX: use req.file (NOT req.body)
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const hash = crypto
      .createHash("sha256")
      .update(req.file.buffer)
      .digest("hex");

    res.json({ hash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Hash generation failed" });
  }
});

module.exports = router;

