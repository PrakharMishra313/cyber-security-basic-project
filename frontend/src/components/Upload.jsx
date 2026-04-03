import { useState } from "react";
import { API_BASE } from "../utils/api";

export default function Upload({ refreshFiles }) {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [expiry, setExpiry] = useState(10);
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState("");

  const uploadFile = async () => {
    if (!file || !password) return alert("⚠️ Fill all fields");

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);
    formData.append("expiryMinutes", expiry);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setLink(data.link);
      refreshFiles && refreshFiles();
    } catch {
      alert("❌ Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    "w-full rounded-xl border border-[#00ff9f]/25 bg-[#030712]/70 px-3 py-3 font-mono text-sm text-[#b7ffe8] outline-none focus:border-[#00ff9f]/55 focus:shadow-[0_0_20px_rgba(0,255,159,0.12)] sm:px-4";

  return (
    <div className="panel-elevated fade-in-up flex h-full min-h-0 flex-col gap-6 p-6 sm:gap-7 sm:p-8">
      <header className="space-y-2">
        <div className="title-bar max-w-[120px] rounded-full opacity-80" />
        <h2 className="font-display text-xl font-bold tracking-tight text-[#e8fff7] sm:text-2xl">Secure upload</h2>
        <p className="font-mono text-xs leading-relaxed text-[#00ff9f]/50 sm:text-sm">AES-256 · password &amp; expiry</p>
      </header>

      <div className="flex flex-1 flex-col gap-5 sm:gap-6">
        <label className="block cursor-pointer rounded-xl border-2 border-dashed border-[#00ff9f]/25 p-6 text-center transition hover:border-[#00ff9f]/50 hover:bg-[#00ff9f]/[0.04] sm:p-8">
          <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <p className="font-mono text-sm text-[#00ff9f] sm:text-base">
            {file ? `📄 ${file.name}` : "Click or drag a file here"}
          </p>
        </label>

        <input
          type="password"
          placeholder="Encryption password…"
          className={fieldClass}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="space-y-2">
          <label className="block font-mono text-[11px] uppercase tracking-[0.12em] text-[#00ff9f]/50">
            Expiry (minutes)
          </label>
          <input
            type="number"
            value={expiry}
            min={1}
            className={fieldClass}
            onChange={(e) => setExpiry(Number(e.target.value) || 10)}
          />
        </div>

        <button
          type="button"
          onClick={uploadFile}
          disabled={loading}
          className={`w-full rounded-xl py-3 font-mono text-sm font-semibold tracking-wide transition sm:py-3.5 ${
            loading
              ? "cursor-not-allowed border border-slate-600/50 bg-slate-800/80 text-slate-500"
              : "cyber-button border-[#00ff9f]/50"
          }`}
        >
          {loading ? "Uploading…" : "Upload securely"}
        </button>
      </div>

      {link && (
        <div className="flex flex-col gap-3 rounded-xl border border-[#00ff9f]/25 bg-[#030712]/60 p-4 sm:p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#00ff9f]/50">Share link</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <input
              value={link}
              readOnly
              className="min-h-[2.75rem] flex-1 rounded-lg border border-[#00ff9f]/20 bg-black/30 px-3 py-2.5 font-mono text-xs text-[#b7ffe8] outline-none sm:text-sm"
            />
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(link)}
              className="cyber-button shrink-0 px-5 py-2.5 text-xs sm:w-auto"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
