const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();
const { PORT, MONGO_URI } = require("./config/config");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connect
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// Routes
// The frontend talks to the backend using `/api/*` paths (see `frontend/src/utils/api.js`).
// We expose the whole feature set under `/api` to match that contract.
app.use("/api", require("./routes/fileRoutes"));
app.use("/api/scan-ports", require("./routes/scan.routes"));

// Backward-compatible mounts (older paths still work).
app.use("/files", require("./routes/fileRoutes"));
app.use("/security", require("./routes/securityRoutes"));
app.use("/external", require("./routes/externalRoutes"));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});