import { useState } from "react";
import ToolPage, { toolBtnClass, toolInputClass, toolLabelClass } from "../components/ToolPage";
import { API_BASE } from "../utils/api";

export default function PasswordChecker() {
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const check = async () => {
    setLoading(true);
    setError("");
    setStrength(null);
    try {
      const res = await fetch(`${API_BASE}/check-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Check failed");
      setStrength(data);
    } catch (e) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const level =
    strength?.level ?? strength?.strength ?? (typeof strength === "string" ? strength : null);

  return (
    <ToolPage
      title="Password Checker"
      icon="🔑"
      description="Server-side strength evaluation when the API is available."
    >
      <div>
        <label className={toolLabelClass} htmlFor="pwd-check">
          Password
        </label>
        <input
          id="pwd-check"
          type="password"
          placeholder="Enter password…"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={toolInputClass}
          autoComplete="off"
        />
      </div>
      <button type="button" disabled={loading} className={toolBtnClass} onClick={check}>
        {loading ? "Checking…" : "Evaluate"}
      </button>
      {error && <p className="text-sm text-red-400 font-mono">{error}</p>}
      {strength && (
        <div className="code-block text-[#00ff9f] font-mono space-y-1">
          {level != null && <p>Level: {String(level)}</p>}
          {strength.score != null && <p>Score: {strength.score}</p>}
          {strength.feedback && <p>{strength.feedback}</p>}
          {!level && strength.score == null && !strength.feedback && (
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{JSON.stringify(strength, null, 2)}</pre>
          )}
        </div>
      )}
    </ToolPage>
  );
}
