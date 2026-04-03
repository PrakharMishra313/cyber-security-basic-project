
import { useEffect, useState } from "react";

export default function Navbar({ onOpenMenu = () => {} }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () =>
      setTime(new Date().toLocaleTimeString("en-IN", { hour12: false }));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="relative overflow-hidden px-4 py-4 sm:px-6 lg:px-8 xl:px-10 bg-[#0d1117] border-b border-[#00ff9f]/20">

      {/* Calm gradient glow (no animation) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#00ff9f]/10 via-transparent to-[#22d3ee]/10" />

      {/* Static scanning line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00ff9f] to-transparent opacity-70" />

      <div className="relative flex items-center justify-between gap-4">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMenu}
            className="lg:hidden shrink-0 p-2.5 rounded-lg border border-[#00ff9f]/40 bg-[#00ff9f]/10 text-[#00ff9f] hover:bg-[#00ff9f]/20 transition shadow-[0_0_15px_rgba(0,255,159,0.3)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* LOGO */}
          <div>
            <h1 className="font-extrabold tracking-wider text-xl sm:text-2xl md:text-3xl flex items-center gap-1">
              <span className="text-[#22d3ee]">//</span>
              <span className="text-[#00ff9f] drop-shadow-[0_0_8px_#00ff9f]">
                CYBER
              </span>
              <span className="bg-gradient-to-r from-[#00ff9f] to-[#22d3ee] bg-clip-text text-transparent font-black">
                HUB
              </span>
            </h1>

            <p className="text-[10px] sm:text-xs text-[#00ff9f]/50 font-mono tracking-widest">
              [ Threat Detection System ]
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">

          {/* 🔥 STATUS */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#00ff9f]/30 bg-[#00ff9f]/10 shadow-[0_0_10px_rgba(0,255,159,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute h-full w-full rounded-full bg-[#00ff9f] opacity-45" />
              <span className="relative h-2 w-2 rounded-full bg-[#00ff9f]" />
            </span>
            <span className="text-xs font-mono text-[#b7ffe8] tracking-widest">
              ONLINE
            </span>
          </div>

          {/* ⏱ TIME */}
          <div className="text-xs font-mono text-[#22d3ee] tracking-widest">
            {time}
          </div>
        </div>
      </div>

      {/* 🔥 Bottom Glow Line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00ff9f] to-transparent opacity-60" />

      {/* animation removed */}
    </nav>
  );
}