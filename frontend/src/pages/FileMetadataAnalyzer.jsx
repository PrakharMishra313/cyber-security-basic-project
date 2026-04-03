import { useState } from "react";
import ToolPage, { toolBtnClass } from "../components/ToolPage";
import { API_BASE } from "../utils/api";

export default function FileMetadataAnalyzer() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);

  const handleFile = (f) => {
    if (!f) return;

    // Basic validation
    if (f.size > 10 * 1024 * 1024) {
      return setError("File too large (max 10MB)");
    }

    setError("");
    setFile(f);
  };

  const analyze = async () => {
    if (!file) return setError("Please select a file");

    setLoading(true);
    setError("");
    setAnalysis(null);
    setSaveOk(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/metadata`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Metadata analysis failed");

      setAnalysis(data);
    } catch (e) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = async () => {
    if (!analysis) return;

    setSaving(true);
    setSaveOk(false);

    try {
      const payload = {
        toolName: "File Metadata Analyzer",
        input: { name: file?.name, size: file?.size },
        result: analysis,
      };

      const res = await fetch(`${API_BASE}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Save failed");

      setSaveOk(true);
    } catch (e) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ToolPage
      title="File Metadata Analyzer"
      icon="🧠"
      description="Magic-byte detection + EXIF/PDF marker extraction for digital forensics."
    >
      <div className="flex flex-col gap-5">

        {/* FILE DROP */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition
          ${
            dragActive
              ? "border-[#00ff9f] bg-[#00ff9f]/10"
              : "border-[#00ff9f]/25 hover:border-[#00ff9f]/50"
          }`}
        >
          <input
            type="file"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          <p className="text-[#00ff9f] font-mono text-sm">
            {file ? `📄 ${file.name}` : "Click or drag file here"}
          </p>
        </label>

        {/* ANALYZE BUTTON */}
        <button
          disabled={loading}
          className={toolBtnClass}
          onClick={analyze}
        >
          {loading ? "Analyzing…" : "Analyze"}
        </button>

        {/* ERROR */}
        {error && (
          <p className="text-sm text-red-400 font-mono">{error}</p>
        )}

        {/* RESULT */}
        {analysis && (
          <div className="space-y-4">

            {/* STATUS */}
            <div className="flex flex-wrap gap-3">
              <span className="badge">
                Detected: {analysis.detectedFileType}
              </span>

              <span
                className={`badge ${
                  analysis.isDisguised
                    ? "bg-red-500/10 text-red-300 border-red-400/40"
                    : ""
                }`}
              >
                {analysis.isDisguised
                  ? "Disguised file"
                  : "Looks consistent"}
              </span>
            </div>

            {/* EXIF */}
            <div className="code-block">
              {analysis.exif?.hasExif ? (
                <>
                  <p>EXIF: present</p>
                  <p>Offset: {analysis.exif.exifOffset}</p>
                </>
              ) : (
                <p>EXIF: not found</p>
              )}
            </div>

            {/* PDF */}
            {analysis.pdf && (
              <div className="code-block text-xs whitespace-pre-wrap">
                {JSON.stringify(analysis.pdf, null, 2)}
              </div>
            )}

            {/* HIDDEN */}
            <div className="code-block text-xs whitespace-pre-wrap">
              {JSON.stringify(analysis.hiddenInfo, null, 2)}
            </div>
          </div>
        )}

        {/* SAVE */}
        <div className="flex gap-3">
          <button
            disabled={!analysis || saving}
            className={toolBtnClass}
            onClick={saveToHistory}
          >
            {saving ? "Saving…" : "Save to history"}
          </button>

          {saveOk && (
            <p className="text-sm text-[#00ff9f] font-mono">Saved ✓</p>
          )}
        </div>
      </div>
    </ToolPage>
  );
}