"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export function SessionProvider({ children }: Readonly<{ children: ReactNode }>) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
