import { useEffect, useMemo, useState } from "react";
import ToolPage from "../components/ToolPage";
import { getScanHistory } from "../utils/api";

export default function ScanHistoryDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const toolCounts = useMemo(() => {
    const counts = {};
    for (const h of history) {
      counts[h.toolName] = (counts[h.toolName] || 0) + 1;
    }
    return counts;
  }, [history]);

  useEffect(() => {
    let cancelled = false;
    getScanHistory(50)
      .then((j) => {
        if (!cancelled) setHistory(Array.isArray(j.history) ? j.history : []);
      })
      .catch((e) => {
        if (!cancelled) {
          const m = e.message || "Request failed";
          setError(
            /failed to fetch|networkerror/i.test(m)
              ? `${m} Ensure the API is running and MongoDB is reachable for history.`
              : m
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ToolPage
      title="Scan History Dashboard"
      icon="📊"
      description="Recent tool runs saved to MongoDB (backend-backed history)."
    >
      <div className="flex flex-col gap-5 sm:gap-6">
        {loading && <p className="text-sm text-[#00ff9f]/70 font-mono">Loading history…</p>}
        {error && <p className="text-sm text-red-400 font-mono">{error}</p>}

        {!loading && !error && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[#00ff9f]/30 bg-[#00ff9f]/10 px-3 py-1 text-[11px] font-mono font-semibold">
                {history.length} records
              </span>
              {Object.entries(toolCounts).slice(0, 4).map(([tool, count]) => (
                <span
                  key={tool}
                  className="rounded-full border border-[#00ff9f]/30 bg-[#00ff9f]/10 px-3 py-1 text-[11px] font-mono font-semibold"
                >
                  {count} · {tool}
                </span>
              ))}
            </div>

            {history.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#00ff9f]/20 bg-[#00ff9f]/[0.03] py-12 text-center font-mono text-sm text-[#00ff9f]/60">
                No history yet. Run a tool and hit “Save to history”.
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((h) => (
                  <HistoryCard key={h._id} item={h} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </ToolPage>
  );
}

function HistoryCard({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="panel-elevated p-4 sm:p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-mono text-[#00ff9f] font-bold truncate">{item.toolName}</p>
          <p className="text-xs font-mono text-[#00ff9f]/60">
            {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
          </p>
        </div>

        <button
          type="button"
          className="cyber-button text-xs px-4 py-2 rounded-xl shrink-0"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Hide" : "View"} JSON
        </button>
      </div>

      {open && (
        <div className="code-block text-xs font-mono whitespace-pre-wrap max-h-72 overflow-y-auto">
          {JSON.stringify({ input: item.input, result: item.result }, null, 2)}
        </div>
      )}
    </div>
  );
}

