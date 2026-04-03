const axios = require("axios");
const { SHODAN_API_KEY } = require("../config/config");

exports.shodan = async (req, res) => {
  try {
    if (!SHODAN_API_KEY) {
      return res.status(400).json({ error: "SHODAN_API_KEY not configured" });
    }
    const r = await axios.get(
      `https://api.shodan.io/shodan/host/${req.params.ip}?key=${SHODAN_API_KEY}`
    );

    res.json({
      ip: r.data.ip_str,
      ports: r.data.ports,
      org: r.data.org,
      os: r.data.os,
    });
  } catch {
    res.status(500).json({ error: "Shodan failed" });
  }
};

exports.ipLookup = async (req, res) => {
  const r = await axios.get(`http://ip-api.com/json/${req.params.ip}`);
  res.json(r.data);
};