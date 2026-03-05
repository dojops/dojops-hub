import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sortVersionsDesc } from "@/lib/utils";

// GET /api/packages/:slug — package detail + latest version
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const pkg = await prisma.package.findUnique({
    where: { slug, status: "ACTIVE" },
    omit: { authorId: true },
    include: {
      author: { select: { username: true, displayName: true, avatarUrl: true } },
      versions: { omit: { filePath: true } },
    },
  });

  if (!pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  const sorted = sortVersionsDesc(pkg.versions);

  return NextResponse.json({
    ...pkg,
    latestVersion: sorted[0] || null,
    versions: undefined,
  });
}
