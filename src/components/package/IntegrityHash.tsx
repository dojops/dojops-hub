"use client";

import { useState } from "react";
import { CopyIconButton } from "@/components/ui/CopyIconButton";

interface IntegrityHashProps {
  hash: string;
}

export function IntegrityHash({ hash }: Readonly<IntegrityHashProps>) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded border border-glass-border bg-surface-elevated/50 p-3">
      <div className="flex items-center gap-2 mb-1">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-neon-green shrink-0"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span className="text-xs font-semibold text-text-secondary">Integrity Hash (SHA-256)</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 text-left font-mono text-xs text-text-secondary/70 hover:text-text-primary transition-colors cursor-pointer break-all"
        >
          {expanded ? hash : `${hash.slice(0, 16)}...${hash.slice(-8)}`}
        </button>
        <CopyIconButton
          copied={copied}
          onCopy={handleCopy}
          size={14}
          className="shrink-0 rounded px-2 py-1 text-xs text-text-secondary hover:text-text-primary hover:bg-glass-border/50 transition-colors cursor-pointer"
          copiedIconClassName="text-neon-green"
          title="Copy full hash"
        />
      </div>
    </div>
  );
}
