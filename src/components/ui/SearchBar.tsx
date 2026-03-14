"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SearchResult {
  slug: string;
  name: string;
  description: string;
}

export function SearchBar({ className = "" }: Readonly<{ className?: string }>) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.packages || []);
          setOpen(true);
        }
      } catch {
        /* ignore */
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills..."
            className="w-full bg-bg-card border border-border-secondary rounded-sm h-[38px] pl-10 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
          />
        </div>
      </form>
      {open && results.length > 0 && (
        <div className="absolute top-full z-50 mt-1 w-full bg-bg-card border border-border-primary rounded-lg shadow-[var(--shadow-md)]">
          {results.map((r) => (
            <Link
              key={r.slug}
              href={`/packages/${r.slug}`}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 transition-colors hover:bg-bg-card-hover first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="text-sm font-medium text-text-primary">{r.name}</div>
              <div className="text-xs text-text-secondary line-clamp-1">{r.description}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
