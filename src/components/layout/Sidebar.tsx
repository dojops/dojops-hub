"use client";

import Link from "next/link";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: Readonly<SidebarProps>) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        tabIndex={0}
        aria-label="Close menu"
      />
      <div className="absolute right-0 top-0 h-full w-64 border-l border-glass-border bg-bg-deep p-6">
        <button onClick={onClose} className="mb-6 text-text-secondary" aria-label="Close menu">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>
        <nav className="flex flex-col gap-4">
          <Link
            href="/explore"
            className="text-text-secondary hover:text-text-primary"
            onClick={onClose}
          >
            Explore
          </Link>
          <Link
            href="/publish"
            className="text-text-secondary hover:text-text-primary"
            onClick={onClose}
          >
            Publish
          </Link>
        </nav>
      </div>
    </div>
  );
}
