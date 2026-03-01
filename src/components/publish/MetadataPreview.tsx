import { Badge } from "@/components/ui/Badge";
import { RiskBadge } from "@/components/package/RiskBadge";

interface MetadataPreviewProps {
  meta: {
    name: string;
    version: string;
    description: string;
    tags: string[];
    riskLevel: string | null;
    permissions: Record<string, string> | null;
  };
}

export function MetadataPreview({ meta }: MetadataPreviewProps) {
  return (
    <div className="rounded-lg border border-glass-border bg-surface p-4">
      <h3 className="text-sm font-medium text-text-secondary mb-3">Preview</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-neon-cyan">{meta.name}</span>
          <Badge variant="cyan">v{meta.version}</Badge>
          {meta.riskLevel && <RiskBadge level={meta.riskLevel} />}
        </div>
        <p className="text-sm text-text-secondary">{meta.description}</p>
        {meta.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {meta.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
