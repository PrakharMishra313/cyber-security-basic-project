/** Backend origin — override with Vite env in production */
export const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000/api";

async function parseJsonResponse(res) {
  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (!res.ok) {
        data = { error: text.trim().slice(0, 400) || res.statusText };
      } else {
        throw new Error("Server returned non-JSON response");
      }
    }
  }
  if (!res.ok) {
    const err = new Error(data.error || `${res.status} ${res.statusText}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/** JSON APIs (sets Accept; use postJson for POST bodies). */
export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
  });
  return parseJsonResponse(res);
}

/** FormData / binary uploads — do not set Content-Type (browser sets boundary). */
export async function apiFetchRaw(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
  });
  return parseJsonResponse(res);
}

export async function postJson(path, body) {
  return apiFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Secure file share ─────────────────────────────────────────────────────────

export async function uploadSecureFile(file, password, expiryMinutes = 10) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("password", password);
  formData.append("expiryMinutes", String(expiryMinutes));
  return apiFetchRaw("/upload", { method: "POST", body: formData });
}

export async function getFiles() {
  return apiFetchRaw("/files");
}

/** Decrypt and download a vault file (binary response). */
export async function downloadEncryptedFile(id, password) {
  const res = await fetch(`${API_BASE}/download/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/octet-stream" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const t = await res.text();
    let msg = "Download failed";
    if (t) {
      try {
        msg = JSON.parse(t).error || msg;
      } catch {
        msg = t.trim().slice(0, 200) || msg;
      }
    }
    throw new Error(msg);
  }
  return res.blob();
}

// ── History ─────────────────────────────────────────────────────────────────

export async function saveScanHistory(payload) {
  return postJson("/history", payload);
}

export async function getScanHistory(limit = 50) {
  return apiFetch(`/history?limit=${encodeURIComponent(limit)}`);
}

export async function getFileInfo(id) {
  return apiFetch(`/file/${encodeURIComponent(id)}`);
}

// ── VirusTotal file flow ────────────────────────────────────────────────────

/**
 * After POST /vt-file, poll GET /vt-analysis/:id until VirusTotal finishes.
 */
export async function pollVtFileAnalysis(analysisId, options = {}) {
  const maxAttempts = options.maxAttempts ?? 28;
  const intervalMs = options.intervalMs ?? 2500;
  const initialDelayMs = options.initialDelayMs ?? 2000;

  await sleep(initialDelayMs);

  for (let i = 0; i < maxAttempts; i++) {
    const data = await apiFetchRaw(`/vt-analysis/${encodeURIComponent(analysisId)}`);
    if (!data.pending) return data;
    if (i < maxAttempts - 1) await sleep(intervalMs);
  }

  throw new Error("VirusTotal analysis timed out — try again in a minute.");
}
