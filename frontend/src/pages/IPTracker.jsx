import { useMemo, useState } from "react";
import ToolPage, {
  toolBtnClass,
  toolInputClass,
  toolLabelClass,
} from "../components/ToolPage";
import { API_BASE } from "../utils/api";

function isLikelyIp(input) {
  const v = String(input || "").trim();
  if (!v) return false;
  // basic IPv4/IPv6 shape check (server does full validation)
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(v) || v.includes(":");
}

function sevFromGeo(geo) {
  if (!geo) return { label: "UNKNOWN", cls: "border-[#00ff9f]/20 bg-[#00ff9f]/5 text-[#00ff9f]/70" };
  if (geo.bogon) return { label: "PRIVATE/BOGON", cls: "border-sky-300/40 bg-sky-300/10 text-sky-100" };
  if (geo.proxy || geo.hosting) return { label: "RISK", cls: "border-amber-300/40 bg-amber-300/10 text-amber-100" };
  return { label: "OK", cls: "border-[#00ff9f]/35 bg-[#00ff9f]/10 text-[#b7ffe8]" };
}

export default function IPTracker() {
  const [ip, setIp] = useState("");
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const track = async ({ mode } = { mode: "manual" }) => {
    const value = ip.trim();
    if (mode === "manual" && (!value || !isLikelyIp(value))) {
      setError("Enter a valid IPv4 or IPv6 address.");
      return;
    }
    setLoading(true);
    setError("");
    setGeoData(null);
    try {
      const res = await fetch(`${API_BASE}/ip-info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: mode === "me" ? "" : value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lookup failed");
      setGeoData(data);
    } catch (e) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const meta = useMemo(() => sevFromGeo(geoData), [geoData]);

  return (
    <ToolPage
      title="IP Tracker"
      icon="📍"
      description="SOC-grade IP intelligence: geo + ASN/ISP + reverse DNS + risk flags."
    >
      <div className="terminal-panel p-5 sm:p-6 flex flex-col gap-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-3 items-end">
          <div>
            <label className={toolLabelClass} htmlFor="ip-in">
              IP address (IPv4 / IPv6)
            </label>
            <input
              id="ip-in"
              type="text"
              placeholder="e.g. 8.8.8.8 or 2606:4700:4700::1111"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              className={toolInputClass}
            />
          </div>

          <button
            type="button"
            disabled={loading}
            className={toolBtnClass}
            onClick={() => track({ mode: "manual" })}
          >
            {loading ? "Looking up…" : "Lookup"}
          </button>

          <button
            type="button"
            disabled={loading}
            className="rounded-xl border border-[#00ff9f]/30 bg-[#00ff9f]/10 px-4 py-3 text-xs font-mono text-[#b7ffe8] hover:bg-[#00ff9f]/20 disabled:opacity-60"
            onClick={() => track({ mode: "me" })}
            title="Lookup your current client IP (best-effort on local dev)"
          >
            My IP
          </button>
        </div>

        {error && <p className="text-sm text-red-400 font-mono">{error}</p>}

        {geoData && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="text-lg font-bold text-white">
                  {geoData.query || geoData.resolvedIp || "IP"}
                </div>
                <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-mono ${meta.cls}`}>
                  {meta.label}
                </span>
                <span className="text-[11px] font-mono text-[#00ff9f]/45">
                  v{geoData.ipVersion || "?"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-[#00ff9f]/25 bg-[#030712]/50 px-3 py-2 text-[11px] font-mono text-[#b7ffe8] hover:bg-[#00ff9f]/10"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        String(geoData.query || geoData.resolvedIp || "")
                      );
                    } catch {
                      // ignore
                    }
                  }}
                >
                  Copy IP
                </button>

                {geoData.lat != null && geoData.lon != null && (
                  <a
                    className="rounded-xl border border-[#00ff9f]/25 bg-[#030712]/50 px-3 py-2 text-[11px] font-mono text-[#b7ffe8] hover:bg-[#00ff9f]/10"
                    href={`https://www.google.com/maps?q=${geoData.lat},${geoData.lon}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Map
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-[#00ff9f]/15 bg-[#030712]/40 p-4">
                <div className="text-xs font-mono text-[#00ff9f]/60 mb-3">Enrichment</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-[#00ff9f]/55">Country</div>
                  <div className="text-white/90">{geoData.country || "—"}</div>
                  <div className="text-[#00ff9f]/55">Region</div>
                  <div className="text-white/90">{geoData.region || geoData.regionName || "—"}</div>
                  <div className="text-[#00ff9f]/55">City</div>
                  <div className="text-white/90">{geoData.city || "—"}</div>
                  <div className="text-[#00ff9f]/55">Timezone</div>
                  <div className="text-white/90">{geoData.timezone || "—"}</div>
                  <div className="text-[#00ff9f]/55">ISP</div>
                  <div className="text-white/90">{geoData.isp || "—"}</div>
                  <div className="text-[#00ff9f]/55">Org</div>
                  <div className="text-white/90">{geoData.org || "—"}</div>
                  <div className="text-[#00ff9f]/55">ASN</div>
                  <div className="text-white/90">{geoData.as || "—"}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#00ff9f]/15 bg-[#030712]/40 p-4">
                <div className="text-xs font-mono text-[#00ff9f]/60 mb-3">Signals</div>
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-mono ${geoData.bogon ? "border-sky-300/40 bg-sky-300/10 text-sky-100" : "border-[#00ff9f]/20 bg-[#00ff9f]/5 text-[#00ff9f]/70"}`}>
                    {geoData.bogon ? "BOGON/PRIVATE" : "PUBLIC"}
                  </span>
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-mono ${geoData.mobile ? "border-amber-300/40 bg-amber-300/10 text-amber-100" : "border-[#00ff9f]/20 bg-[#00ff9f]/5 text-[#00ff9f]/70"}`}>
                    {geoData.mobile ? "MOBILE" : "NON-MOBILE"}
                  </span>
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-mono ${geoData.proxy ? "border-amber-300/40 bg-amber-300/10 text-amber-100" : "border-[#00ff9f]/20 bg-[#00ff9f]/5 text-[#00ff9f]/70"}`}>
                    {geoData.proxy ? "PROXY/VPN" : "NO-PROXY"}
                  </span>
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-mono ${geoData.hosting ? "border-amber-300/40 bg-amber-300/10 text-amber-100" : "border-[#00ff9f]/20 bg-[#00ff9f]/5 text-[#00ff9f]/70"}`}>
                    {geoData.hosting ? "HOSTING" : "NON-HOSTING"}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-xs font-mono text-[#00ff9f]/60 mb-2">Reverse DNS</div>
                  {Array.isArray(geoData.reverseDns) && geoData.reverseDns.length ? (
                    <ul className="space-y-1">
                      {geoData.reverseDns.slice(0, 6).map((n) => (
                        <li key={n} className="text-xs font-mono text-[#b7ffe8] break-all">
                          {n}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-[#00ff9f]/40">None</div>
                  )}
                </div>
              </div>
            </div>

            <details className="rounded-2xl border border-[#00ff9f]/15 bg-[#030712]/40 p-4">
              <summary className="cursor-pointer text-xs font-mono text-[#00ff9f]/65">
                Raw JSON
              </summary>
              <pre className="code-block text-xs mt-3 overflow-x-auto whitespace-pre-wrap opacity-90">
                {JSON.stringify(geoData, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </ToolPage>
  );
}
