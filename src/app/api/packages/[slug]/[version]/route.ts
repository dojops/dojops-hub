import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/packages/:slug/:version — specific version detail
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; version: string }> },
) {
  const { slug, version } = await params;

  const pkg = await prisma.package.findUnique({
    where: { slug, status: "ACTIVE" },
    select: { id: true },
  });

  if (!pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  const ver = await prisma.version.findUnique({
    where: { packageId_semver: { packageId: pkg.id, semver: version } },
    select: {
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
    },
  });

  if (!ver) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  return NextResponse.json(ver);
}
