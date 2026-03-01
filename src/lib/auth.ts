import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import type { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      profile(profile) {
        return {
          id: String(profile.id),
          githubId: profile.id,
          username: profile.login,
          displayName: profile.name || profile.login,
          email: profile.email,
          avatarUrl: profile.avatar_url,
          role: "USER" as const,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, username: true, role: true, avatarUrl: true },
      });
      if (dbUser) {
        session.user.id = dbUser.id;
        session.user.username = dbUser.username;
        session.user.role = dbUser.role;
        session.user.avatarUrl = dbUser.avatarUrl;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
