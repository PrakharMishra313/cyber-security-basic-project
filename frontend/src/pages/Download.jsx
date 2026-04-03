import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import ToolPage, { toolBtnClass, toolInputClass, toolLabelClass } from "../components/ToolPage";
import { API_BASE } from "../utils/api";

export default function Download() {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingMeta(true);
    setMetaError("");
    fetch(`${API_BASE}/file/${id}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
        return data;
      })
      .then((data) => {
        if (!cancelled) setFile(data);
      })
      .catch((e) => {
        if (!cancelled) setMetaError(e.message || "Could not load file info");
      })
      .finally(() => {
        if (!cancelled) setLoadingMeta(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const displayName = file?.name ?? file?.filename ?? "file";

  const download = async () => {
    if (!password) return alert("Enter password");
    setDownloadError("");
    setDownloading(true);
    try {
      const res = await fetch(`${API_BASE}/download/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Wrong password, expired, or download failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = displayName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setDownloadError(e.message || "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ToolPage
      title="Secure download"
      icon="📥"
      description="Enter the password you received with the share link."
    >
      {loadingMeta && (
        <p className="text-sm text-[#00ff9f]/70 font-mono">Loading file info…</p>
      )}
      {metaError && (
        <p className="text-sm text-red-400 font-mono border-l-2 border-red-400 pl-3">{metaError}</p>
      )}
      {!loadingMeta && !metaError && file && (
        <div className="flex flex-col gap-5 sm:gap-6">
          <p className="font-mono text-sm text-[#00ff9f] sm:text-base">
            File: <span className="text-[#66e0ff]">{displayName}</span>
          </p>
          <div>
            <label className={toolLabelClass} htmlFor="dl-pwd">
              Password
            </label>
            <input
              id="dl-pwd"
              type="password"
              placeholder="Decryption password…"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={toolInputClass}
              autoComplete="off"
            />
          </div>
          <button
            type="button"
            disabled={downloading}
            className={toolBtnClass}
            onClick={download}
          >
            {downloading ? "Decrypting…" : "Download"}
          </button>
          {downloadError && (
            <p className="font-mono text-sm text-red-400">{downloadError}</p>
          )}
        </div>
      )}
    </ToolPage>
  );
}
