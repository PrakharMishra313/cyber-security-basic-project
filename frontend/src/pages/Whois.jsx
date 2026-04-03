import { useState } from "react";
import ToolPage, { toolBtnClass, toolInputClass, toolLabelClass } from "../components/ToolPage";
import { postJson } from "../utils/api";

export default function Whois() {
  const [domain, setDomain] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const lookup = async () => {
    if (!domain.trim()) return alert("Enter domain");
    setLoading(true);
    setError("");
    setData(null);
    try {
      const result = await postJson("/whois", { domain: domain.trim() });
      setData(result);
    } catch (e) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const text =
    data?.info ?? data?.raw ?? data?.result ?? (typeof data === "string" ? data : null);

  return (
    <ToolPage
      title="WHOIS Lookup"
      icon="🔎"
      description="Domain registration data from your backend."
    >
      <div>
        <label className={toolLabelClass} htmlFor="whois-domain">
          Domain
        </label>
        <input
          id="whois-domain"
          type="text"
          placeholder="example.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className={toolInputClass}
        />
      </div>
      <button type="button" disabled={loading} className={toolBtnClass} onClick={lookup}>
        {loading ? "Querying…" : "Lookup"}
      </button>
      {error && <p className="text-sm text-red-400 font-mono">{error}</p>}
      {data && (
        <div className="code-block text-[#00ff9f] text-sm font-mono whitespace-pre-wrap max-h-80 overflow-y-auto">
          {text != null ? String(text) : JSON.stringify(data, null, 2)}
        </div>
      )}
    </ToolPage>
  );
}
