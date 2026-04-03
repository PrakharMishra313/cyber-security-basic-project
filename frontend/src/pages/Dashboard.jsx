import { useState } from "react";
import { Link } from "react-router-dom";

const tools = [
  {
    icon: "🔐",
    title: "Hash Generator",
    desc: "Generate SHA-256 fingerprints to detect tampering.",
    path: "/hash",
    tag: "SHA-256",
  },
  {
    icon: "🧪",
    title: "Integrity Checker",
    desc: "Verify files against a known-good hash.",
    path: "/integrity",
    tag: "VERIFY",
  },
  {
    icon: "🛡️",
    title: "Malware Scanner",
    desc: "Heuristic scan for risky signatures/patterns.",
    path: "/malware",
    tag: "SCAN",
  },
  {
    icon: "🌐",
    title: "URL Scanner",
    desc: "Keyword heuristics for phishing and suspicious URLs.",
    path: "/url",
    tag: "PHISHING",
  },
  {
    icon: "🔑",
    title: "Password Checker",
    desc: "Strength evaluation based on server scoring.",
    path: "/password",
    tag: "STRENGTH",
  },
  {
    icon: "📤",
    title: "Secure Upload",
    desc: "Encrypt & share with AES-256, password + expiry protected.",
    path: "/upload",
    tag: "AES-256",
  },
  {
    icon: "🧠",
    title: "File Metadata Analyzer",
    desc: "Magic-byte type detection + EXIF/PDF marker extraction.",
    path: "/metadata",
    tag: "FORENSICS",
  },
  {
    icon: "🔍",
    title: "Subdomain Scanner",
    desc: "DNS recon for common subdomain prefixes.",
    path: "/subdomains",
    tag: "RECON",
  },
  {
    icon: "🔐",
    title: "Encryption Tool",
    desc: "AES-GCM (256-bit) encryption/decryption + Base64 utilities.",
    path: "/encrypt",
    tag: "AES-256",
  },
  {
    icon: "🧾",
    title: "HTTP Header Analyzer",
    desc: "Fetch response headers and flag common security issues.",
    path: "/headers",
    tag: "SEC-HEADERS",
  },
  {
    icon: "📊",
    title: "Scan History Dashboard",
    desc: "Saved tool runs loaded from MongoDB history.",
    path: "/history",
    tag: "LOGS",
  },
  {
    icon: "🪪",
    title: "JWT Tool",
    desc: "Decode JWTs and optionally verify HS256 signatures offline.",
    path: "/jwt",
    tag: "JWT",
  },
  {
    icon: "🧷",
    title: "IOC Extractor",
    desc: "Extract IPs, domains, URLs, and hashes from raw logs/text.",
    path: "/ioc",
    tag: "IOCs",
  },
];

export default function Dashboard() {
  const [search, setSearch] = useState("");

  const query = search.toLowerCase().trim();

  const list = tools.filter((tool) =>
    tool.title.toLowerCase().includes(query) ||
    tool.desc.toLowerCase().includes(query) ||
    tool.tag.toLowerCase().includes(query)
  );

  return (
    <section className="flex w-full flex-col gap-8 pb-10">
      {/* HEADER */}
      <div>
        <div className="flex items-center gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#00ff9f]">
            Toolchain
          </h2>
          <div className="h-px flex-1 bg-linear-to-r from-[#00ff9f]/35 to-transparent" />
        </div>

        <p className="text-xs text-[#00ff9f]/50 mt-2">
          Showing {list.length} of {tools.length} tools
        </p>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <input
          type="search"
          placeholder="Search tools..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-[#00ff9f]/25 bg-[#030712]/70 py-3 pl-4 pr-10 text-[#b7ffe8] outline-none"
        />

        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00ff9f]/50 hover:text-[#00ff9f]"
          >
            ✕
          </button>
        )}
      </div>

      {/* GRID */}
      <div className="grid w-full grid-cols-1 gap-7 sm:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 auto-rows-fr">
        {list.map((tool, i) => (
          <article
            key={tool.path}
            title={tool.desc}
            style={{ animationDelay: `${i * 60}ms` }}
            className="group relative flex flex-col justify-between h-full rounded-2xl border border-[#00ff9f]/20 bg-[#030712]/40 p-6 transition-all hover:-translate-y-1 hover:border-[#00ff9f]/50 hover:shadow-[0_0_30px_rgba(0,255,159,0.15)]"
          >
            <div className="flex flex-col items-center text-center gap-4 h-full">
              {/* ICON + TAG */}
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00ff9f]/10 ring-1 ring-[#00ff9f]/25">
                  <span className="text-2xl">{tool.icon}</span>
                </span>
                <span className="border border-[#00ff9f]/35 bg-[#00ff9f]/10 px-2 py-1 text-[10px] text-[#7dffce]">
                  {tool.tag}
                </span>
              </div>

              {/* TITLE */}
              <h3 className="text-lg font-bold text-white group-hover:text-[#00ff9f]">
                {tool.title}
              </h3>

              {/* DESC */}
              <p className="text-sm text-[#00ff9f]/60 flex-1">
                {tool.desc}
              </p>

              {/* BUTTON */}
              <Link
                to={tool.path}
                className="mt-auto w-full rounded-xl border border-[#00ff9f]/40 bg-[#00ff9f]/10 px-4 py-2 text-xs text-[#b7ffe8] text-center hover:bg-[#00ff9f]/20"
              >
                Launch →
              </Link>
            </div>
          </article>
        ))}

        {list.length === 0 && (
          <div className="col-span-full text-center text-sm text-[#00ff9f]/55 py-16">
            No tools found for “{search}”. <br />
            Try searching "scan", "hash", or "encrypt".
          </div>
        )}
      </div>
    </section>
  );
}