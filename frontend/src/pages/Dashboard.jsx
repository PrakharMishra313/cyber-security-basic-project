import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { dashboardTools } from "../config/tools";

export default function Dashboard() {
  const [search, setSearch] = useState("");

  const query = search.toLowerCase().trim();

  const list = useMemo(() => {
    if (!query) return dashboardTools;
    return dashboardTools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query) ||
        tool.desc.toLowerCase().includes(query) ||
        tool.tag.toLowerCase().includes(query)
    );
  }, [query]);

  return (
    <section className="flex w-full flex-col gap-10 pb-10 animate-[dashFadeInUp_0.55s_ease-out_both]">
      <header className="relative overflow-hidden rounded-2xl border border-[#00ff9f]/20 bg-gradient-to-br from-[#030712]/90 via-[#0f172a]/80 to-[#030712]/95 p-8 shadow-[0_0_60px_-20px_rgba(0,255,159,0.15)]">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#00ff9f]/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/4 h-40 w-40 rounded-full bg-[#22d3ee]/10 blur-3xl" />

        <div className="relative space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#00ff9f]/45">
            Operations center
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#e8fff7] sm:text-4xl">
            <span className="gradient-text">Defense</span>
            <span className="text-[#00ff9f]/90"> toolchain</span>
          </h1>
          <p className="max-w-2xl font-mono text-sm leading-relaxed text-[#7dffce]/70">
            Hashing, malware checks, network recon, and crypto utilities — modular tools for analysis and
            hardening in one place.
          </p>
        </div>
      </header>

      <div>
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-lg font-bold text-[#b7ffe8] sm:text-xl">All tools</h2>
          <div className="h-px min-w-[4rem] flex-1 bg-gradient-to-r from-[#00ff9f]/35 to-transparent" />
          <span className="font-mono text-xs text-[#00ff9f]/45">
            {list.length} / {dashboardTools.length}
          </span>
        </div>

        <p className="mt-2 font-mono text-xs text-[#00ff9f]/40">Filter by name, tag, or description</p>
      </div>

      <div className="relative max-w-lg">
        <input
          type="search"
          placeholder="Search tools…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-[#00ff9f]/25 bg-[#030712]/80 py-3 pl-4 pr-11 font-mono text-sm text-[#b7ffe8] outline-none transition placeholder:text-[#00ff9f]/30 focus:border-[#00ff9f]/45 focus:shadow-[0_0_24px_rgba(0,255,159,0.1)]"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 font-mono text-xs text-[#00ff9f]/50 hover:bg-[#00ff9f]/10 hover:text-[#00ff9f]"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 auto-rows-fr">
        {list.map((tool, i) => (
          <article
            key={tool.path}
            title={tool.desc}
            style={{ animationDelay: `${i * 40}ms` }}
            className="group relative flex h-full flex-col justify-between rounded-2xl border border-[#00ff9f]/18 bg-[#030712]/50 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-300 hover:-translate-y-1 hover:border-[#00ff9f]/45 hover:shadow-[0_12px_40px_rgba(0,0,0,0.35),0_0_32px_rgba(0,255,159,0.12)]"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#00ff9f]/8 text-2xl ring-1 ring-[#00ff9f]/25 transition group-hover:bg-[#00ff9f]/12">
                  {tool.icon}
                </span>
                <span className="rounded border border-[#00ff9f]/30 bg-[#00ff9f]/8 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[#7dffce]">
                  {tool.tag}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white transition group-hover:text-[#b7ffe8]">
                {tool.name}
              </h3>

              <p className="flex-1 font-mono text-sm leading-relaxed text-[#00ff9f]/55">{tool.desc}</p>
            </div>

            <Link
              to={tool.path}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-[#00ff9f]/35 bg-[#00ff9f]/8 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#b7ffe8] transition hover:border-[#22d3ee]/40 hover:bg-[#00ff9f]/15"
            >
              Open tool
            </Link>
          </article>
        ))}

        {list.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-[#00ff9f]/25 py-16 text-center font-mono text-sm text-[#00ff9f]/50">
            No tools match “{search}”.
            <br />
            <button type="button" onClick={() => setSearch("")} className="mt-3 text-[#22d3ee] underline-offset-2 hover:underline">
              Reset search
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
