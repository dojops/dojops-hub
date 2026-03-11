"use client";

import { useState } from "react";
import { CopyIconButton } from "@/components/ui/CopyIconButton";

export function InstallCommand({ name }: Readonly<{ name: string }>) {
  const [copied, setCopied] = useState(false);
  const command = `dojops modules install ${name}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="terminal flex items-center gap-2 px-4 py-2.5">
      <code className="flex-1 font-mono text-sm">$ {command}</code>
      <CopyIconButton copied={copied} onCopy={handleCopy} ariaLabel="Copy install command" />
    </div>
  );
}
