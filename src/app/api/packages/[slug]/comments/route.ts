import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// GET /api/packages/:slug/comments
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const pkg = await prisma.package.findUnique({ where: { slug }, select: { id: true } });
  if (!pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  const comments = await prisma.comment.findMany({
    where: { packageId: pkg.id },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { username: true, displayName: true, avatarUrl: true } } },
  });

  return NextResponse.json({ comments });
}

// POST /api/packages/:slug/comments
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = checkRateLimit(`comment:${session.user.id}`, RATE_LIMITS.comment);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { slug } = await params;
  const pkg = await prisma.package.findUnique({ where: { slug }, select: { id: true } });
  if (!pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  const body = await req.json();
  const text = body.body?.trim();

  if (!text || text.length > 2000) {
    return NextResponse.json(
      { error: "Comment body is required and must be under 2000 characters" },
      { status: 400 },
    );
  }

  const comment = await prisma.comment.create({
    data: {
      userId: session.user.id,
      packageId: pkg.id,
      body: text,
    },
    include: { user: { select: { username: true, displayName: true, avatarUrl: true } } },
  });

  return NextResponse.json(comment, { status: 201 });
}
