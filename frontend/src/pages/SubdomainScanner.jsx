import { useState } from "react";
import ToolPage, { toolBtnClass, toolInputClass, toolLabelClass } from "../components/ToolPage";
import { postJson, saveScanHistory } from "../utils/api";

export default function SubdomainScanner() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);

  const scan = async () => {
    if (!domain.trim()) return alert("Enter a domain (e.g. example.com)");
    setLoading(true);
    setError("");
    setResults(null);
    setSaveOk(false);

    try {
      const data = await postJson("/subdomains", { domain: domain.trim() });
      setResults(data);
    } catch (e) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = async () => {
    if (!results) return;
    setSaving(true);
    setSaveOk(false);
    try {
      await saveScanHistory({
        toolName: "Subdomain Scanner",
        input: { domain: domain.trim() },
        result: results,
      });
      setSaveOk(true);
    } catch (e) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ToolPage
      title="Subdomain Scanner"
      icon="🔍"
      description="Basic recon: checks common subdomain prefixes using DNS."
    >
      <div className="flex flex-col gap-5 sm:gap-6">
        <div>
          <label className={toolLabelClass} htmlFor="subdomain-domain">
            Domain
          </label>
          <input
            id="subdomain-domain"
            type="text"
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className={toolInputClass}
          />
        </div>

        <button type="button" disabled={loading} className={toolBtnClass} onClick={scan}>
          {loading ? "Scanning…" : "Scan subdomains"}
        </button>

        {error && <p className="text-sm text-red-400 font-mono">{error}</p>}

        {results && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[#00ff9f]/30 bg-[#00ff9f]/10 px-3 py-1 text-[11px] font-mono font-semibold">
                {results.total} found
              </span>
              <span className="rounded-full border border-[#00ff9f]/30 bg-[#00ff9f]/10 px-3 py-1 text-[11px] font-mono font-semibold">
                Domain: {results.domain}
              </span>
            </div>

            {results.subdomains?.length ? (
              <div className="space-y-3">
                {results.subdomains.map((s) => (
                  <div key={s.name} className="code-block text-xs font-mono">
                    <p className="text-[#00ff9f] font-bold">{s.name}</p>
                    {s.a?.length ? <p>A: {s.a.join(", ")}</p> : null}
                    {s.cname ? <p>CNAME: {s.cname}</p> : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#00ff9f]/60 font-mono">No common subdomains resolved.</p>
            )}
          </div>
        )}

        <button
          type="button"
          disabled={!results || saving}
          className={`w-full sm:w-auto ${toolBtnClass} ${saving ? "cursor-not-allowed" : ""}`}
          onClick={saveToHistory}
        >
          {saving ? "Saving…" : "Save to history"}
        </button>
        {saveOk && <p className="text-sm text-[#00ff9f] font-mono">Saved.</p>}
      </div>
    </ToolPage>
  );
}

