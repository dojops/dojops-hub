import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sortVersionsDesc } from "@/lib/utils";

const versionSelect = {
  id: true,
  semver: true,
  changelog: true,
  fileSize: true,
  sha256: true,
  riskLevel: true,
  permissions: true,
  inputFields: true,
  outputSpec: true,
  fileSpecs: true,
  dopsVersion: true,
  contextBlock: true,
  createdAt: true,
  packageId: true,
} as const;

// GET /api/packages/:slug — package detail + latest version
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const pkg = await prisma.package.findUnique({
    where: { slug, status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      tags: true,
      starCount: true,
      downloadCount: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { username: true, displayName: true, avatarUrl: true } },
      versions: { select: versionSelect },
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
