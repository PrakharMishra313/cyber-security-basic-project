import { useState } from "react";
import ToolPage, { toolBtnClass, toolInputClass, toolLabelClass } from "../components/ToolPage";
import { API_BASE } from "../utils/api";

export default function PortScanner() {
  const [host, setHost] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const scan = async () => {
    if (!host.trim()) return alert("Enter host");
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const res = await fetch(`${API_BASE}/scan-ports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host: host.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");
      setResults(data);
    } catch (e) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const ports = results?.openPorts ?? results?.ports ?? [];

  return (
    <ToolPage
      title="Port Scanner"
      icon="📡"
      description="Probe open ports via your API (authorized targets only)."
    >
      <div>
        <label className={toolLabelClass} htmlFor="port-host">
          Host
        </label>
        <input
          id="port-host"
          type="text"
          placeholder="hostname or IP"
          value={host}
          onChange={(e) => setHost(e.target.value)}
          className={toolInputClass}
        />
      </div>
      <button type="button" disabled={loading} className={toolBtnClass} onClick={scan}>
        {loading ? "Scanning…" : "Scan ports"}
      </button>
      {error && <p className="text-sm text-red-400 font-mono">{error}</p>}
      {results && (
        <div className="code-block text-[#00ff9f] font-mono text-sm">
          <p>Open ports: {Array.isArray(ports) ? ports.length : 0}</p>
          {Array.isArray(ports) && ports.length > 0 && (
            <p className="mt-2 break-all">{ports.join(", ")}</p>
          )}
          <pre className="text-xs mt-3 overflow-x-auto opacity-80 whitespace-pre-wrap">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </ToolPage>
  );
}
