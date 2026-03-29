"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setError("Missing authorization code.");
      return;
    }

    async function exchange() {
      try {
        const res = await fetch("/api/auth/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Authentication failed.");
          return;
        }

        const { accessToken } = await res.json();

        // Sign in with NextAuth using the JWT
        const result = await signIn("dojops-jwt", {
          token: accessToken,
          callbackUrl: "/",
          redirect: true,
        });

        if (result?.error) {
          setError("Failed to create session.");
        }
      } catch {
        setError("Authentication failed. Please try again.");
      }
    }

    exchange();
  }, [searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <div className="rounded-lg border border-border-primary bg-bg-card p-8 text-center shadow-lg">
          <h1 className="text-xl font-bold text-red-400">Authentication error</h1>
          <p className="mt-2 text-text-secondary">{error}</p>
          <a
            href="/auth/signin"
            className="mt-4 inline-block rounded bg-accent-primary px-4 py-2 text-sm font-medium text-bg-primary hover:bg-accent-hover"
          >
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
        <p className="mt-4 text-text-secondary">Signing you in...</p>
      </div>
    </div>
  );
}
