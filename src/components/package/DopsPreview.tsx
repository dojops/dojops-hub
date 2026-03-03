interface DopsPreviewProps {
  sections: {
    prompt?: string;
    updatePrompt?: string;
    examples?: string;
    constraints?: string;
    keywords?: string;
  };
}

export function DopsPreview({ sections }: DopsPreviewProps) {
  const parts = [
    { title: "Prompt", content: sections.prompt },
    { title: "Update Prompt", content: sections.updatePrompt },
    { title: "Examples", content: sections.examples },
    { title: "Constraints", content: sections.constraints },
    { title: "Keywords", content: sections.keywords },
  ].filter((p) => p.content);

  if (parts.length === 0) return null;

  return (
    <div className="space-y-4">
      {parts.map(({ title, content }) => (
        <div key={title}>
          <h3 className="text-sm font-semibold text-text-primary mb-2">{title}</h3>
          <div className="rounded-lg border border-glass-border bg-surface p-4">
            <pre className="whitespace-pre-wrap font-mono text-xs text-text-secondary leading-relaxed">
              {content}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
}
