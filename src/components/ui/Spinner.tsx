export function Spinner({ className = "" }: { className?: string }) {
  return (
    <output
      className={`block h-5 w-5 animate-spin rounded-full border-2 border-glass-border border-t-neon-cyan ${className}`}
      aria-label="Loading"
    />
  );
}
