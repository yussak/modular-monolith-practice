"use client";

import { useState } from "react";

export default function CopyCouponCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("コピーに失敗しました");
    }
  }

  return (
    <button
      onClick={handleCopy}
      style={{ marginLeft: "0.5rem", padding: "0.25rem 0.75rem", cursor: "pointer" }}
    >
      {copied ? "コピーしました" : "コピー"}
    </button>
  );
}
