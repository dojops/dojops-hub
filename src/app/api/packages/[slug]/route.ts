import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/packages/:slug — package detail + latest version
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const pkg = await prisma.package.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      author: { select: { username: true, displayName: true, avatarUrl: true } },
      versions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...pkg,
    latestVersion: pkg.versions[0] || null,
    versions: undefined,
  });
}
