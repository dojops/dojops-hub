"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { MetadataPreview } from "./MetadataPreview";

interface ParsedMeta {
  name: string;
  version: string;
  description: string;
  tags: string[];
  riskLevel: string | null;
  permissions: Record<string, string> | null;
}

export function PublishForm() {
  const [file, setFile] = useState<File | null>(null);
  const [changelog, setChangelog] = useState("");
  const [preview, setPreview] = useState<ParsedMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.name.endsWith(".dops")) {
      setError("File must have .dops extension");
      return;
    }

    setFile(f);
    setError(null);

    // Client-side preview
    try {
      const text = await f.text();
      const fmMatch = text.match(/^---\n([\s\S]*?)\n---/);
      if (fmMatch) {
        // Simple extraction for preview - the server does full validation
        const nameMatch = fmMatch[1].match(/name:\s*(.+)/);
        const versionMatch = fmMatch[1].match(/version:\s*["']?(.+?)["']?\s*$/m);
        const descMatch = fmMatch[1].match(/description:\s*["']?(.+?)["']?\s*$/m);
        const riskMatch = fmMatch[1].match(/level:\s*(LOW|MEDIUM|HIGH)/);

        setPreview({
          name: nameMatch?.[1]?.trim() || "unknown",
          version: versionMatch?.[1]?.trim() || "0.0.0",
          description: descMatch?.[1]?.trim() || "",
          tags: [],
          riskLevel: riskMatch?.[1] || null,
          permissions: null,
        });
      }
    } catch {
      // Preview extraction is best-effort
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (changelog) formData.append("changelog", changelog);

      const res = await fetch("/api/packages", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to publish");
        return;
      }

      router.push(`/packages/${data.slug}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">.dops File</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="cursor-pointer rounded-lg border-2 border-dashed border-glass-border bg-surface p-8 text-center transition-colors hover:border-glass-border-hover"
        >
          <input
            ref={fileRef}
            type="file"
            accept=".dops"
            onChange={handleFileChange}
            className="hidden"
          />
          {file ? (
            <div>
              <p className="font-mono text-sm text-neon-cyan">{file.name}</p>
              <p className="mt-1 text-xs text-text-secondary">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div>
              <svg
                className="mx-auto mb-2 text-text-secondary"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <p className="text-sm text-text-secondary">Click to upload a .dops file</p>
            </div>
          )}
        </div>
      </div>

      {preview && <MetadataPreview meta={preview} />}

      <div>
        <label htmlFor="changelog" className="block text-sm font-medium text-text-primary mb-2">
          Changelog (optional)
        </label>
        <textarea
          id="changelog"
          value={changelog}
          onChange={(e) => setChangelog(e.target.value)}
          rows={3}
          placeholder="What changed in this version?"
          className="w-full rounded-lg border border-glass-border bg-surface px-4 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-neon-cyan/30 focus:outline-none"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Button type="submit" disabled={!file || loading} className="w-full">
        {loading ? "Publishing..." : "Publish Module"}
      </Button>
    </form>
  );
}
