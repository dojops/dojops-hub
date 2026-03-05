interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

export function SectionHeading({ title, subtitle }: Readonly<SectionHeadingProps>) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold tracking-tight text-text-primary">{title}</h2>
      {subtitle && <p className="mt-2 text-text-secondary">{subtitle}</p>}
    </div>
  );
}
