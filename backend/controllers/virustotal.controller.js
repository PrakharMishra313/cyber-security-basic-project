const { VT_API_KEY } = require("../config/config");
console.log("VT KEY FROM ENV:", process.env.VT_API_KEY);

/* ---------------- FILE SCAN ---------------- */

// POST /api/vt-file
exports.scanFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File required" });
    }

    // Optional: size limit (free VT API)
    if (req.file.size > 32 * 1024 * 1024) {
      return res.status(400).json({
        error: "File too large (max 32MB for free API)",
      });
    }

    const formData = new FormData();

    // Convert buffer → Blob (Node 18+)
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

    console.log("VT RESPONSE:", data); // ✅ correct placement

    if (!response.ok) {
      return res.status(500).json({
        error: "VirusTotal rejected request",
        details: data,
      });
    }

    res.json({ analysisId: data.data.id });

  } catch (err) {
    console.error("VT UPLOAD ERROR:", err.message);

    res.status(500).json({
      error: "Upload failed",
      details: err.message,
    });
  }
};


/* ---------------- ANALYSIS REPORT ---------------- */

// GET /api/vt-analysis/:id
exports.analysisReport = async (req, res) => {
  try {
    const response = await fetch(
      `https://www.virustotal.com/api/v3/analyses/${req.params.id}`,
      {
        headers: {
          "x-apikey": VT_API_KEY,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: "Analysis failed",
        details: data,
      });
    }

    const stats = data.data.attributes.stats;

    let riskLevel = "SAFE";
    if (stats.malicious > 10) riskLevel = "HIGH";
    else if (stats.malicious > 0 || stats.suspicious > 0)
      riskLevel = "MEDIUM";

    const riskScore = Math.min(stats.malicious * 5, 100);

    res.json({
      riskLevel,
      riskScore,
      stats,
    });

  } catch (err) {
    console.error("VT ANALYSIS ERROR:", err.message);

    res.status(500).json({
      error: "Analysis error",
      details: err.message,
    });
  }
};


/* ---------------- URL SCAN ---------------- */

// POST /api/vt-url
exports.scanURL = async (req, res) => {
  try {
    const { url } = req.body;

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
      return res.status(500).json({
        error: "URL scan failed",
        details: data,
      });
    }

    res.json({ analysisId: data.data.id });

  } catch (err) {
    console.error("VT URL ERROR:", err.message);

    res.status(500).json({
      error: "URL scan error",
      details: err.message,
    });
  }
};


/* ---------------- URL REPORT ---------------- */

// GET /api/vt-url/:id
exports.urlReport = async (req, res) => {
  try {
    const response = await fetch(
      `https://www.virustotal.com/api/v3/analyses/${req.params.id}`,
      {
        headers: {
          "x-apikey": VT_API_KEY,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: "URL report failed",
        details: data,
      });
    }

    const stats = data.data.attributes.stats;

    let riskLevel = "SAFE";
    if (stats.malicious > 5) riskLevel = "HIGH";
    else if (stats.suspicious > 0) riskLevel = "MEDIUM";

    res.json({
      riskLevel,
      stats,
    });

  } catch (err) {
    console.error("VT URL REPORT ERROR:", err.message);

    res.status(500).json({
      error: "URL report error",
      details: err.message,
    });
  }
};


/* ---------------- IP REPORT ---------------- */

// GET /api/vt-ip/:ip
exports.ipReport = async (req, res) => {
  try {
    const response = await fetch(
      `https://www.virustotal.com/api/v3/ip_addresses/${req.params.ip}`,
      {
        headers: {
          "x-apikey": VT_API_KEY,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: "IP report failed",
        details: data,
      });
    }

    const attr = data.data.attributes;

    res.json({
      stats: attr.last_analysis_stats,
      reputation: attr.reputation,
      country: attr.country,
      asn: attr.asn,
      network: attr.network,
    });

  } catch (err) {
    console.error("VT IP ERROR:", err.message);

    res.status(500).json({
      error: "IP report error",
      details: err.message,
    });
  }
};


/* ---------------- DOMAIN REPORT ---------------- */

// GET /api/vt-domain/:domain
exports.domainReport = async (req, res) => {
  try {
    const response = await fetch(
      `https://www.virustotal.com/api/v3/domains/${req.params.domain}`,
      {
        headers: {
          "x-apikey": VT_API_KEY,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: "Domain report failed",
        details: data,
      });
    }

    const attr = data.data.attributes;

    res.json({
      stats: attr.last_analysis_stats,
      reputation: attr.reputation,
      categories: attr.categories,
      registrar: attr.registrar,
    });

  } catch (err) {
    console.error("VT DOMAIN ERROR:", err.message);

    res.status(500).json({
      error: "Domain report error",
      details: err.message,
    });
  }
};
console.log("VT KEY:", VT_API_KEY);