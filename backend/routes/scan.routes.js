
const express = require("express");
const { runNmapScan } = require("../scanner/nmapScanner");

const router = express.Router();

router.post("/", async (req, res) => {
  // Frontend sends `{ host }`, but older code used `{ target }`.
  const { host, target } = req.body || {};
  const scanTarget = host || target;

  if (!scanTarget) return res.status(400).json({ error: "Target/host required" });

  try {
    const result = await runNmapScan(scanTarget);

    res.json({
      target: scanTarget,
      openPorts: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Scan failed" });
  }
});

module.exports = router;
