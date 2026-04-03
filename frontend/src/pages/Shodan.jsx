import { useState } from "react";
import ToolPage, { toolBtnClass, toolInputClass, toolLabelClass } from "../components/ToolPage";
import { API_BASE } from "../utils/api";

export default function Shodan() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = async () => {
    if (!query.trim()) return alert("Enter query");
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const res = await fetch(`${API_BASE}/shodan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setResults(data);
    } catch (e) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPage
      title="Shodan Scanner"
      icon="🛰️"
      description="Search metadata via your backend Shodan integration."
    >
      <div>
        <label className={toolLabelClass} htmlFor="shodan-q">
          Query
        </label>
        <input
          id="shodan-q"
          type="text"
          placeholder="Shodan search syntax…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={toolInputClass}
        />
      </div>
      <button type="button" disabled={loading} className={toolBtnClass} onClick={search}>
        {loading ? "Searching…" : "Search"}
      </button>
      {error && <p className="text-sm text-red-400 font-mono">{error}</p>}
      {results && (
        <div className="code-block text-[#00ff9f] text-sm font-mono max-h-96 overflow-y-auto">
          {results.total != null && <p className="mb-2">Total: {results.total}</p>}
          <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </ToolPage>
  );
}
