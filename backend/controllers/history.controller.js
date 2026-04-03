const ScanHistory = require("../models/ScanHistory");

// POST /api/history  — save a scan result to history
exports.saveHistory = async (req, res) => {
  const { toolName, input, result } = req.body || {};
  if (!toolName) return res.status(400).json({ error: "toolName required" });

  try {
    const doc = await ScanHistory.create({
      toolName,
      input: input || {},
      result: result || {},
    });
    res.json({ id: doc._id, createdAt: doc.createdAt });
  } catch (err) {
    res.status(500).json({ error: err.message || "history save failed" });
  }
};

// GET /api/history  — fetch recent scan history (newest first)
exports.getHistory = async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
  try {
    const history = await ScanHistory.find({}).sort({ createdAt: -1 }).limit(limit);
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: err.message || "history load failed" });
  }
};
