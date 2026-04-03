const express = require("express");
const multer = require("multer");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const axios = require("axios");

// 🧠 1) File Metadata Analyzer (Magic bytes + light PDF/JPEG markers)
router.post("/metadata", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "file required" });

    const originalName = req.file.originalname || "file";
    const ext = originalName.split(".").pop()?.toLowerCase() || "";
    const buffer = req.file.buffer || Buffer.alloc(0);

    const head = buffer.subarray(0, 32);
    const asText = buffer.subarray(0, 2 * 1024 * 1024).toString("latin1"); // sample only

    function matchBytes(arr, startBytes) {
      if (arr.length < startBytes.length) return false;
      for (let i = 0; i < startBytes.length; i++) {
        if (arr[i] !== startBytes[i]) return false;
      }
      return true;
    }

    // Very small magic-byte based detection (fast, no deps)
    const detected = (() => {
      if (matchBytes(head, [0x25, 0x50, 0x44, 0x46])) return "pdf"; // %PDF
      if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "jpeg";
      if (matchBytes(head, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
      if (matchBytes(head, [0x47, 0x49, 0x46, 0x38]) && (head[4] === 0x39 || head[4] === 0x37))
        return "gif"; // GIF8x
      if (matchBytes(head, [0x50, 0x4b, 0x03, 0x04]) || matchBytes(head, [0x50, 0x4b, 0x05, 0x06]))
        return "zip";
      if (matchBytes(head, [0x4d, 0x5a])) return "pe"; // MZ
      if (matchBytes(head, [0x7f, 0x45, 0x4c, 0x46])) return "elf"; // ELF
      return "unknown";
    })();

    const expectedByExt = (() => {
      const map = {
        pdf: "pdf",
        jpg: "jpeg",
        jpeg: "jpeg",
        png: "png",
        gif: "gif",
        zip: "zip",
        exe: "pe",
        dll: "pe",
        pe: "pe",
      };
      return map[ext] || null;
    })();

    const isDisguised = expectedByExt && expectedByExt !== detected;

    // JPEG EXIF presence (marker search)
    const exifNeedle = "Exif\u0000\u0000";
    const exifOffset = asText.indexOf(exifNeedle);
    const hasExif = exifOffset !== -1;

    // PDF metadata markers (simple regex on sampled text)
    function extractPdfString(tag) {
      // e.g. /Title (something)
      const regex = new RegExp(`/${tag}\\s*\\(([^)]{0,200})\\)`, "i");
      const m = asText.match(regex);
      return m?.[1] ? m[1].trim() : null;
    }

    const pdfMeta =
      detected === "pdf"
        ? {
            title: extractPdfString("Title"),
            author: extractPdfString("Author"),
            subject: extractPdfString("Subject"),
            keywords: extractPdfString("Keywords"),
            producer: extractPdfString("Producer"),
            creator: extractPdfString("Creator"),
            hasJavaScript: /\/JavaScript|JavaScript|\/JS\b/i.test(asText),
            hasEmbeddedFiles: /\/EmbeddedFiles|EmbeddedFiles/i.test(asText),
            // Helpful forensic notes (very lightweight)
            forensicNotes: [],
          }
        : null;

    if (pdfMeta?.hasJavaScript) pdfMeta.forensicNotes.push("PDF contains JavaScript markers.");
    if (pdfMeta?.hasEmbeddedFiles)
      pdfMeta.forensicNotes.push("PDF contains embedded file/collection markers.");

    const response = {
      originalName,
      detectedFileType: detected,
      fileTypeFromMime: req.file.mimetype || null,
      extension: ext,
      isDisguised,
      magic: {
        jpeg: detected === "jpeg",
        pdf: detected === "pdf",
        png: detected === "png",
        gif: detected === "gif",
        zip: detected === "zip",
        pe: detected === "pe",
        elf: detected === "elf",
      },
      exif: {
        hasExif,
        exifOffset: hasExif ? exifOffset : null,
      },
      pdf: pdfMeta,
      hiddenInfo: {
        notes: pdfMeta?.forensicNotes || [],
        flags: {
          hasJavaScript: !!pdfMeta?.hasJavaScript,
          hasEmbeddedFiles: !!pdfMeta?.hasEmbeddedFiles,
        },
      },
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message || "metadata failed" });
  }
});

