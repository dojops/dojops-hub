import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { randomBytes, createHash } from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const MAX_TOKENS_PER_USER = 10;
const TOKEN_PREFIX = "dojops_";

// GET /api/tokens — list current user's tokens
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  return NextResponse.json({ tokens });
}

// POST /api/tokens — create a new API token
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = checkRateLimit(`tokenCreate:${session.user.id}`, RATE_LIMITS.tokenCreate);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
  }

  const body = await req.json();
  const name = body.name?.trim();
  const expiration = body.expiration as string | undefined;

  if (!name || name.length > 50) {
    return NextResponse.json(
      { error: "Token name is required and must be under 50 characters" },
      { status: 400 },
    );
  }

  if (expiration && !["1month", "3months", "never"].includes(expiration)) {
    return NextResponse.json(
      { error: "Invalid expiration. Use: 1month, 3months, or never" },
      { status: 400 },
    );
  }

  // Check max tokens per user
  const count = await prisma.apiToken.count({ where: { userId: session.user.id } });
  if (count >= MAX_TOKENS_PER_USER) {
    return NextResponse.json(
      {
        error: `Maximum of ${MAX_TOKENS_PER_USER} tokens per user. Revoke an existing token first.`,
      },
      { status: 400 },
    );
  }

  // Generate token: dojops_ + 40 hex chars
  const rawToken = TOKEN_PREFIX + randomBytes(20).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const tokenPrefix = rawToken.slice(0, 12);

  // Compute expiration date
  let expiresAt: Date | null = null;
  if (expiration === "1month") {
    expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  } else if (expiration === "3months") {
    expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  }

  const token = await prisma.apiToken.create({
    data: {
      userId: session.user.id,
      name,
      tokenHash,
      tokenPrefix,
      expiresAt,
    },
    select: {
      id: true,
      name: true,
      tokenPrefix: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  // Return the raw token ONCE — it cannot be retrieved again
  return NextResponse.json({ ...token, rawToken }, { status: 201 });
}
