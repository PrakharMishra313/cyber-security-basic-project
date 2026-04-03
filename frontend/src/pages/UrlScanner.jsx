import { useState } from "react";
import ToolPage, { toolBtnClass, toolInputClass, toolLabelClass } from "../components/ToolPage";
import { postJson } from "../utils/api";

export default function UrlScanner() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const scan = async () => {
    if (!url.trim()) return alert("Enter URL");
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await postJson("/scan-url", { url: url.trim() });
      setResult(data);
    } catch (e) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPage
      title="URL Scanner"
      icon="🌐"
      description="Keyword-based phishing heuristics (educational)."
    >
      <div>
        <label className={toolLabelClass} htmlFor="url-scan">
          URL
        </label>
        <input
          id="url-scan"
          type="url"
          placeholder="https://…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={toolInputClass}
        />
      </div>
      <button type="button" disabled={loading} className={toolBtnClass} onClick={scan}>
        {loading ? "Analyzing…" : "Scan URL"}
      </button>
      {error && <p className="text-sm text-red-400 font-mono">{error}</p>}
      {result && (
        <div className={`code-block font-mono ${result.safe ? "text-[#00ff9f]" : "text-amber-400"}`}>
          {result.message ||
            (result.safe ? "Heuristic: URL looks relatively safe." : "Heuristic: possible phishing patterns.")}
        </div>
      )}
    </ToolPage>
  );
}
