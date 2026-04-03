const crypto = require("crypto");

// POST /api/hash  — compute SHA-256 hash of uploaded file
exports.computeHash = (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const hash = crypto.createHash("sha256").update(req.file.buffer).digest("hex");
  res.json({ hash });
};

// POST /api/verify  — compare file hash with provided original
exports.verifyHash = (req, res) => {
  if (!req.file) return res.status(400).json({ error: "File required" });
  const originalHash = req.body.originalHash || req.body.original;
  const newHash = crypto.createHash("sha256").update(req.file.buffer).digest("hex");
  const match = originalHash === newHash;
  res.json({ match, valid: match });
};

// POST /api/integrity  — same as verify but requires originalHash field
exports.checkIntegrity = (req, res) => {
  const originalHash = req.body.original || req.body.originalHash;
  if (!originalHash) return res.status(400).json({ error: "original hash required" });
  if (!req.file) return res.status(400).json({ error: "File required" });
  const newHash = crypto.createHash("sha256").update(req.file.buffer).digest("hex");
  const match = originalHash === newHash;
  res.json({ match, valid: match });
};
