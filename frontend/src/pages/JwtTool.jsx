import { useMemo, useState } from "react";
import ToolPage from "../components/ToolPage";

function b64urlToBytes(input) {
  const s = String(input || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = s + "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function bytesToB64url(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  return b64;
}

function safeJsonParse(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: e?.message || "Invalid JSON" };
  }
}

async function verifyHs256({ token, secret }) {
  const [h, p, sig] = String(token || "").split(".");
  if (!h || !p || !sig) return { ok: false, error: "JWT must be header.payload.signature" };

  const headerBytes = b64urlToBytes(h);
  const payloadBytes = b64urlToBytes(p);
  const headerText = new TextDecoder().decode(headerBytes);
  const payloadText = new TextDecoder().decode(payloadBytes);
  const header = safeJsonParse(headerText);
  const payload = safeJsonParse(payloadText);

  if (!header.ok) return { ok: false, error: `Header JSON error: ${header.error}` };
  if (!payload.ok) return { ok: false, error: `Payload JSON error: ${payload.error}` };

  const alg = header.value?.alg;
  if (alg !== "HS256") {
    return { ok: false, error: `Only HS256 supported (token alg=${alg || "unknown"})` };
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret || ""),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const data = new TextEncoder().encode(`${h}.${p}`);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, data));
  const expected = bytesToB64url(mac);
  const valid = expected === sig;

  return {
    ok: true,
    valid,
    header: header.value,
    payload: payload.value,
    expectedSignature: expected,
    tokenSignature: sig,
  };
}

export default function JwtTool() {
  const [token, setToken] = useState("");
  const [secret, setSecret] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const decoded = useMemo(() => {
    const parts = String(token || "").trim().split(".");
    if (parts.length < 2) return { ok: false, error: "Paste a JWT (header.payload.signature)" };
    try {
      const headerText = new TextDecoder().decode(b64urlToBytes(parts[0]));
      const payloadText = new TextDecoder().decode(b64urlToBytes(parts[1]));
      const header = safeJsonParse(headerText);
      const payload = safeJsonParse(payloadText);
      if (!header.ok) return { ok: false, error: `Header JSON error: ${header.error}` };
      if (!payload.ok) return { ok: false, error: `Payload JSON error: ${payload.error}` };
      return { ok: true, header: header.value, payload: payload.value };
    } catch (e) {
      return { ok: false, error: e?.message || "Decode failed" };
    }
  }, [token]);

  return (
    <ToolPage
      title="JWT Tool"
      icon="🪪"
      description="Decode JWT header/payload, and optionally verify HS256 signatures locally (no server)."
    >
      <div className="terminal-panel p-5 sm:p-6 flex flex-col gap-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <div className="text-xs font-mono text-[#00ff9f]/60">JWT</div>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
              className="min-h-40 w-full rounded-2xl border border-[#00ff9f]/20 bg-[#030712]/60 p-4 text-sm text-[#b7ffe8] outline-none"
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="text-xs font-mono text-[#00ff9f]/60">HS256 verification (optional)</div>
            <input
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Secret (never sent anywhere)"
              className="w-full rounded-xl border border-[#00ff9f]/25 bg-[#030712]/70 px-4 py-3 text-sm text-[#b7ffe8] outline-none"
            />
            <button
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  const r = await verifyHs256({ token, secret });
                  setVerifyResult(r);
                } catch (e) {
                  setVerifyResult({ ok: false, error: e?.message || "Verify failed" });
                } finally {
                  setBusy(false);
                }
              }}
              className="rounded-xl border border-[#00ff9f]/30 bg-[#00ff9f]/10 px-4 py-3 text-xs font-mono text-[#b7ffe8] hover:bg-[#00ff9f]/20 disabled:opacity-60"
            >
              Verify HS256
            </button>

            {verifyResult && (
              <div
                className={`rounded-2xl border p-4 text-sm ${
                  verifyResult.ok && verifyResult.valid
                    ? "border-[#00ff9f]/35 bg-[#00ff9f]/10 text-[#b7ffe8]"
                    : "border-red-400/35 bg-red-400/10 text-red-100"
                }`}
              >
                {verifyResult.ok ? (
                  <div className="font-mono">
                    Signature: <b>{verifyResult.valid ? "VALID" : "INVALID"}</b>
                  </div>
                ) : (
                  <div className="font-mono">{verifyResult.error}</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-[#00ff9f]/15 bg-[#030712]/40 p-4">
            <div className="text-xs font-mono text-[#00ff9f]/60 mb-2">Header</div>
            <pre className="code-block text-xs">
              {decoded.ok ? JSON.stringify(decoded.header, null, 2) : decoded.error}
            </pre>
          </div>
          <div className="rounded-2xl border border-[#00ff9f]/15 bg-[#030712]/40 p-4">
            <div className="text-xs font-mono text-[#00ff9f]/60 mb-2">Payload</div>
            <pre className="code-block text-xs">
              {decoded.ok ? JSON.stringify(decoded.payload, null, 2) : decoded.error}
            </pre>
          </div>
        </div>
      </div>
    </ToolPage>
  );
}