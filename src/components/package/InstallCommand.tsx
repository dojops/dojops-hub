"use client";

import { useState } from "react";

export function InstallCommand({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);
  const command = `dojops modules install ${name}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-glass-border bg-surface px-4 py-2.5">
      <code className="flex-1 font-mono text-sm text-text-primary">$ {command}</code>
      <button
        onClick={handleCopy}
        className="shrink-0 text-text-secondary transition-colors hover:text-neon-cyan"
        aria-label="Copy install command"
      >
        {copied ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    </div>
  );
}
