import { useMemo, useState } from "react";
import ToolPage, { toolBtnClass, toolInputClass, toolLabelClass } from "../components/ToolPage";
import { API_BASE } from "../utils/api";

export default function HeaderAnalyzer() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);

  const checksSummary = useMemo(() => {
    const checks = data?.checks || [];
    return checks.reduce(
      (acc, c) => {
        acc.total += 1;
        if (c.ok) acc.passed += 1;
        return acc;
      },
      { passed: 0, total: 0 }
    );
  }, [data]);

  const analyze = async () => {
    if (!url.trim()) return alert("Enter a URL (http/https)");
    setLoading(true);
    setError("");
    setData(null);
    setSaveOk(false);

    try {
      const res = await fetch(`${API_BASE}/header-analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Header analysis failed");
      setData(json);
    } catch (e) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = async () => {
    if (!data) return;
    setSaving(true);
    setSaveOk(false);
    try {
      const res = await fetch(`${API_BASE}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName: "HTTP Header Analyzer",
          input: { url: url.trim() },
          result: data,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Save failed");
      setSaveOk(true);
    } catch (e) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ToolPage
      title="HTTP Header Analyzer"
      icon="🧾"
      description="Fetches response headers and flags common security misconfigurations."
    >
      <div className="flex flex-col gap-5 sm:gap-6">
        <div>
          <label className={toolLabelClass} htmlFor="hdr-url">
            URL
          </label>
          <input
            id="hdr-url"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={toolInputClass}
          />
        </div>

        <button type="button" disabled={loading} className={toolBtnClass} onClick={analyze}>
          {loading ? "Analyzing…" : "Analyze headers"}
        </button>

        {error && <p className="text-sm text-red-400 font-mono">{error}</p>}

        {data && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[#00ff9f]/30 bg-[#00ff9f]/10 px-3 py-1 text-[11px] font-mono font-semibold">
                Status: {data.status}
              </span>
              <span className="rounded-full border border-[#00ff9f]/30 bg-[#00ff9f]/10 px-3 py-1 text-[11px] font-mono font-semibold">
                Checks: {checksSummary.passed}/{checksSummary.total}
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-mono text-[#00ff9f]">Security checks</h3>
              <div className="space-y-2">
                {data.checks?.map((c) => (
                  <div
                    key={c.name}
                    className={`code-block text-xs font-mono flex flex-col gap-1 ${
                      c.ok ? "text-[#00ff9f]" : "text-amber-300"
                    }`}
                  >
                    <p>
                      {c.ok ? "✓" : "✗"} {c.name}
                    </p>
                    <p className="text-[#00ff9f]/60">Header: {c.header}</p>
                    {c.value ? <p className="text-[#b7ffe8] break-all">Value: {c.value}</p> : <p>Value: missing</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-mono text-[#00ff9f]">Response headers</h3>
              <div className="code-block text-xs font-mono whitespace-pre-wrap">
                {JSON.stringify(data.headers, null, 2)}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            disabled={!data || saving}
            className={`w-full sm:w-auto ${toolBtnClass} ${saving ? "cursor-not-allowed" : ""}`}
            onClick={saveToHistory}
          >
            {saving ? "Saving…" : "Save to history"}
          </button>
          {saveOk && <p className="text-sm text-[#00ff9f] font-mono pt-2 sm:pt-0">Saved.</p>}
        </div>
      </div>
    </ToolPage>
  );
}

