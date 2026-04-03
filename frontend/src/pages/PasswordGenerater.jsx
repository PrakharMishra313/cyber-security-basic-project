import { useState } from "react";
import ToolPage, { toolBtnClass, toolInputClass, toolLabelClass } from "../components/ToolPage";

export default function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);

  const generate = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let pass = "";
    const cryptoObj = globalThis.crypto;
    if (cryptoObj?.getRandomValues) {
      const buf = new Uint32Array(length);
      cryptoObj.getRandomValues(buf);
      for (let i = 0; i < length; i++) pass += chars[buf[i] % chars.length];
    } else {
      for (let i = 0; i < length; i++) pass += chars[Math.floor(Math.random() * chars.length)];
    }
    setPassword(pass);
  };

  const copy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
  };

  return (
    <ToolPage
      title="Password Generator"
      icon="⚙️"
      description="Generate a random password locally in the browser."
    >
      <div>
        <label className={toolLabelClass} htmlFor="pwd-len">
          Length
        </label>
        <input
          id="pwd-len"
          type="number"
          min={8}
          max={64}
          value={length}
          onChange={(e) => setLength(Number.parseInt(e.target.value, 10) || 16)}
          className={toolInputClass}
        />
      </div>
      <button type="button" className={toolBtnClass} onClick={generate}>
        Generate
      </button>
      {password && (
        <div className="space-y-2">
          <span className={toolLabelClass}>Password</span>
          <div className="code-block break-all text-[#00ff9f] flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="flex-1">{password}</span>
            <button type="button" className="cyber-button text-xs py-2 shrink-0" onClick={copy}>
              Copy
            </button>
          </div>
        </div>
      )}
    </ToolPage>
  );
}
