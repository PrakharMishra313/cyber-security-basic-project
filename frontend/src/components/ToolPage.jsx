/** Shared layout + input styles for security tool pages */
export const toolInputClass =
  "w-full rounded-xl border border-[#00ff9f]/25 bg-[#030712]/70 py-2.5 px-3 text-sm text-[#b7ffe8] font-mono outline-none placeholder:text-[#00ff9f]/35 focus:border-[#00ff9f]/55 focus:shadow-[0_0_20px_rgba(0,255,159,0.12)] transition-shadow";

export const toolTextareaClass = `${toolInputClass} min-h-[120px] resize-y`;

export const toolBtnClass =
  "cyber-button w-full sm:w-auto inline-flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0";

export const toolLabelClass =
  "mb-2 block font-mono text-[11px] uppercase tracking-[0.12em] text-[#00ff9f]/55";

export default function ToolPage({ title, icon = "⚙️", description, children }) {
  return ( 
    <div className="fade-in-up flex min-h-0 w-full flex-1 flex-col gap-8 lg:gap-10 xl:flex-row xl:items-start xl:gap-12 2xl:gap-14">
      <header className="shrink-0 space-y-4 xl:sticky xl:top-6 xl:w-[min(100%,20rem)] 2xl:w-88">
        <div className="flex flex-col items-center text-center xl:items-start xl:text-left">
          {/* Tool name first */}
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#e8fff7] sm:text-3xl neon-glow">
              {title}
            </h1>
            <div className="title-bar max-w-xs rounded-full xl:max-w-60" />
          </div>

          {/* Then glow the tool */}
          <div className="mt-4 flex items-center justify-center xl:justify-start">
            <div className="group relative rounded-2xl p-px bg-linear-to-br from-[#00ff9f]/40 via-[#22d3ee]/15 to-transparent">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#030712]/70 ring-1 ring-[#00ff9f]/30 shadow-[0_0_28px_rgba(0,255,159,0.18)] group-hover:shadow-[0_0_48px_rgba(0,255,159,0.28)] transition-shadow">
                <span className="text-2xl sm:text-3xl" aria-hidden>
                  {icon}
                </span>
              </div>
              {/* Subtle scan highlight */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity scan-line-hover"
              />
            </div>
          </div>

          {/* Description after */}
          {description && (
            <p className="mt-4 max-w-md font-mono text-sm leading-relaxed text-[#00ff9f]/65">
              {description}
            </p>
          )}
        </div>
      </header>

      <div className="terminal-panel flex min-h-0 w-full min-w-0 flex-1 flex-col gap-6 sm:gap-7">
        {children}
      </div>
    </div>
  );
}
