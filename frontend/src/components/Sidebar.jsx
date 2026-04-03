import { NavLink } from "react-router-dom";
import { useState } from "react";
import { getSidebarMenu } from "../config/tools";

const menu = getSidebarMenu();

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
      <div className="relative border-b border-[#00ff9f]/15 px-5 py-6">
        <h2 className="text-xl font-bold text-[#00ff9f] neon-glow font-display tracking-wide">
          CYBER<span className="text-[#22d3ee]/90">HUB</span>
        </h2>
        <p className="mt-1 text-[10px] font-mono uppercase tracking-[0.2em] text-[#00ff9f]/40">
          Security toolkit
        </p>

        <button
          type="button"
          onClick={onNavigate}
          className="absolute top-4 right-4 lg:hidden text-[#00ff9f]/60 hover:text-[#00ff9f]"
        >
          ✕
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-5 cyber-scrollbar">
        {menu.map((group) => (
          <div key={group.section}>
            <button
              type="button"
              onClick={() => toggleSection(group.section)}
              className="mb-2 flex w-full items-center justify-between px-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[#00ff9f]/45 hover:text-[#00ff9f]"
            >
              {group.section}
              <span>{openSections[group.section] ? "−" : "+"}</span>
            </button>

            {openSections[group.section] && (
              <div className="flex flex-col gap-1.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-mono transition
                      ${
                        isActive
                          ? "bg-[#00ff9f]/12 text-[#e8fff7] border border-[#00ff9f]/35 shadow-[0_0_20px_rgba(0,255,159,0.08)]"
                          : "text-[#00ff9f]/65 hover:bg-[#00ff9f]/8 hover:text-[#b7ffe8] border border-transparent"
                      }`
                    }
                  >
                    <span className="w-8 text-center text-base">{item.icon}</span>
                    <span className="flex-1">{item.name}</span>
                    <span className="opacity-0 transition group-hover:opacity-100 text-[#00ff9f]/50">→</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="border-t border-[#00ff9f]/15 p-4 text-center text-[10px] font-mono text-[#00ff9f]/35">
        CYBERSEC TOOLKIT
      </div>
    </aside>
  );
}
