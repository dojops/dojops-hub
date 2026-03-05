import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { createHash } from "node:crypto";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: string;
}

/**
 * Authenticates a request via Bearer token (API token) or session cookie.
 * Bearer tokens are checked first; session cookie is the fallback.
 */
export async function getAuthenticatedUser(req: NextRequest): Promise<AuthenticatedUser | null> {
  // 1. Check for Bearer token
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const rawToken = authHeader.slice(7);
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");

    const apiToken = await prisma.apiToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, username: true, role: true } } },
    });

    if (!apiToken) return null;

    // Check expiration
    if (apiToken.expiresAt && apiToken.expiresAt < new Date()) return null;

    // Update lastUsedAt (fire-and-forget)
    prisma.apiToken
      .update({ where: { id: apiToken.id }, data: { lastUsedAt: new Date() } })
      .catch(() => {});

    return {
      id: apiToken.user.id,
      username: apiToken.user.username,
      role: apiToken.user.role,
    };
  }

  // 2. Fall back to session cookie
  const session = await getServerSession(authOptions);
  if (!session) return null;

  return {
    id: session.user.id,
    username: session.user.username,
    role: session.user.role,
  };
}
