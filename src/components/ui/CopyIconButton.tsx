"use client";

interface CopyIconButtonProps {
  copied: boolean;
  onCopy: () => void;
  size?: number;
  className?: string;
  copiedIconClassName?: string;
  ariaLabel?: string;
  title?: string;
}

export function CopyIconButton({
  copied,
  onCopy,
  size = 16,
  className = "shrink-0 text-text-secondary transition-colors hover:text-accent",
  copiedIconClassName,
  ariaLabel,
  title,
}: Readonly<CopyIconButtonProps>) {
  return (
    <button onClick={onCopy} className={className} aria-label={ariaLabel} title={title}>
      {copied ? (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={copiedIconClassName}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}
