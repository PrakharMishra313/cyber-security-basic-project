import { useState } from "react";
import ToolPage, { toolBtnClass, toolInputClass, toolLabelClass } from "../components/ToolPage";
import { API_BASE } from "../utils/api";

export default function IntegrityCheck() {
  const [file, setFile] = useState(null);
  const [originalHash, setOriginalHash] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkIntegrity = async () => {
    if (!file || !originalHash.trim()) return alert("Provide file and original hash");
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("original", originalHash.trim());
      const res = await fetch(`${API_BASE}/integrity`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Check failed");
      setResult(data);
    } catch (e) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPage
      title="Integrity Checker"
      icon="🧪"
      description="Compare a file against a known-good hash to detect tampering."
    >
      <div>
        <label className={toolLabelClass} htmlFor="orig-hash">
          Original hash
        </label>
        <input
          id="orig-hash"
          type="text"
          placeholder="Paste expected SHA-256…"
          value={originalHash}
          onChange={(e) => setOriginalHash(e.target.value)}
          className={toolInputClass}
        />
      </div>
      <div>
        <span className={toolLabelClass}>File to verify</span>
        <label className="block border-2 border-dashed border-[#00ff9f]/25 rounded-xl p-6 text-center cursor-pointer bg-[#030712]/40 hover:border-[#00ff9f]/55 hover:bg-[#00ff9f]/[0.04] transition">
          <input
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <p className="text-[#00ff9f] font-mono text-sm">
            {file ? `📄 ${file.name}` : "Click to choose file"}
          </p>
        </label>
      </div>
      <button type="button" disabled={loading} className={toolBtnClass} onClick={checkIntegrity}>
        {loading ? "Checking…" : "Verify integrity"}
      </button>
      {error && <p className="text-sm text-red-400 font-mono">{error}</p>}
      {result && (
        <div
          className={`code-block font-mono ${result.match ? "text-[#00ff9f]" : "text-amber-400"}`}
        >
          {result.match ? "✓ Hash matches — file integrity OK." : "✗ Hash mismatch — file may be altered."}
        </div>
      )}
    </ToolPage>
  );
}
