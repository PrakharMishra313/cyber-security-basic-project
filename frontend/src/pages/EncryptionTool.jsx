import { useMemo, useState } from "react";
import ToolPage, { toolBtnClass, toolInputClass, toolLabelClass, toolTextareaClass } from "../components/ToolPage";
import { API_BASE } from "../utils/api";

function bytesToBase64(bytes) {
  const bin = String.fromCharCode(...bytes);
  return btoa(bin);
}

function base64ToBytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function utf8ToBytes(text) {
  return new TextEncoder().encode(text);
}

function bytesToUtf8(bytes) {
  return new TextDecoder().decode(bytes);
}

async function deriveAesKey(password, saltBytes) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    utf8ToBytes(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export default function EncryptionTool() {
  const [plaintext, setPlaintext] = useState("");
  const [password, setPassword] = useState("");
  const [ciphertext, setCiphertext] = useState("");
  const [mode, setMode] = useState("aes");

  const [b64Input, setB64Input] = useState("");
  const [b64Out, setB64Out] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);

  const aesMeta = useMemo(() => {
    if (!ciphertext) return null;
    return {
      length: ciphertext.length,
    };
  }, [ciphertext]);

  const encryptAes = async () => {
    if (!password) return alert("Enter password");
    if (!plaintext) return alert("Enter text to encrypt");
    setLoading(true);
    setError("");
    setSaveOk(false);
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const key = await deriveAesKey(password, salt);
      const ctBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, utf8ToBytes(plaintext));

      const payload = [
        "aesgcm:v1",
        bytesToBase64(salt),
        bytesToBase64(iv),
        bytesToBase64(new Uint8Array(ctBuf)),
      ].join(":");

      setCiphertext(payload);
    } catch (e) {
      setError(e.message || "Encryption failed");
    } finally {
      setLoading(false);
    }
  };

  const decryptAes = async () => {
    if (!password) return alert("Enter password");
    if (!ciphertext) return alert("Paste ciphertext");
    setLoading(true);
    setError("");
    setSaveOk(false);
    try {
      const parts = ciphertext.split(":");
      if (parts.length !== 4 || parts[0] !== "aesgcm:v1") {
        throw new Error("Invalid ciphertext format (expected aesgcm:v1:...)");
      }

      const salt = base64ToBytes(parts[1]);
      const iv = base64ToBytes(parts[2]);
      const ct = base64ToBytes(parts[3]);

      const key = await deriveAesKey(password, salt);
      const ptBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
      setPlaintext(bytesToUtf8(new Uint8Array(ptBuf)));
    } catch (e) {
      setError(e.message || "Decryption failed (wrong password?)");
    } finally {
      setLoading(false);
    }
  };

  const encodeB64 = () => {
    try {
      const bytes = utf8ToBytes(b64Input);
      setB64Out(bytesToBase64(bytes));
    } catch (e) {
      setError(e.message || "Base64 encode failed");
    }
  };

  const decodeB64 = () => {
    try {
      const bytes = base64ToBytes(b64Input.trim());
      setB64Out(bytesToUtf8(bytes));
    } catch (e) {
      setError(e.message || "Base64 decode failed");
    }
  };

  const saveSummary = async () => {
    setSaving(true);
    setError("");
    setSaveOk(false);
    try {
      const res = await fetch(`${API_BASE}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName: "Encryption / Decryption Tool",
          input: {
            mode,
            plaintextLength: plaintext?.length || 0,
          },
          result: {
            ciphertextLength: ciphertext?.length || 0,
            base64Length: b64Out?.length || 0,
          },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Save failed");
      setSaveOk(true);
    } catch (e) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ToolPage
      title="Encryption / Decryption Tool"
      icon="🔐"
      description="Browser-based AES-GCM (256-bit) + Base64 utilities. No plaintext is sent to the server."
    >
      <div className="flex flex-col gap-6 sm:gap-7">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={`px-4 py-2 rounded-xl border font-mono text-sm ${
              mode === "aes"
                ? "border-[#00ff9f]/55 bg-[#00ff9f]/10 text-[#00ff9f]"
                : "border-transparent bg-[#030712]/40 text-[#b7ffe8]"
            }`}
            onClick={() => setMode("aes")}
          >
            AES (Encrypt/Decrypt)
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-xl border font-mono text-sm ${
              mode === "b64"
                ? "border-[#00ff9f]/55 bg-[#00ff9f]/10 text-[#00ff9f]"
                : "border-transparent bg-[#030712]/40 text-[#b7ffe8]"
            }`}
            onClick={() => setMode("b64")}
          >
            Base64
          </button>
        </div>

        {mode === "aes" ? (
          <div className="space-y-5">
            <div>
              <label className={toolLabelClass}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={toolInputClass} />
            </div>

            <div className="space-y-3">
              <label className={toolLabelClass}>Plaintext</label>
              <textarea
                value={plaintext}
                onChange={(e) => setPlaintext(e.target.value)}
                className={toolTextareaClass}
                placeholder="Enter sensitive text…"
              />
            </div>

            <div className="space-y-3">
              <label className={toolLabelClass}>Ciphertext (aesgcm:v1…)</label>
              <textarea
                value={ciphertext}
                onChange={(e) => setCiphertext(e.target.value)}
                className={toolTextareaClass}
                placeholder="Paste encrypted payload here to decrypt."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" disabled={loading} className={toolBtnClass} onClick={encryptAes}>
                {loading ? "Working…" : "Encrypt (AES-GCM)"}
              </button>
              <button type="button" disabled={loading} className={toolBtnClass} onClick={decryptAes}>
                {loading ? "Working…" : "Decrypt (AES-GCM)"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className={toolLabelClass}>Text / Bytes</label>
              <textarea value={b64Input} onChange={(e) => setB64Input(e.target.value)} className={toolTextareaClass} placeholder="Text to encode, or Base64 to decode…" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" className={toolBtnClass} onClick={encodeB64}>
                Encode Base64
              </button>
              <button type="button" className={toolBtnClass} onClick={decodeB64}>
                Decode Base64
              </button>
            </div>
            <div>
              <label className={toolLabelClass}>Output</label>
              <textarea value={b64Out} readOnly className={`${toolTextareaClass} opacity-90`} placeholder="Output will appear here…" />
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-400 font-mono">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            disabled={saving}
            className={`w-full sm:w-auto ${toolBtnClass} ${saving ? "cursor-not-allowed" : ""}`}
            onClick={saveSummary}
          >
            {saving ? "Saving…" : "Save summary to history"}
          </button>
          {saveOk && <p className="text-sm text-[#00ff9f] font-mono pt-2 sm:pt-0">Saved.</p>}
        </div>

        {ciphertext && aesMeta && (
          <div className="code-block font-mono text-xs whitespace-pre-wrap">
            <p className="text-[#00ff9f] font-bold">AES payload summary</p>
            <p>Ciphertext chars: {aesMeta.length}</p>
          </div>
        )}
      </div>
    </ToolPage>
  );
}