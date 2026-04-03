const mongoose = require("mongoose");

const scanHistorySchema = new mongoose.Schema({
  toolName: { type: String, required: true },
  input: { type: mongoose.Schema.Types.Mixed, default: {} },
  result: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ScanHistory", scanHistorySchema);

