import { useEffect, useState } from "react";
import { downloadEncryptedFile, getFiles } from "../utils/api";

export default function FileList({ refreshTrigger }) {
  const [files, setFiles] = useState([]);
  const [passwords, setPasswords] = useState({});

  useEffect(() => {
    let cancelled = false;
    getFiles()
      .then((data) => {
        if (!cancelled) setFiles(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setFiles([]);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshTrigger]);

  const downloadFile = async (id, filename) => {
    try {
      const blob = await downloadEncryptedFile(id, passwords[id] || "");
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Wrong password or download failed");
    }
  };

  const isExpired = (date) => new Date(date) < new Date();

  return (
    <div className="panel-elevated fade-in-up flex h-full min-h-0 flex-col gap-6 p-6 sm:gap-7 sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <div className="title-bar max-w-[100px] rounded-full opacity-80" />
          <h2 className="font-display text-xl font-bold tracking-tight text-[#e8fff7] sm:text-2xl">File vault</h2>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#00ff9f]/45">
            Encrypted shares on server
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-[#00ff9f]/30 bg-[#00ff9f]/10 px-3 py-1.5 font-mono text-[11px] font-semibold text-[#7dffce] sm:px-4 sm:py-2">
          {files.length} {files.length === 1 ? "file" : "files"}
        </span>
      </header>

      {files.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#00ff9f]/20 bg-[#00ff9f]/[0.03] px-4 py-12 text-center font-mono text-sm leading-relaxed text-[#00ff9f]/50 sm:py-16">
          No encrypted files yet. Upload beside this panel to populate the vault.
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1 cyber-scrollbar sm:gap-5">
        {files.map((file) => {
          const expired = isExpired(file.expiresAt);

          return (
            <div
              key={file._id}
              className="group flex flex-col gap-4 rounded-xl border border-[#00ff9f]/20 bg-[#030712]/50 p-4 transition-all hover:border-[#00ff9f]/40 hover:shadow-[0_0_28px_rgba(0,255,159,0.08)] sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 flex-1 truncate pr-2 font-mono text-sm font-medium text-[#b7ffe8]">{file.filename}</p>

                <span
                  className={`shrink-0 rounded-md px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider ${
                    expired
                      ? "border border-red-400/35 bg-red-500/10 text-red-300"
                      : "border border-[#00ff9f]/35 bg-[#00ff9f]/10 text-[#00ff9f]"
                  }`}
                >
                  {expired ? "EXPIRED" : "ACTIVE"}
                </span>
              </div>

              <p className="font-mono text-[11px] text-[#00ff9f]/50">Expires {new Date(file.expiresAt).toLocaleString()}</p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <input
                  type="password"
                  placeholder="Decryption password…"
                  className="min-h-[2.75rem] flex-1 rounded-xl border border-[#00ff9f]/25 bg-[#030712]/70 px-3 py-2.5 font-mono text-sm text-[#b7ffe8] outline-none focus:border-[#00ff9f]/55 focus:shadow-[0_0_16px_rgba(0,255,159,0.1)] sm:px-4"
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      [file._id]: e.target.value,
                    })
                  }
                />

                <button
                  type="button"
                  onClick={() => downloadFile(file._id, file.filename)}
                  disabled={expired}
                  className={
                    expired
                      ? "cursor-not-allowed rounded-xl border border-slate-600/40 bg-slate-800/60 px-5 py-3 font-mono text-sm text-slate-500 sm:shrink-0"
                      : "cyber-button px-6 py-3 text-sm sm:shrink-0"
                  }
                >
                  Download
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
