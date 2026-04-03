const express = require("express");

const router = express.Router();

const axios = require("axios");
const { SHODAN_API_KEY } = require("../../config/config");

router.post("/whois", (req, res) => {
  const { domain } = req.body;

  const registrar = "Example Registrar";
  const created = "2022-01-01";
  const expiry = "2027-01-01";

  res.json({
    domain,
    registrar,
    created,
    expiry,
    info: `Registrar: ${registrar} | Created: ${created} | Expiry: ${expiry}`,
  });
});

// 🔑 Password strength (frontend expects: { level })
router.post("/check-password", (req, res) => {
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: "password required" });

  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  // Simple scoring: length + character variety
  let score = 0;
  score += Math.min(40, length * 2);
  score += hasLower ? 10 : 0;
  score += hasUpper ? 10 : 0;
  score += hasDigit ? 15 : 0;
  score += hasSymbol ? 15 : 0;

  score = Math.max(0, Math.min(100, score));

  const level = score < 40 ? "Weak" : score < 70 ? "Medium" : "Strong";
  const feedback = [];
  if (length < 10) feedback.push("Use at least 10 characters.");
  if (!hasUpper) feedback.push("Add uppercase letters.");
  if (!hasLower) feedback.push("Add lowercase letters.");
  if (!hasDigit) feedback.push("Add digits.");
  if (!hasSymbol) feedback.push("Add symbols.");

  res.json({
    level,
    score,
    feedback: feedback.length ? feedback.join(" ") : "Good password structure.",
  });
});

// 🌐 Shodan search (frontend expects POST /api/shodan with { query } and uses `total`)
router.post("/shodan", async (req, res) => {
  const { query } = req.body || {};
  const q = (query || "").trim();
  if (!q) return res.status(400).json({ error: "query required" });

  try {
    const API_KEY = SHODAN_API_KEY;
    if (!API_KEY) return res.status(400).json({ error: "SHODAN_API_KEY not configured" });
    const response = await axios.get(`https://api.shodan.io/shodan/host/${q}?key=${API_KEY}`);

    const ports = Array.isArray(response.data.ports) ? response.data.ports : [];
    res.json({
      query: q,
      total: ports.length,
      ip: response.data.ip_str,
      ports,
      org: response.data.org,
      os: response.data.os,
    });
  } catch (err) {
    res.status(500).json({ error: "Shodan scan failed" });
  }
});

// (legacy) GET /api/shodan/:ip
router.get("/shodan/:ip", async (req, res) => {
  const ip = req.params.ip;
  try {
    const API_KEY = SHODAN_API_KEY;
    if (!API_KEY) return res.status(400).json({ error: "SHODAN_API_KEY not configured" });
    const response = await axios.get(`https://api.shodan.io/shodan/host/${ip}?key=${API_KEY}`);
    res.json({
      ip: response.data.ip_str,
      org: response.data.org,
      os: response.data.os,
      ports: response.data.ports,
    });
  } catch (err) {
    res.status(500).json({ error: "Shodan scan failed" });
  }
});

// 📍 IP lookup (frontend expects POST /api/ip-info with { ip })
router.post("/ip-info", async (req, res) => {
  const net = require("net");
  const dns = require("dns").promises;

  const ipInput = (req.body?.ip || "").trim();

  // Allow empty input: treat as caller IP (useful for "my IP" button)
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  const callerIp = (forwarded || req.ip || "").replace(/^::ffff:/, "");
  const ip = ipInput || callerIp;

  if (!ip) return res.status(400).json({ error: "ip required" });
  if (net.isIP(ip) === 0) return res.status(400).json({ error: "invalid ip" });

  function isBogon(addr) {
    // Light-weight IPv4 bogon/private detection
    if (net.isIP(addr) !== 4) return false;
    const [a, b] = addr.split(".").map((x) => parseInt(x, 10));
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a >= 224) return true; // multicast/reserved
    return false;
  }

  async function reverseLookup(addr) {
    try {
      const names = await Promise.race([
        dns.reverse(addr),
        new Promise((_, reject) => setTimeout(() => reject(new Error("reverse dns timeout")), 1500)),
      ]);
      return Array.isArray(names) ? names : [];
    } catch {
      return [];
    }
  }

  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}?fields=66846719`);
    const data = response.data || {};
    const ptr = await reverseLookup(ip);
    res.json({
      ...data,
      // Frontend expects `geoData.region`
      region: data.regionName,
      input: ipInput,
      resolvedIp: ip,
      ipVersion: net.isIP(ip),
      bogon: isBogon(ip),
      reverseDns: ptr,
    });
  } catch (err) {
    res.status(500).json({ error: "IP lookup failed" });
  }
});

module.exports = router;