// 🔍 2) Subdomain Scanner (basic DNS recon)
router.post("/subdomains", async (req, res) => {
  const { domain } = req.body || {};
  const root = (domain || "").trim().toLowerCase();
  if (!root) return res.status(400).json({ error: "domain required" });

  const dns = require("dns");

  const commonPrefixes = [
    "www",
    "app",
    "api",
    "admin",
    "dev",
    "stage",
    "staging",
    "test",
    "beta",
    "portal",
    "mail",
    "m",
    "web",
    "vpn",
    "gateway",
    "secure",
    "static",
    "cdn",
  ];

  // Avoid scanning obviously invalid inputs
  if (root.includes(" ")) return res.status(400).json({ error: "invalid domain" });

  const timeoutMs = 2500;
  const resolveHost = async (host) => {
    const withTimeout = (p) =>
      Promise.race([
        p,
        new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), timeoutMs)),
      ]);

    try {
      const [a, cname] = await Promise.allSettled([
        withTimeout(dns.promises.resolve4(host)),
        withTimeout(dns.promises.resolveCname(host)),
      ]);

      const ips = a.status === "fulfilled" ? a.value : [];
      const c = cname.status === "fulfilled" ? cname.value : null;
      if (ips.length || c) return { name: host, a: ips, cname: c };
      return null;
    } catch {
      return null;
    }
  };

  try {
    const hosts = Array.from(new Set(commonPrefixes.map((p) => `${p}.${root}`)));
    const results = [];

    // Simple concurrency limiter
    const concurrency = 10;
    for (let i = 0; i < hosts.length; i += concurrency) {
      const batch = hosts.slice(i, i + concurrency);
      // eslint-disable-next-line no-await-in-loop
      const batchResults = await Promise.all(batch.map((h) => resolveHost(h)));
      for (const r of batchResults) if (r) results.push(r);
    }

    res.json({
      domain: root,
      subdomains: results,
      total: results.length,
    });
  } catch (err) {
    res.status(500).json({ error: "subdomain scan failed" });
  }
});

// 🧾 3) HTTP Header Analyzer
router.post("/header-analyze", async (req, res) => {
  const { url } = req.body || {};
  const target = (url || "").trim();
  if (!target) return res.status(400).json({ error: "url required" });

  try {
    const parsed = new URL(target);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return res.status(400).json({ error: "only http/https allowed" });
    }

    const dns = require("dns");
    const net = require("net");
    const hostname = parsed.hostname;

    const isPrivateIp = (ip) => {
      if (!net.isIP(ip)) return false;
      // IPv4 private ranges
      if (ip.startsWith("10.")) return true;
      if (ip.startsWith("172.")) {
        const second = parseInt(ip.split(".")[1], 10);
        return second >= 16 && second <= 31;
      }
      if (ip.startsWith("192.168.")) return true;
      if (ip.startsWith("127.")) return true;
      // IPv6 loopback/ULA checks (light)
      if (ip === "::1") return true;
      if (ip.startsWith("fc") || ip.startsWith("fd")) return true;
      return false;
    };

    // Basic SSRF protection: resolve hostname and block private IPs
    const lookup = async () => {
      const { address } = await dns.promises.lookup(hostname);
      return address;
    };

    const resolvedIp = await lookup();
    if (isPrivateIp(resolvedIp)) {
      return res.status(400).json({ error: "refused: private target" });
    }

    const response = await axios.get(target, {
      timeout: 12000,
      maxRedirects: 5,
      validateStatus: () => true,
    });

    const headers = response.headers || {};
    const status = response.status;
    const finalUrl = response.config?.url || target;

    const checks = [
      {
        name: "Content-Security-Policy (CSP)",
        header: "content-security-policy",
        ok: !!headers["content-security-policy"],
        value: headers["content-security-policy"] || null,
      },
      {
        name: "Strict-Transport-Security (HSTS)",
        header: "strict-transport-security",
        ok: !!headers["strict-transport-security"],
        value: headers["strict-transport-security"] || null,
      },
      {
        name: "X-Frame-Options",
        header: "x-frame-options",
        ok: !!headers["x-frame-options"],
        value: headers["x-frame-options"] || null,
      },
      {
        name: "X-Content-Type-Options",
        header: "x-content-type-options",
        ok: !!headers["x-content-type-options"],
        value: headers["x-content-type-options"] || null,
      },
      {
        name: "Referrer-Policy",
        header: "referrer-policy",
        ok: !!headers["referrer-policy"],
        value: headers["referrer-policy"] || null,
      },
      {
        name: "Permissions-Policy",
        header: "permissions-policy",
        ok: !!headers["permissions-policy"],
        value: headers["permissions-policy"] || null,
      },
    ];

    res.json({
      url: target,
      finalUrl,
      status,
      headers,
      checks,
      passed: checks.filter((c) => c.ok).length,
      totalChecks: checks.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "header analyze failed" });
  }
});

// 📊 4) Scan History Dashboard (MongoDB)
router.post("/history", async (req, res) => {
  const { toolName, input, result } = req.body || {};
  if (!toolName) return res.status(400).json({ error: "toolName required" });

  try {
    const ScanHistory = require("../../models/ScanHistory");
    const doc = await ScanHistory.create({
      toolName,
      input: input || {},
      result: result || {},
    });
    res.json({ id: doc._id, createdAt: doc.createdAt });
  } catch (err) {
    res.status(500).json({ error: err.message || "history save failed" });
  }
});

router.get("/history", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
  try {
    const ScanHistory = require("../../models/ScanHistory");
    const history = await ScanHistory.find({}).sort({ createdAt: -1 }).limit(limit);
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: err.message || "history load failed" });
  }
});

module.exports = router;

