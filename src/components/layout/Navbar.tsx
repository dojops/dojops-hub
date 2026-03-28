"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useSyncExternalStore } from "react";

function SunIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
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
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function ThemeToggle() {
  const dark = useSyncExternalStore(
    (cb) => {
      const obs = new MutationObserver(cb);
      obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      return () => obs.disconnect();
    },
    () => document.documentElement.classList.contains("dark"),
    () => true,
  );

  function toggle() {
    if (dark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative p-2 rounded-lg text-text-secondary hover:text-accent transition-colors duration-200"
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function GitHubLink() {
  return (
    <a
      href="https://github.com/dojops"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub"
      className="p-2 rounded-lg text-text-secondary hover:text-text-primary transition-colors duration-200"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    </a>
  );
}

const NAV_ITEMS = [
  { label: "Explore", href: "/explore" },
  { label: "Docs", href: "https://doc.dojops.ai", external: true },
];

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "color-mix(in srgb, var(--bg-card) 85%, transparent)"
          : "color-mix(in srgb, var(--bg-card) 60%, transparent)",
        backdropFilter: scrolled ? "blur(20px) saturate(1.2)" : "blur(12px)",
        WebkitBackdropFilter: scrolled ? "blur(20px) saturate(1.2)" : "blur(12px)",
      }}
    >
      {/* Bottom gradient border */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: scrolled
            ? "linear-gradient(90deg, transparent 5%, var(--accent-border) 30%, var(--accent) 50%, var(--accent-border) 70%, transparent 95%)"
            : "linear-gradient(90deg, transparent, var(--border-primary), transparent)",
          opacity: scrolled ? 1 : 0.6,
          transition: "opacity 0.3s, background 0.3s",
        }}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-14 flex items-center">
        {/* Logo — left */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image src="/icon.png" alt="DojOps" width={26} height={26} />
          <span className="font-bold text-[15px] text-text-primary tracking-tight">
            {"DojOps "}
            <span className="text-text-secondary text-[13px] font-normal">Hub</span>
          </span>
        </Link>

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="nav-link relative px-3 py-1.5 text-[13px] text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              {item.label}
            </Link>
          ))}
          {session && (
            <Link
              href="/publish"
              className="nav-link relative px-3 py-1.5 text-[13px] text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              Publish
            </Link>
          )}
        </div>

        {/* Right group — auth, GitHub, theme */}
        <div className="hidden md:flex items-center gap-1 shrink-0">
          {session ? (
            <>
              {/* User avatar + name */}
              <Link
                href={`/users/${session.user.username}`}
                className="flex items-center gap-2 px-2 py-1.5 text-[13px] text-text-secondary hover:text-text-primary transition-colors duration-200 rounded-lg"
              >
                {session.user.avatarUrl && (
                  <Image
                    src={session.user.avatarUrl}
                    alt={session.user.username}
                    width={22}
                    height={22}
                    className="rounded-full"
                  />
                )}
                {session.user.username}
              </Link>

              <Link
                href="/settings/tokens"
                className="px-2 py-1.5 text-[13px] text-text-secondary hover:text-text-primary transition-colors duration-200 rounded-lg"
              >
                Settings
              </Link>

              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="px-2 py-1.5 text-[11px] text-accent-text hover:text-text-primary transition-colors duration-200 rounded-lg"
                >
                  Admin
                </Link>
              )}

              <button
                onClick={() => signOut()}
                className="px-2 py-1.5 text-[13px] text-text-secondary hover:text-text-primary transition-colors duration-200 rounded-lg"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="nav-cta group relative text-[13px] font-medium px-4 py-1.5 rounded-lg text-white transition-all duration-200 overflow-hidden"
            >
              <span
                className="absolute inset-0 rounded-lg"
                style={{
                  background: "linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)",
                }}
              />
              <span
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  boxShadow:
                    "0 0 20px color-mix(in srgb, #3b82f6 35%, transparent), 0 0 40px color-mix(in srgb, #06b6d4 15%, transparent)",
                }}
              />
              <span className="relative z-10 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Sign in
              </span>
            </button>
          )}

          {/* Separator */}
          <div className="w-px h-4 mx-1.5" style={{ background: "var(--border-primary)" }} />

          <GitHubLink />
          <ThemeToggle />
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-1 ml-auto">
          <GitHubLink />
          <ThemeToggle />
          <button
            className="p-2 -mr-2 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-5 h-4 relative flex flex-col justify-between">
              <span
                className="block h-[1.5px] rounded-full transition-all duration-300 origin-center"
                style={{
                  background: "currentColor",
                  transform: mobileOpen ? "translateY(7.25px) rotate(45deg)" : "none",
                }}
              />
              <span
                className="block h-[1.5px] rounded-full transition-all duration-300"
                style={{
                  background: "currentColor",
                  opacity: mobileOpen ? 0 : 1,
                  transform: mobileOpen ? "scaleX(0)" : "scaleX(1)",
                }}
              />
              <span
                className="block h-[1.5px] rounded-full transition-all duration-300 origin-center"
                style={{
                  background: "currentColor",
                  width: mobileOpen ? "100%" : "60%",
                  marginLeft: "auto",
                  transform: mobileOpen ? "translateY(-7.25px) rotate(-45deg)" : "none",
                }}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300 ease-out"
        style={{
          maxHeight: mobileOpen ? 400 : 0,
          opacity: mobileOpen ? 1 : 0,
        }}
      >
        <div
          className="px-5 pt-2 pb-5 flex flex-col gap-0.5"
          style={{
            borderTop: "1px solid var(--border-primary)",
            background: "color-mix(in srgb, var(--bg-card) 95%, transparent)",
          }}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="text-text-secondary hover:text-text-primary transition-colors py-2.5 text-sm flex items-center gap-3"
              onClick={() => setMobileOpen(false)}
            >
              <span
                className="w-1 h-1 rounded-full shrink-0"
                style={{ background: "var(--accent-border)" }}
              />
              {item.label}
            </Link>
          ))}

          {session && (
            <>
              <Link
                href="/publish"
                className="text-text-secondary hover:text-text-primary transition-colors py-2.5 text-sm flex items-center gap-3"
                onClick={() => setMobileOpen(false)}
              >
                <span
                  className="w-1 h-1 rounded-full shrink-0"
                  style={{ background: "var(--accent-border)" }}
                />
                {"Publish"}
              </Link>
              <Link
                href={`/users/${session.user.username}`}
                className="text-text-secondary hover:text-text-primary transition-colors py-2.5 text-sm flex items-center gap-3"
                onClick={() => setMobileOpen(false)}
              >
                <span
                  className="w-1 h-1 rounded-full shrink-0"
                  style={{ background: "var(--accent-border)" }}
                />
                {"Profile"}
              </Link>
              <Link
                href="/settings/tokens"
                className="text-text-secondary hover:text-text-primary transition-colors py-2.5 text-sm flex items-center gap-3"
                onClick={() => setMobileOpen(false)}
              >
                <span
                  className="w-1 h-1 rounded-full shrink-0"
                  style={{ background: "var(--accent-border)" }}
                />
                {"Settings"}
              </Link>
              <button
                onClick={() => signOut()}
                className="text-left text-text-secondary hover:text-text-primary transition-colors py-2.5 text-sm flex items-center gap-3"
              >
                <span
                  className="w-1 h-1 rounded-full shrink-0"
                  style={{ background: "var(--accent-border)" }}
                />
                {"Sign out"}
              </button>
            </>
          )}

          {!session && (
            <div className="mt-3 pt-3 border-t border-border-primary">
              <button
                onClick={() => signIn("github")}
                className="text-sm font-medium px-4 py-2.5 rounded-lg text-white text-center transition-all w-full flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Sign in with GitHub
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
