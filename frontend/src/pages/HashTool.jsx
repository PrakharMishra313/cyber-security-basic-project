
import { useState, useRef } from "react";
import ToolPage, { toolBtnClass, toolLabelClass } from "../components/ToolPage";
import { apiFetchRaw } from "../utils/api";

export default function HashTool() {
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fileRef = useRef(null);

  const handleFile = (f) => {
    setFile(f);
    setHash("");
    setError("");
  };

  const openFile = () => {
    fileRef.current?.click();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const generateHash = async () => {
    if (!file) return alert("Select file");

    setLoading(true);
    setError("");
    setHash("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const data = await apiFetchRaw("/hash", {
        method: "POST",
        body: formData,
      });

      setHash(data.hash);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPage title="SHA-256 Hash Generator" icon="🔐">

      {/* 🔥 Upload Box */}
      <div
        onClick={openFile}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative z-50 border-2 border-dashed border-[#00ff9f]/25 rounded-xl p-6 text-center cursor-pointer bg-[#030712]/50 hover:border-[#00ff9f]/55 hover:bg-[#00ff9f]/[0.04] transition"
      >
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <p className="text-[#00ff9f] font-mono text-sm">
          {file ? `📄 ${file.name}` : "Drag & Drop or Click to Upload"}
        </p>

        {file && (
          <div className="mt-3 text-xs text-[#00ff9f]/60 font-mono">
            Size: {file.size} bytes
          </div>
        )}
      </div>

      {/* 🔐 Button */}
      <button onClick={generateHash} className={toolBtnClass}>
        {loading ? "Computing..." : "Generate Hash"}
      </button>

      {/* ❌ Error */}
      {error && <p className="text-red-400">{error}</p>}

      {/* ✅ Result */}
      {hash && (
        <div>
          <span className={toolLabelClass}>SHA-256</span>
          <div className="code-block font-mono break-all text-[#00ff9f] whitespace-pre-wrap">
            {hash}
          </div>
        </div>
      )}
    </ToolPage>
  );
}