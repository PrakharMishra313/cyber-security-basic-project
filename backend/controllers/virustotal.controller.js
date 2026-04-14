const {
  buildFileReportPayload,
  buildReportFromAnalysisId,
  vtAxiosMessage,
} = require("../services/virustotalReport");
const { VT_API_KEY } = require("../config/config");

function ensureApiKey(res) {
  if (VT_API_KEY && String(VT_API_KEY).trim()) return true;
  res.status(400).json({ error: "VT_API_KEY not configured" });
  return false;
}

// POST /api/vt-file
exports.scanFile = async (req, res) => {
  try {
    if (!ensureApiKey(res)) return;
    if (!req.file) {
      return res.status(400).json({ error: "File required" });
    }

    if (req.file.size > 32 * 1024 * 1024) {
      return res.status(400).json({
        error: "File too large (max 32MB for free API)",
      });
    }

    const formData = new FormData();
    const blob = new Blob([req.file.buffer]);
    formData.append("file", blob, req.file.originalname);

    const response = await fetch("https://www.virustotal.com/api/v3/files", {
      method: "POST",
      headers: {
        "x-apikey": VT_API_KEY,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status || 500).json({
        error: "VirusTotal rejected request",
        details: data,
      });
    }

    return res.json({ analysisId: data?.data?.id || null });
  } catch (err) {
    return res.status(500).json({
      error: "Upload failed",
      details: err.message,
    });
  }
};

// GET /api/vt-analysis/:id
exports.analysisReport = async (req, res) => {
  try {
    if (!ensureApiKey(res)) return;
    const payload = await buildReportFromAnalysisId(req.params.id);
    res.json(payload);
  } catch (err) {
    res.status(err.status || 500).json({
      error: err.message || "Analysis error",
    });
  }
};

// POST /api/vt-url
exports.scanURL = async (req, res) => {
  try {
    if (!ensureApiKey(res)) return;
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ error: "url required" });

    const response = await fetch(
      "https://www.virustotal.com/api/v3/urls",
      {
        method: "POST",
        headers: {
          "x-apikey": VT_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ url }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status || 500).json({
        error: "URL scan failed",
        details: data,
      });
    }

    res.json({ analysisId: data?.data?.id || null });
  } catch (err) {
    res.status(500).json({
      error: "URL scan error",
      details: err.message,
    });
  }
};

// GET /api/vt-url/:id
exports.urlReport = async (req, res) => {
  try {
    if (!ensureApiKey(res)) return;
    const payload = await buildReportFromAnalysisId(req.params.id);
    res.json(payload);
  } catch (err) {
    res.status(err.status || 500).json({
      error: err.message || "URL report error",
    });
  }
};

// GET /api/vt-file/:hash
exports.fileReport = async (req, res) => {
  try {
    if (!ensureApiKey(res)) return;
    const payload = await buildFileReportPayload(req.params.hash);
    res.json(payload);
  } catch (err) {
    res.status(err.response?.status || err.status || 500).json({
      error: vtAxiosMessage(err),
    });
  }
};

// GET /api/vt-ip/:ip
exports.ipReport = async (req, res) => {
  try {
    if (!ensureApiKey(res)) return;
    const response = await fetch(
      `https://www.virustotal.com/api/v3/ip_addresses/${encodeURIComponent(req.params.ip)}`,
      {
        headers: {
          "x-apikey": VT_API_KEY,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status || 500).json({
        error: "IP report failed",
        details: data,
      });
    }

    const attr = data?.data?.attributes || {};

    res.json({
      stats: attr.last_analysis_stats || {},
      reputation: attr.reputation,
      country: attr.country,
      asn: attr.asn,
      network: attr.network,
    });
  } catch (err) {
    res.status(500).json({
      error: "IP report error",
      details: err.message,
    });
  }
};

// GET /api/vt-domain/:domain
exports.domainReport = async (req, res) => {
  try {
    if (!ensureApiKey(res)) return;
    const response = await fetch(
      `https://www.virustotal.com/api/v3/domains/${encodeURIComponent(req.params.domain)}`,
      {
        headers: {
          "x-apikey": VT_API_KEY,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status || 500).json({
        error: "Domain report failed",
        details: data,
      });
    }

    const attr = data?.data?.attributes || {};

    res.json({
      stats: attr.last_analysis_stats || {},
      reputation: attr.reputation,
      categories: attr.categories,
      registrar: attr.registrar,
    });
  } catch (err) {
    res.status(500).json({
      error: "Domain report error",
      details: err.message,
    });
  }
};
