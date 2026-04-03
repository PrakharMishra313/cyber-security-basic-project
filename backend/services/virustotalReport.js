const axios = require("axios");
const { VT_API_KEY } = require("../config/config");

function riskFromFileStats(stats) {
  const malicious = stats.malicious || 0;
  const suspicious = stats.suspicious || 0;
  let riskLevel = "SAFE";
  if (malicious > 10) riskLevel = "HIGH";
  else if (malicious > 0 || suspicious > 0) riskLevel = "MEDIUM";
  const riskScore = Math.min(malicious * 5, 100);
  return { riskLevel, riskScore };
}

/** Map a VT v3 *file* object attributes to our API payload. */
function fileAttributesToPayload(attr) {
  const stats = attr.last_analysis_stats || {};

  const { riskLevel, riskScore } = riskFromFileStats(stats);

  const detections = Object.entries(attr.last_analysis_results || {})
    .filter(([, v]) => v.category === "malicious")
    .map(([engine, v]) => ({
      engine,
      result: v.result,
    }));

  return {
    riskLevel,
    riskScore,
    stats,
    detections,
    fileInfo: {
      type: attr.type_description,
      size: attr.size,
      magic: attr.magic,
      names: attr.names,
    },
    suspicious: {
      sandbox: attr.sandbox_verdicts,
      ids: attr.crowdsourced_ids_results,
    },
    network: {
      domains: attr.contacted_domains,
      ips: attr.contacted_ips,
    },
    scanDate: attr.last_analysis_date,
  };
}

/**
 * Full file report by SHA-256 (GET /files/{hash}).
 */
async function buildFileReportPayload(hash) {
  const result = await axios.get(`https://www.virustotal.com/api/v3/files/${hash}`, {
    headers: { "x-apikey": VT_API_KEY },
  });

  const attr = result.data?.data?.attributes;
  if (!attr) {
    throw new Error("Invalid file response from VirusTotal");
  }

  return fileAttributesToPayload(attr);
}

function vtAxiosMessage(err) {
  const d = err.response?.data;
  const nested = d?.error && typeof d.error === "object" ? d.error.message || d.error.code : null;
  return nested || d?.message || err.message || "VirusTotal request failed";
}

/**
 * Poll analysis by id; when complete, load the analyzed file via GET /analyses/{id}/item
 * (more reliable than parsing embedded relationships).
 */
async function buildReportFromAnalysisId(analysisId) {
  if (!VT_API_KEY || !String(VT_API_KEY).trim()) {
    const e = new Error("VT_API_KEY is not configured on the server");
    e.code = "VT_NO_KEY";
    throw e;
  }

  let analysisRes;
  try {
    analysisRes = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${encodeURIComponent(analysisId)}`,
      { headers: { "x-apikey": VT_API_KEY } }
    );
  } catch (err) {
    const e = new Error(vtAxiosMessage(err));
    e.status = err.response?.status;
    throw e;
  }

  const data = analysisRes.data?.data;
  const a = data?.attributes;
  if (!a) {
    throw new Error("Invalid analysis response from VirusTotal");
  }

  const status = a.status;

  if (status === "queued" || status === "in_progress" || status === "pending") {
    return { pending: true, status };
  }

  if (status === "failed") {
    const reason = a.failure_reason || a.error || "Analysis failed on VirusTotal";
    return {
      pending: false,
      failed: true,
      failureReason: reason,
      riskLevel: "UNKNOWN",
      riskScore: 0,
      stats: a.stats || {},
      detections: [],
      fileInfo: null,
      suspicious: {},
      network: {},
      scanDate: null,
    };
  }

  if (status !== "completed") {
    return { pending: true, status: status || "unknown" };
  }

  // Primary: sub-resource returns the full file object for this analysis
  try {
    const itemRes = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${encodeURIComponent(analysisId)}/item`,
      { headers: { "x-apikey": VT_API_KEY } }
    );
    const item = itemRes.data?.data;
    if (item?.type === "file" && item.attributes) {
      return { pending: false, ...fileAttributesToPayload(item.attributes) };
    }
  } catch (itemErr) {
    // Fall through to stats / relationship / hash fetch
    if (itemErr.response?.status && itemErr.response.status !== 404) {
      const e = new Error(vtAxiosMessage(itemErr));
      e.status = itemErr.response.status;
      throw e;
    }
  }

  // Descriptor list (some API versions expose the file id here)
  try {
    const relRes = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${encodeURIComponent(analysisId)}/relationships/item`,
      { headers: { "x-apikey": VT_API_KEY } }
    );
    const d = relRes.data?.data;
    const desc = Array.isArray(d) ? d[0] : d;
    if (desc?.type === "file" && desc?.id && /^[a-f0-9]{64}$/i.test(desc.id)) {
      const payload = await buildFileReportPayload(desc.id);
      return { pending: false, ...payload };
    }
  } catch (relErr) {
    if (relErr.response?.status && relErr.response.status !== 404) {
      const e = new Error(vtAxiosMessage(relErr));
      e.status = relErr.response.status;
      throw e;
    }
  }

  // Stats on the analysis object (often present when status is completed)
  const analysisStats = a.stats || {};
  if (Object.keys(analysisStats).length > 0) {
    const { riskLevel, riskScore } = riskFromFileStats(analysisStats);
    return {
      pending: false,
      riskLevel,
      riskScore,
      stats: analysisStats,
      detections: [],
      fileInfo: null,
      suspicious: {},
      network: {},
      scanDate: null,
    };
  }

  // Embedded relationship descriptor
  const rel = data.relationships?.item?.data;
  const sha256 = rel?.type === "file" && rel?.id ? rel.id : null;
  if (sha256 && /^[a-f0-9]{64}$/i.test(sha256)) {
    try {
      const payload = await buildFileReportPayload(sha256);
      return { pending: false, ...payload };
    } catch (hashErr) {
      const e = new Error(vtAxiosMessage(hashErr));
      e.status = hashErr.response?.status;
      throw e;
    }
  }

  const e = new Error(
    "Could not load scan results from VirusTotal (analysis completed but file details unavailable)."
  );
  e.code = "VT_INCOMPLETE_REPORT";
  throw e;
}

module.exports = {
  buildFileReportPayload,
  buildReportFromAnalysisId,
  riskFromFileStats,
  fileAttributesToPayload,
  vtAxiosMessage,
};
