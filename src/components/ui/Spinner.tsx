export function Spinner({ className = "" }: Readonly<{ className?: string }>) {
  return (
    <output
      className={`block animate-spin rounded-full border-2 border-accent border-t-transparent ${className}`}
      style={{ width: 20, height: 20 }}
      aria-label="Loading"
    />
  );
}
