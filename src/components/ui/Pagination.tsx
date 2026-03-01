"use client";

import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string>;
}

export function Pagination({ currentPage, totalPages, basePath, searchParams = {} }: PaginationProps) {
  if (totalPages <= 1) return null;

  function buildHref(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  }

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      {currentPage > 1 && (
        <Link
          href={buildHref(currentPage - 1)}
          className="rounded-md border border-glass-border px-3 py-1.5 text-sm text-text-secondary hover:border-glass-border-hover hover:text-text-primary"
        >
          Prev
        </Link>
      )}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-text-secondary">
            ...
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              p === currentPage
                ? "border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan"
                : "border border-glass-border text-text-secondary hover:border-glass-border-hover hover:text-text-primary"
            }`}
          >
            {p}
          </Link>
        ),
      )}
      {currentPage < totalPages && (
        <Link
          href={buildHref(currentPage + 1)}
          className="rounded-md border border-glass-border px-3 py-1.5 text-sm text-text-secondary hover:border-glass-border-hover hover:text-text-primary"
        >
          Next
        </Link>
      )}
    </nav>
  );
}
