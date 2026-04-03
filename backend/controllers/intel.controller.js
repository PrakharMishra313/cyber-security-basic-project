const axios = require("axios");
const net = require("net");
const dns = require("dns").promises;
const { SHODAN_API_KEY } = require("../config/config");

// POST /api/shodan  — search Shodan by IP/query
exports.shodanSearch = async (req, res) => {
  const q = (req.body?.query || "").trim();
  if (!q) return res.status(400).json({ error: "query required" });
  if (!SHODAN_API_KEY) return res.status(400).json({ error: "SHODAN_API_KEY not configured" });

  try {
    const response = await axios.get(
      `https://api.shodan.io/shodan/host/${q}?key=${SHODAN_API_KEY}`
    );
    const ports = Array.isArray(response.data.ports) ? response.data.ports : [];
    res.json({
      query: q,
      total: ports.length,
      ip: response.data.ip_str,
      ports,
      org: response.data.org,
      os: response.data.os,
    });
  } catch {
    res.status(500).json({ error: "Shodan scan failed" });
  }
};

// GET /api/shodan/:ip  — legacy endpoint (lookup by IP param)
exports.shodanLookup = async (req, res) => {
  const ip = req.params.ip;
  if (!SHODAN_API_KEY) return res.status(400).json({ error: "SHODAN_API_KEY not configured" });

  try {
    const response = await axios.get(
      `https://api.shodan.io/shodan/host/${ip}?key=${SHODAN_API_KEY}`
    );
    res.json({
      ip: response.data.ip_str,
      org: response.data.org,
      os: response.data.os,
      ports: response.data.ports,
    });
  } catch {
    res.status(500).json({ error: "Shodan scan failed" });
  }
};

// POST /api/ip-info  — geo/ASN/reverse DNS lookup for an IP
exports.ipInfo = async (req, res) => {
  const ipInput = (req.body?.ip || "").trim();

  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  const callerIp = (forwarded || req.ip || "").replace(/^::ffff:/, "");
  const ip = ipInput || callerIp;

  if (!ip) return res.status(400).json({ error: "ip required" });
  if (net.isIP(ip) === 0) return res.status(400).json({ error: "invalid ip" });

  function isBogon(addr) {
    if (net.isIP(addr) !== 4) return false;
    const [a, b] = addr.split(".").map((x) => parseInt(x, 10));
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a >= 224) return true;
    return false;
  }

  async function reverseLookup(addr) {
    try {
      const names = await Promise.race([
        dns.reverse(addr),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("reverse dns timeout")), 1500)
        ),
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
      region: data.regionName,
      input: ipInput,
      resolvedIp: ip,
      ipVersion: net.isIP(ip),
      bogon: isBogon(ip),
      reverseDns: ptr,
    });
  } catch {
    res.status(500).json({ error: "IP lookup failed" });
  }
};

// POST /api/whois  — basic WHOIS info (stub)
exports.whois = (req, res) => {
  const { domain } = req.body || {};
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
};

// POST /api/check-password  — password strength scorer
exports.checkPassword = (req, res) => {
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: "password required" });

  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  let score = Math.min(40, length * 2);
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
};
