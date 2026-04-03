import { NavLink } from "react-router-dom";
import { useState } from "react";

const menu = [
  {
    section: "Network",
    items: [{ name: "Dashboard", path: "/", icon: "📊" }],
  },
  {
    section: "File Ops",
    items: [
      { name: "Upload File", path: "/upload", icon: "📤" },
      { name: "Hash Tool", path: "/hash", icon: "🔐" },
      { name: "Integrity Check", path: "/integrity", icon: "🧪" },
    ],
  },
  {
    section: "Threats",
    items: [
      { name: "Malware Scan", path: "/malware", icon: "🛡️" },
      { name: "URL Scanner", path: "/url", icon: "🌐" },
    ],
  },
  {
    section: "Crypto",
    items: [
      { name: "JWT Tool", path: "/jwt", icon: "🪪" },
      { name: "Password Checker", path: "/password", icon: "🔑" },
      { name: "Password Generator", path: "/password-gen", icon: "⚙️" },
      { name: "Base64 Tool", path: "/base64", icon: "🧬" },
    ],
  },
  {
    section: "Blue Team",
    items: [{ name: "IOC Extractor", path: "/ioc", icon: "🧷" }],
  },
  {
    section: "Network Tools",
    items: [
      { name: "IP Tracker", path: "/ip", icon: "📍" },
      { name: "WHOIS Lookup", path: "/whois", icon: "🔎" },
      { name: "Port Scanner", path: "/port", icon: "📡" },
      { name: "Shodan Scanner", path: "/shodan", icon: "🛰️" },
    ],
  },
  {
    section: "Core Security Tools",
    items: [
      { name: "File Metadata Analyzer", path: "/metadata", icon: "🧠" },
      { name: "Subdomain Scanner", path: "/subdomains", icon: "🔍" },
      { name: "Encryption Tool", path: "/encrypt", icon: "🔐" },
      { name: "HTTP Header Analyzer", path: "/headers", icon: "🧾" },
      { name: "Scan History Dashboard", path: "/history", icon: "📊" },
    ],
  },
];

export default function Sidebar({ mobileOpen = false, onNavigate }) {
  const [openSections, setOpenSections] = useState(
    menu.reduce((acc, sec) => ({ ...acc, [sec.section]: true }), {})
  );

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-50 flex w-[min(18rem,88vw)] flex-col
        border-r border-[#00ff9f]/15 bg-[#030712]/95 backdrop-blur-2xl
        transition-transform duration-300
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      {/* HEADER */}
      <div className="relative border-b border-[#00ff9f]/15 px-5 py-6">
        <h2 className="text-xl font-bold text-[#00ff9f] neon-glow">
          TERMINAL
        </h2>

        {/* Mobile close */}
        <button
          onClick={onNavigate}
          className="absolute top-4 right-4 lg:hidden text-[#00ff9f]/60 hover:text-[#00ff9f]"
        >
          ✕
        </button>
      </div>

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-5">
        {menu.map((group) => (
          <div key={group.section}>
            
            {/* SECTION HEADER */}
            <button
              onClick={() => toggleSection(group.section)}
              className="w-full flex justify-between items-center px-2 mb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[#00ff9f]/45 hover:text-[#00ff9f]"
            >
              {group.section}
              <span>
                {openSections[group.section] ? "−" : "+"}
              </span>
            </button>

            {/* ITEMS */}
            {openSections[group.section] && (
              <div className="flex flex-col gap-2">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-mono transition
                      ${
                        isActive
                          ? "bg-[#00ff9f]/15 text-[#b7ffe8] border border-[#00ff9f]/40"
                          : "text-[#00ff9f]/70 hover:bg-[#00ff9f]/10 hover:text-[#00ff9f]"
                      }`
                    }
                  >
                    <span className="w-8 text-center">{item.icon}</span>
                    <span className="flex-1">{item.name}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition">
                      →
                    </span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="border-t border-[#00ff9f]/15 p-4 text-center text-xs text-[#00ff9f]/40">
        CYBERSECURE v1.0
      </div>
    </aside>
  );
}