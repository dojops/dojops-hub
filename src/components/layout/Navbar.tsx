"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (!stored && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-card-hover transition-colors"
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-bg-card border-b border-border-primary sticky top-0 z-50 dark:backdrop-blur-sm dark:bg-bg-card/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/icon.png" alt="DojOps" width={28} height={28} />
            <span className="text-lg font-bold tracking-tight text-text-primary">
              DojOps
              <span className="text-text-secondary ml-1 text-sm font-normal">Hub</span>
            </span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/explore"
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              Explore
            </Link>
            {session && (
              <Link
                href="/publish"
                className="text-sm text-text-secondary transition-colors hover:text-text-primary"
              >
                Publish
              </Link>
            )}
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {session ? (
            <div className="flex items-center gap-3">
              <Link
                href={`/users/${session.user.username}`}
                className="flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
              >
                {session.user.avatarUrl && (
                  <Image
                    src={session.user.avatarUrl}
                    alt={session.user.username}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                )}
                {session.user.username}
              </Link>
              <Link
                href="/settings/tokens"
                className="text-sm text-text-secondary transition-colors hover:text-text-primary"
              >
                Settings
              </Link>
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-xs text-accent-text transition-colors hover:text-text-primary"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="text-sm text-text-secondary transition-colors hover:text-text-primary"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="rounded-md border border-border-primary bg-bg-card px-4 h-[38px] text-sm text-text-primary transition-all hover:bg-bg-card-hover font-medium"
            >
              Sign in with GitHub
            </button>
          )}
        </div>

        <button
          className="md:hidden text-text-secondary"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border-primary bg-bg-card px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link
              href="/explore"
              className="text-sm text-text-secondary"
              onClick={() => setMobileOpen(false)}
            >
              Explore
            </Link>
            {session && (
              <>
                <Link
                  href="/publish"
                  className="text-sm text-text-secondary"
                  onClick={() => setMobileOpen(false)}
                >
                  Publish
                </Link>
                <Link
                  href={`/users/${session.user.username}`}
                  className="text-sm text-text-secondary"
                  onClick={() => setMobileOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/settings/tokens"
                  className="text-sm text-text-secondary"
                  onClick={() => setMobileOpen(false)}
                >
                  Settings
                </Link>
                <button onClick={() => signOut()} className="text-left text-sm text-text-secondary">
                  Sign out
                </button>
              </>
            )}
            {!session && (
              <button
                onClick={() => signIn("github")}
                className="text-left text-sm text-accent-text"
              >
                Sign in with GitHub
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
