import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { verifyAccessToken } from "./jwt-verify";
import { sanitizeAvatarUrl } from "./security";
import type { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      id: "dojops-jwt",
      name: "DojOps",
      credentials: {
        token: { type: "hidden" },
      },
      async authorize(credentials) {
        if (!credentials?.token) return null;

        const payload = verifyAccessToken(credentials.token);
        if (!payload) return null;

        // Upsert shadow user from JWT claims.
        // avatarUrl is sanitized against an allowlist of known-safe hostnames
        // before being stored; anything else is silently dropped.
        const safeAvatarUrl = sanitizeAvatarUrl(payload.avatarUrl);
        const user = await prisma.user.upsert({
          where: { externalId: payload.sub },
          update: {
            email: payload.email,
            username: payload.username || payload.email.split("@")[0],
            displayName: payload.name,
            avatarUrl: safeAvatarUrl,
            role: payload.role === "ADMIN" ? "ADMIN" : "USER",
          },
          create: {
            externalId: payload.sub,
            email: payload.email,
            username: payload.username || payload.email.split("@")[0],
            displayName: payload.name,
            avatarUrl: safeAvatarUrl,
            role: payload.role === "ADMIN" ? "ADMIN" : "USER",
          },
        });

        return {
          id: user.id,
          name: user.displayName,
          email: user.email,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      const userId = token?.sub as string;
      if (session.user && userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, username: true, role: true, avatarUrl: true },
        });
        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.username = dbUser.username;
          session.user.role = dbUser.role;
          session.user.avatarUrl = dbUser.avatarUrl;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
