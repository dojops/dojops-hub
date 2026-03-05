"use client";

import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string>;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
}: Readonly<PaginationProps>) {
  if (totalPages <= 1) return null;

  function buildHref(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  }

  const items: Array<{ type: "page"; value: number } | { type: "dots"; key: string }> = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      items.push({ type: "page", value: i });
    } else if (items.length === 0 || items.at(-1)?.type !== "dots") {
      items.push({ type: "dots", key: `dots-before-${i}` });
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
      {items.map((item) =>
        item.type === "dots" ? (
          <span key={item.key} className="px-2 text-text-secondary">
            ...
          </span>
        ) : (
          <Link
            key={item.value}
            href={buildHref(item.value)}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              item.value === currentPage
                ? "border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan"
                : "border border-glass-border text-text-secondary hover:border-glass-border-hover hover:text-text-primary"
            }`}
          >
            {item.value}
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
