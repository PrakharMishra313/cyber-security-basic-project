import { useMemo, useState } from "react";
import ToolPage from "../components/ToolPage";

const RE = {
  ipv4: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g,
  md5: /\b[a-fA-F0-9]{32}\b/g,
  sha1: /\b[a-fA-F0-9]{40}\b/g,
  sha256: /\b[a-fA-F0-9]{64}\b/g,
  url: /\bhttps?:\/\/[^\s<>"']+/gi,
  // Basic domain extraction; avoids matching trailing punctuation
  domain: /\b(?:(?:[a-zA-Z0-9-]{1,63}\.)+(?:[a-zA-Z]{2,63}))\b/g,
};

function uniq(arr) {
  return Array.from(new Set(arr));
}

function stripPunct(s) {
  return String(s || "").replace(/[)\],.;:!?]+$/g, "");
}

export default function IOCExtractor() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const extracted = useMemo(() => {
    const src = String(text || "");
    const urls = uniq((src.match(RE.url) || []).map(stripPunct));
    const ips = uniq(src.match(RE.ipv4) || []);
    const sha256 = uniq((src.match(RE.sha256) || []).map((s) => s.toLowerCase()));
    const sha1 = uniq((src.match(RE.sha1) || []).map((s) => s.toLowerCase())).filter(
      (s) => !sha256.includes(s)
    );
    const md5 = uniq((src.match(RE.md5) || []).map((s) => s.toLowerCase())).filter(
      (s) => !sha1.includes(s) && !sha256.includes(s)
    );

    // domains: derive from URLs too, then merge with raw domain matches
    const urlDomains = urls
      .map((u) => {
        try {
          return new URL(u).hostname;
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    const rawDomains = (src.match(RE.domain) || []).map(stripPunct).map((d) => d.toLowerCase());
    const domains = uniq([...rawDomains, ...urlDomains.map((d) => String(d).toLowerCase())]).filter(
      (d) => !ips.includes(d)
    );

    return { urls, ips, domains, md5, sha1, sha256 };
  }, [text]);

  const total =
    extracted.urls.length +
    extracted.ips.length +
    extracted.domains.length +
    extracted.md5.length +
    extracted.sha1.length +
    extracted.sha256.length;

  const exportText = useMemo(() => {
    const lines = [];
    const push = (label, arr) => {
      lines.push(`# ${label} (${arr.length})`);
      for (const v of arr) lines.push(v);
      lines.push("");
    };
    push("URLs", extracted.urls);
    push("Domains", extracted.domains);
    push("IPv4", extracted.ips);
    push("SHA-256", extracted.sha256);
    push("SHA-1", extracted.sha1);
    push("MD5", extracted.md5);
    return lines.join("\n").trim() + "\n";
  }, [extracted]);

  return (
    <ToolPage
      title="IOC Extractor"
      icon="🧷"
      description="Paste logs/text and extract URLs, domains, IPs, and hashes for triage."
    >
      <div className="terminal-panel p-5 sm:p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-xs text-[#00ff9f]/50">
            Extracted: <span className="text-[#b7ffe8]">{total}</span> IOCs
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setText("");
                setCopied(false);
              }}
              className="rounded-xl border border-[#00ff9f]/30 bg-[#00ff9f]/10 px-4 py-2 text-xs font-mono text-[#b7ffe8] hover:bg-[#00ff9f]/20"
            >
              Clear
            </button>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(exportText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1200);
                } catch {
                  // ignore
                }
              }}
              className="rounded-xl border border-[#00ff9f]/30 bg-[#00ff9f]/10 px-4 py-2 text-xs font-mono text-[#b7ffe8] hover:bg-[#00ff9f]/20"
              title="Copy all extracted IOCs"
            >
              {copied ? "Copied" : "Copy Export"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <div className="text-xs font-mono text-[#00ff9f]/60">Input</div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste logs, SIEM alerts, email headers, URLs, hashes, etc..."
              className="min-h-[320px] w-full rounded-2xl border border-[#00ff9f]/20 bg-[#030712]/60 p-4 text-sm text-[#b7ffe8] outline-none"
            />
          </div>

          <div className="flex flex-col gap-4">
            {[
              ["URLs", extracted.urls],
              ["Domains", extracted.domains],
              ["IPv4", extracted.ips],
              ["SHA-256", extracted.sha256],
              ["SHA-1", extracted.sha1],
              ["MD5", extracted.md5],
            ].map(([label, arr]) => (
              <div
                key={label}
                className="rounded-2xl border border-[#00ff9f]/15 bg-[#030712]/40"
              >
                <div className="flex items-center justify-between border-b border-[#00ff9f]/10 px-4 py-2">
                  <div className="text-xs font-mono text-[#00ff9f]/70">{label}</div>
                  <div className="text-[11px] font-mono text-[#00ff9f]/45">{arr.length}</div>
                </div>
                <div className="max-h-[160px] overflow-y-auto cyber-scrollbar px-4 py-3">
                  {arr.length === 0 ? (
                    <div className="text-sm text-[#00ff9f]/40">None</div>
                  ) : (
                    <ul className="space-y-1">
                      {arr.slice(0, 120).map((v) => (
                        <li key={v} className="font-mono text-xs text-[#b7ffe8] break-all">
                          {v}
                        </li>
                      ))}
                      {arr.length > 120 && (
                        <li className="text-xs text-[#00ff9f]/45 font-mono">
                          +{arr.length - 120} more…
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolPage>
  );
}

