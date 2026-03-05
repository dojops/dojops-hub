"use client";

import { useState } from "react";
import { GlowCard } from "@/components/ui/GlowCard";
import { Badge } from "@/components/ui/Badge";
import { CopyIconButton } from "@/components/ui/CopyIconButton";

interface Token {
  id: string;
  name: string;
  tokenPrefix: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
}

interface TokenManagerProps {
  initialTokens: Token[];
}

export function TokenManager({ initialTokens }: Readonly<TokenManagerProps>) {
  const [tokens, setTokens] = useState<Token[]>(initialTokens);
  const [name, setName] = useState("");
  const [expiration, setExpiration] = useState("3months");
  const [creating, setCreating] = useState(false);
  const [newRawToken, setNewRawToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNewRawToken(null);
    setCreating(true);

    try {
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), expiration }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create token");
        return;
      }

      setNewRawToken(data.rawToken);
      setTokens((prev) => [
        {
          id: data.id,
          name: data.name,
          tokenPrefix: data.tokenPrefix,
          expiresAt: data.expiresAt,
          lastUsedAt: null,
          createdAt: data.createdAt,
        },
        ...prev,
      ]);
      setName("");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    setRevoking(id);
    try {
      const res = await fetch(`/api/tokens/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTokens((prev) => prev.filter((t) => t.id !== id));
      }
    } finally {
      setRevoking(null);
    }
  }

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function getExpiryBadge(expiresAt: string | null) {
    if (!expiresAt) return <Badge variant="default">No expiration</Badge>;
    const date = new Date(expiresAt);
    const now = new Date();
    const daysLeft = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return <Badge variant="red">Expired</Badge>;
    if (daysLeft <= 7) return <Badge variant="amber">Expires in {daysLeft}d</Badge>;
    return <Badge variant="green">Expires {formatDate(date)}</Badge>;
  }

  return (
    <div className="space-y-6">
      {/* Create form */}
      <GlowCard>
        <h2 className="mb-4 text-sm font-medium text-text-primary">Generate new token</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <input
              type="text"
              placeholder="Token name (e.g. My laptop)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              required
              className="flex-1 rounded-lg border border-glass-border bg-surface-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-neon-cyan/30 focus:outline-none"
            />
            <select
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
              className="rounded-lg border border-glass-border bg-surface-elevated px-3 py-2 text-sm text-text-primary focus:border-neon-cyan/30 focus:outline-none"
            >
              <option value="1month">1 month</option>
              <option value="3months">3 months</option>
              <option value="never">No expiration</option>
            </select>
            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="shrink-0 rounded-lg border border-neon-cyan/20 bg-neon-cyan/10 px-4 py-2 text-sm font-medium text-neon-cyan transition-all hover:bg-neon-cyan/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? "Generating..." : "Generate token"}
            </button>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
      </GlowCard>

      {/* One-time token display */}
      {newRawToken && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <p className="mb-2 text-sm font-medium text-emerald-400">
            Copy this token now. You won&apos;t be able to see it again.
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-glass-border bg-surface px-4 py-2.5">
            <code className="flex-1 break-all font-mono text-sm text-text-primary">
              {newRawToken}
            </code>
            <CopyIconButton
              copied={copied}
              onCopy={() => handleCopy(newRawToken)}
              ariaLabel="Copy token"
            />
          </div>
          <p className="mt-2 text-xs text-text-secondary">
            Use this token with:{" "}
            <code className="text-neon-cyan/80">
              export DOJOPS_HUB_TOKEN=&quot;{newRawToken.slice(0, 12)}...&quot;
            </code>
          </p>
        </div>
      )}

      {/* Token list */}
      {tokens.length > 0 ? (
        <div className="space-y-3">
          {tokens.map((token) => (
            <GlowCard key={token.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">{token.name}</span>
                    {getExpiryBadge(token.expiresAt)}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
                    <span>
                      <code className="text-neon-cyan/60">{token.tokenPrefix}...</code>
                    </span>
                    <span>Created {formatDate(new Date(token.createdAt))}</span>
                    {token.lastUsedAt && (
                      <span>Last used {formatDate(new Date(token.lastUsedAt))}</span>
                    )}
                    {!token.lastUsedAt && <span>Never used</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleRevoke(token.id)}
                  disabled={revoking === token.id}
                  className="shrink-0 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition-all hover:bg-red-500/10 disabled:opacity-50"
                >
                  {revoking === token.id ? "Revoking..." : "Revoke"}
                </button>
              </div>
            </GlowCard>
          ))}
        </div>
      ) : (
        !newRawToken && (
          <p className="text-center text-sm text-text-secondary">
            No API tokens yet. Generate one above to use with the CLI.
          </p>
        )
      )}
    </div>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
