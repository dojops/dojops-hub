import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getAuthenticatedUser } from "@/lib/api-auth";

// POST /api/packages/:slug/star — toggle star
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = checkRateLimit(`star:${user.id}`, RATE_LIMITS.star);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { slug } = await params;
  const pkg = await prisma.package.findUnique({ where: { slug } });
  if (!pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  const existing = await prisma.star.findUnique({
    where: { userId_packageId: { userId: user.id, packageId: pkg.id } },
  });

  if (existing) {
    // Unstar
    await prisma.$transaction([
      prisma.star.delete({ where: { id: existing.id } }),
      prisma.package.update({
        where: { id: pkg.id },
        data: { starCount: { decrement: 1 } },
      }),
    ]);
    return NextResponse.json({ starred: false, starCount: pkg.starCount - 1 });
  } else {
    // Star
    await prisma.$transaction([
      prisma.star.create({
        data: { userId: user.id, packageId: pkg.id },
      }),
      prisma.package.update({
        where: { id: pkg.id },
        data: { starCount: { increment: 1 } },
      }),
    ]);
    return NextResponse.json({ starred: true, starCount: pkg.starCount + 1 });
  }
}
