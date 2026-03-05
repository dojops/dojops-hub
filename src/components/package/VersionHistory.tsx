import { Badge } from "@/components/ui/Badge";
import { formatDate, formatBytes } from "@/lib/utils";

interface Version {
  id: string;
  semver: string;
  changelog: string | null;
  fileSize: number;
  sha256: string;
  createdAt: Date;
}

export function VersionHistory({ versions }: Readonly<{ versions: Version[] }>) {
  return (
    <div className="space-y-3">
      {versions.map((v, i) => (
        <div key={v.id} className="rounded-lg border border-glass-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <Badge variant={i === 0 ? "cyan" : "default"}>v{v.semver}</Badge>
            <span className="text-xs text-text-secondary">{formatDate(v.createdAt)}</span>
            <span className="text-xs text-text-secondary">{formatBytes(v.fileSize)}</span>
          </div>
          {v.changelog && <p className="mt-2 text-sm text-text-secondary">{v.changelog}</p>}
          <div className="mt-2">
            <code className="text-xs text-text-secondary/60 font-mono" title={v.sha256}>
              sha256:{v.sha256}
            </code>
          </div>
        </div>
      ))}
    </div>
  );
}
