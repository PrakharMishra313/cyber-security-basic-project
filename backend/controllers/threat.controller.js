const { checkMalware, checkURL } = require("../services/scanService");

// POST /api/scan — heuristic filename / extension check (educational)
exports.scanFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "file required" });

  const suspicious = checkMalware(req.file.originalname);
  res.json({
    safe: !suspicious,
    filename: req.file.originalname,
    message: suspicious
      ? "Heuristic: extension matches common executable or script patterns."
      : "Heuristic: no high-risk extension pattern for this demo.",
  });
};

// POST /api/scan-url — keyword-based URL heuristics (educational)
exports.scanURL = async (req, res) => {
  const url = (req.body?.url || "").trim();
  if (!url) return res.status(400).json({ error: "url required" });

  const suspicious = checkURL(url);
  res.json({
    safe: !suspicious,
    url,
    message: suspicious
      ? "Heuristic: URL contains keywords often used in phishing templates."
      : "Heuristic: no obvious phishing keywords in this demo.",
  });
};
