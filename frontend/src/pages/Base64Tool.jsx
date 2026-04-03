import { useState } from "react";
import ToolPage, { toolBtnClass, toolTextareaClass, toolLabelClass } from "../components/ToolPage";

export default function Base64Tool() {
  const [text, setText] = useState("");
  const [encoded, setEncoded] = useState("");
  const [decoded, setDecoded] = useState("");

  const encode = () => {
    try {
      setEncoded(btoa(unescape(encodeURIComponent(text))));
      setDecoded("");
    } catch {
      alert("Could not encode (invalid text)");
    }
  };

  const decode = () => {
    try {
      setDecoded(decodeURIComponent(escape(atob(text))));
      setEncoded("");
    } catch {
      alert("Invalid Base64");
    }
  };

  return (
    <ToolPage
      title="Base64 Tool"
      icon="🧬"
      description="Encode or decode text with Base64 (UTF-8 safe for typical text)."
    >
      <div>
        <label className={toolLabelClass} htmlFor="b64-text">
          Input
        </label>
        <textarea
          id="b64-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text…"
          className={toolTextareaClass}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" className={toolBtnClass} onClick={encode}>
          Encode
        </button>
        <button type="button" className={toolBtnClass} onClick={decode}>
          Decode
        </button>
      </div>
      {encoded && (
        <div>
          <span className={toolLabelClass}>Encoded</span>
          <div className="code-block break-all text-[#00ff9f]">{encoded}</div>
        </div>
      )}
      {decoded && (
        <div>
          <span className={toolLabelClass}>Decoded</span>
          <div className="code-block break-all text-[#00ff9f] whitespace-pre-wrap">{decoded}</div>
        </div>
      )}
    </ToolPage>
  );
}
