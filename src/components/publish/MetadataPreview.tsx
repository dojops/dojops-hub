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
    dopsVersion?: string;
    technology?: string;
    bestPractices?: string[];
    context7Libraries?: Array<{ name: string }>;
  };
}

export function MetadataPreview({ meta }: Readonly<MetadataPreviewProps>) {
  return (
    <div className="rounded-lg border border-border-primary bg-bg-card p-4">
      <h3 className="text-sm font-medium text-text-secondary mb-3">Preview</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-text-primary">{meta.name}</span>
          <Badge variant="cyan">v{meta.version}</Badge>
          {meta.dopsVersion && <Badge variant="default">{meta.dopsVersion}</Badge>}
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
        {meta.technology && (
          <div className="flex items-center gap-1 text-xs text-text-secondary">
            <span>Technology:</span>
            <Badge variant="default">{meta.technology}</Badge>
          </div>
        )}
        {meta.context7Libraries && meta.context7Libraries.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-text-secondary">
            <span>Docs:</span>
            {meta.context7Libraries.map((lib) => (
              <Badge key={lib.name} variant="default">
                {lib.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
