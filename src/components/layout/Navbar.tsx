"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-glass-border bg-bg-deep/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/icon.png" alt="DojOps" width={28} height={28} />
            <span className="text-lg font-semibold tracking-tight">
              <span className="text-gradient-cyan">DojOps</span>
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

        <div className="hidden items-center gap-4 md:flex">
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
                  className="text-xs text-neon-cyan/60 transition-colors hover:text-neon-cyan"
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
              className="rounded-lg border border-glass-border bg-surface-elevated px-4 py-2 text-sm text-text-primary transition-all hover:border-glass-border-hover hover:shadow-[var(--glow-cyan)]"
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
        <div className="mobile-drawer-enter border-t border-glass-border bg-bg-deep/95 px-4 py-4 md:hidden">
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
              <button onClick={() => signIn("github")} className="text-left text-sm text-neon-cyan">
                Sign in with GitHub
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
