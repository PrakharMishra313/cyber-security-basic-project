import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-[#020617] text-white relative">

      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">

        {/* Glow blobs */}
        <div className="absolute -top-40 -right-40 w-120 h-120 rounded-full bg-[#00ff9f]/10 blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-160 h-160 rounded-full bg-[#22d3ee]/10 blur-[140px]" />
        <div className="absolute bottom-0 right-1/3 w-100 h-100 rounded-full bg-[#a78bfa]/10 blur-[120px]" />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-[#00ff9f]/10 via-transparent to-[#22d3ee]/10" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,255,159,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,159,0.8) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Scan line */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-[#00ff9f] to-transparent opacity-60" />
      </div>

      {/* Mobile overlay */}
      <button
        type="button"
        aria-label="Close menu"
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition ${
          mobileNavOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileNavOpen(false)}
      />

      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileNavOpen}
        onNavigate={() => setMobileNavOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10">

        {/* Navbar */}
        <div className="border-b border-[#00ff9f]/20 bg-black/40 backdrop-blur-xl sticky top-0 z-30">
          <Navbar onOpenMenu={() => setMobileNavOpen(true)} />
        </div>

        {/* Main */}
        <main className="flex-1 overflow-y-auto cyber-scrollbar p-6">

          {/* Glass Wrapper */}
          <div className="relative min-h-full rounded-2xl border border-[#00ff9f]/20 bg-black/40 backdrop-blur-xl shadow-[0_0_40px_rgba(0,255,159,0.1)] p-6">

            {/* Inner glow */}
            <div className="absolute inset-0 rounded-2xl border border-[#00ff9f]/10 pointer-events-none" />

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}