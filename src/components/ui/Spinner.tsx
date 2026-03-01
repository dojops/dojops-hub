export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-5 w-5 animate-spin rounded-full border-2 border-glass-border border-t-neon-cyan ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
