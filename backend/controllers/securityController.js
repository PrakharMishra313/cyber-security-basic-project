const axios = require("axios");
const FormData = require("form-data");

const API_KEY = process.env.VT_API_KEY;

// 🛡️ FILE UPLOAD SCAN
exports.scanFile = async (req, res) => {
  try {
    const formData = new FormData();
    formData.append("file", req.file.buffer, req.file.originalname);

    const upload = await axios.post(
      "https://www.virustotal.com/api/v3/files",
      formData,
      {
        headers: {
          "x-apikey": API_KEY,
          ...formData.getHeaders(),
        },
      }
    );

    res.json({
      analysisId: upload.data.data.id,
    });

  } catch (err) {
    res.status(500).json({ error: "File upload failed" });
  }
};

// 📊 FILE REPORT BY HASH
exports.fileReport = async (req, res) => {
  try {
    const hash = req.params.hash;

    const result = await axios.get(
      `https://www.virustotal.com/api/v3/files/${hash}`,
      {
        headers: { "x-apikey": API_KEY },
      }
    );

    res.json(result.data.data.attributes.last_analysis_stats);

  } catch {
    res.status(500).json({ error: "File report failed" });
  }
};

// 🌐 SUBMIT URL
exports.scanURL = async (req, res) => {
  try {
    const { url } = req.body;

    const submit = await axios.post(
      "https://www.virustotal.com/api/v3/urls",
      new URLSearchParams({ url }),
      {
        headers: { "x-apikey": API_KEY },
      }
    );

    res.json({ analysisId: submit.data.data.id });

  } catch {
    res.status(500).json({ error: "URL scan failed" });
  }
};

// 📊 URL REPORT
exports.urlReport = async (req, res) => {
  try {
    const id = req.params.id;

    const result = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${id}`,
      {
        headers: { "x-apikey": API_KEY },
      }
    );

    res.json(result.data.data.attributes.stats);

  } catch {
    res.status(500).json({ error: "URL report failed" });
  }
};

// 🌍 IP REPORT
exports.ipReport = async (req, res) => {
  try {
    const ip = req.params.ip;

    const result = await axios.get(
      `https://www.virustotal.com/api/v3/ip_addresses/${ip}`,
      {
        headers: { "x-apikey": API_KEY },
      }
    );

    res.json(result.data.data.attributes.last_analysis_stats);

  } catch {
    res.status(500).json({ error: "IP report failed" });
  }
};

// 🔎 DOMAIN REPORT
exports.domainReport = async (req, res) => {
  try {
    const domain = req.params.domain;

    const result = await axios.get(
      `https://www.virustotal.com/api/v3/domains/${domain}`,
      {
        headers: { "x-apikey": API_KEY },
      }
    );

    res.json(result.data.data.attributes.last_analysis_stats);

  } catch {
    res.status(500).json({ error: "Domain report failed" });
  }
};