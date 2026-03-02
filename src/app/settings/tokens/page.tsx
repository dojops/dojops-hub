import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TokenManager } from "@/components/settings/TokenManager";

export default async function TokensPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }

  const tokens = await prisma.apiToken.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      tokenPrefix: true,
      expiresAt: true,
      lastUsedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary">API Tokens</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Generate tokens for CLI authentication. Tokens follow the GitHub PAT model — shown once at creation, stored as hashes.
        </p>
      </div>
      <TokenManager
        initialTokens={tokens.map((t) => ({
          ...t,
          expiresAt: t.expiresAt?.toISOString() ?? null,
          lastUsedAt: t.lastUsedAt?.toISOString() ?? null,
          createdAt: t.createdAt.toISOString(),
        }))}
      />
    </main>
  );
}
