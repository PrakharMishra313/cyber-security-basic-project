const axios = require("axios");
const dns = require("dns");
const net = require("net");
const { runNmapScan } = require("../scanner/nmapScanner");

// POST /api/scan-ports  — run nmap on a host
exports.portScan = async (req, res) => {
  const { host, target } = req.body || {};
  const scanTarget = host || target;
  if (!scanTarget) return res.status(400).json({ error: "Target/host required" });

  try {
    const result = await runNmapScan(scanTarget);
    res.json({ target: scanTarget, openPorts: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Scan failed" });
  }
};

// POST /api/subdomains  — brute-force common subdomains via DNS
exports.subdomainScan = async (req, res) => {
  const root = ((req.body || {}).domain || "").trim().toLowerCase();
  if (!root) return res.status(400).json({ error: "domain required" });
  if (root.includes(" ")) return res.status(400).json({ error: "invalid domain" });

  const commonPrefixes = [
    "www", "app", "api", "admin", "dev", "stage", "staging", "test",
    "beta", "portal", "mail", "m", "web", "vpn", "gateway", "secure", "static", "cdn",
  ];

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
    const concurrency = 10;
    for (let i = 0; i < hosts.length; i += concurrency) {
      const batch = hosts.slice(i, i + concurrency);
      // eslint-disable-next-line no-await-in-loop
      const batchResults = await Promise.all(batch.map((h) => resolveHost(h)));
      for (const r of batchResults) if (r) results.push(r);
    }
    res.json({ domain: root, subdomains: results, total: results.length });
  } catch {
    res.status(500).json({ error: "Subdomain scan failed" });
  }
};

// POST /api/header-analyze  — fetch a URL and audit its security headers
exports.headerAnalyze = async (req, res) => {
  const target = ((req.body || {}).url || "").trim();
  if (!target) return res.status(400).json({ error: "url required" });

  try {
    const parsed = new URL(target);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return res.status(400).json({ error: "only http/https allowed" });
    }

    // Basic SSRF protection: resolve hostname and block private IPs
    const isPrivateIp = (ip) => {
      if (!net.isIP(ip)) return false;
      if (ip.startsWith("10.") || ip.startsWith("127.") || ip.startsWith("192.168.")) return true;
      if (ip.startsWith("172.")) {
        const second = parseInt(ip.split(".")[1], 10);
        return second >= 16 && second <= 31;
      }
      if (ip === "::1" || ip.startsWith("fc") || ip.startsWith("fd")) return true;
      return false;
    };

    const { address } = await dns.promises.lookup(parsed.hostname);
    if (isPrivateIp(address)) {
      return res.status(400).json({ error: "refused: private target" });
    }

    const response = await axios.get(target, {
      timeout: 12000,
      maxRedirects: 5,
      validateStatus: () => true,
    });

    const headers = response.headers || {};
    const checks = [
      { name: "Content-Security-Policy (CSP)",  header: "content-security-policy",  ok: !!headers["content-security-policy"],  value: headers["content-security-policy"]  || null },
      { name: "Strict-Transport-Security (HSTS)", header: "strict-transport-security", ok: !!headers["strict-transport-security"], value: headers["strict-transport-security"] || null },
      { name: "X-Frame-Options",                 header: "x-frame-options",           ok: !!headers["x-frame-options"],           value: headers["x-frame-options"]           || null },
      { name: "X-Content-Type-Options",          header: "x-content-type-options",    ok: !!headers["x-content-type-options"],    value: headers["x-content-type-options"]    || null },
      { name: "Referrer-Policy",                 header: "referrer-policy",           ok: !!headers["referrer-policy"],           value: headers["referrer-policy"]           || null },
      { name: "Permissions-Policy",              header: "permissions-policy",        ok: !!headers["permissions-policy"],        value: headers["permissions-policy"]        || null },
    ];

    res.json({
      url: target,
      finalUrl: response.config?.url || target,
      status: response.status,
      headers,
      checks,
      passed: checks.filter((c) => c.ok).length,
      totalChecks: checks.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "header analyze failed" });
  }
};

// POST /api/metadata  — magic-byte analysis + basic PDF/EXIF metadata
exports.fileMetadata = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "file required" });

    const originalName = req.file.originalname || "file";
    const ext = originalName.split(".").pop()?.toLowerCase() || "";
    const buffer = req.file.buffer || Buffer.alloc(0);
    const head = buffer.subarray(0, 32);
    const asText = buffer.subarray(0, 2 * 1024 * 1024).toString("latin1");

    function matchBytes(arr, startBytes) {
      if (arr.length < startBytes.length) return false;
      return startBytes.every((b, i) => arr[i] === b);
    }

    const detected = (() => {
      if (matchBytes(head, [0x25, 0x50, 0x44, 0x46])) return "pdf";
      if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "jpeg";
      if (matchBytes(head, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
      if (matchBytes(head, [0x47, 0x49, 0x46, 0x38]) && (head[4] === 0x39 || head[4] === 0x37)) return "gif";
      if (matchBytes(head, [0x50, 0x4b, 0x03, 0x04]) || matchBytes(head, [0x50, 0x4b, 0x05, 0x06])) return "zip";
      if (matchBytes(head, [0x4d, 0x5a])) return "pe";
      if (matchBytes(head, [0x7f, 0x45, 0x4c, 0x46])) return "elf";
      return "unknown";
    })();

    const extToType = { pdf: "pdf", jpg: "jpeg", jpeg: "jpeg", png: "png", gif: "gif", zip: "zip", exe: "pe", dll: "pe", pe: "pe" };
    const expectedByExt = extToType[ext] || null;
    const isDisguised = expectedByExt && expectedByExt !== detected;

    const exifNeedle = "Exif\u0000\u0000";
    const exifOffset = asText.indexOf(exifNeedle);
    const hasExif = exifOffset !== -1;

    function extractPdfString(tag) {
      const regex = new RegExp(`/${tag}\\s*\\(([^)]{0,200})\\)`, "i");
      const m = asText.match(regex);
      return m?.[1] ? m[1].trim() : null;
    }

    const pdfMeta = detected === "pdf"
      ? {
          title:    extractPdfString("Title"),
          author:   extractPdfString("Author"),
          subject:  extractPdfString("Subject"),
          keywords: extractPdfString("Keywords"),
          producer: extractPdfString("Producer"),
          creator:  extractPdfString("Creator"),
          hasJavaScript:    /\/JavaScript|JavaScript|\/JS\b/i.test(asText),
          hasEmbeddedFiles: /\/EmbeddedFiles|EmbeddedFiles/i.test(asText),
          forensicNotes: [],
        }
      : null;

    if (pdfMeta?.hasJavaScript) pdfMeta.forensicNotes.push("PDF contains JavaScript markers.");
    if (pdfMeta?.hasEmbeddedFiles) pdfMeta.forensicNotes.push("PDF contains embedded file/collection markers.");

    res.json({
      originalName,
      detectedFileType: detected,
      fileTypeFromMime: req.file.mimetype || null,
      extension: ext,
      isDisguised,
      magic: { jpeg: detected === "jpeg", pdf: detected === "pdf", png: detected === "png", gif: detected === "gif", zip: detected === "zip", pe: detected === "pe", elf: detected === "elf" },
      exif: { hasExif, exifOffset: hasExif ? exifOffset : null },
      pdf: pdfMeta,
      hiddenInfo: {
        notes: pdfMeta?.forensicNotes || [],
        flags: { hasJavaScript: !!pdfMeta?.hasJavaScript, hasEmbeddedFiles: !!pdfMeta?.hasEmbeddedFiles },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "metadata failed" });
  }
};
