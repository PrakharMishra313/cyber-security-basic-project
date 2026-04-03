require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const { PORT, MONGO_URI } = require("./config/config");

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Database ──────────────────────────────────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Error:", err));

// ── Routes (all under /api) ───────────────────────────────────────────────────
app.use("/api", require("./routes"));

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
