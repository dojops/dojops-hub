import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SLUG_RE = /^[a-z][a-z0-9-]{0,63}$/;
const VERSION_RE = /^[a-zA-Z0-9][a-zA-Z0-9._+-]{0,127}$/;

// GET /api/packages/:slug/:version — specific version detail
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; version: string }> },
) {
  const { slug, version } = await params;

  if (!SLUG_RE.test(slug) || !VERSION_RE.test(version)) {
    return NextResponse.json({ error: "Invalid slug or version format" }, { status: 400 });
  }

  const pkg = await prisma.package.findUnique({
    where: { slug, status: "ACTIVE" },
    select: { id: true },
  });

  if (!pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  const ver = await prisma.version.findUnique({
    where: { packageId_semver: { packageId: pkg.id, semver: version } },
    omit: { filePath: true },
  });

  if (!ver) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  return NextResponse.json(ver);
}
