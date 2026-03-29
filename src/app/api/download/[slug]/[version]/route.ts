import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readDopsFile } from "@/lib/storage";

// Safe patterns mirroring the Zod schema constraints: slug must be a-z0-9-,
// version must start with alphanumeric and contain only a-z A-Z 0-9 . _ + -
const SLUG_RE = /^[a-z][a-z0-9-]{0,63}$/;
const VERSION_RE = /^[a-zA-Z0-9][a-zA-Z0-9._+-]{0,127}$/;

// GET /api/download/:slug/:version — serve .dops file
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
    select: { id: true, name: true },
  });

  if (!pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  const ver = await prisma.version.findUnique({
    where: { packageId_semver: { packageId: pkg.id, semver: version } },
  });

  if (!ver) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  let content: Buffer;
  try {
    content = await readDopsFile(slug, version);
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Increment download count (fire and forget)
  prisma.package
    .update({ where: { id: pkg.id }, data: { downloadCount: { increment: 1 } } })
    .catch(() => {});

  const safeName = pkg.name.replaceAll(/[^\w.-]/g, "_");
  const safeVersion = ver.semver.replaceAll(/[^\w.-]/g, "_");
  const filename = `${safeName}-${safeVersion}.dops`;

  const headers: Record<string, string> = {
    "Content-Type": "application/octet-stream",
    // RFC 5987 filename* for non-ASCII support, ASCII fallback in filename
    "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    "X-Checksum-Sha256": ver.sha256,
  };

  if (ver.dopsVersion) headers["X-Dops-Version"] = ver.dopsVersion;
  if (ver.riskLevel) headers["X-Risk-Level"] = ver.riskLevel;

  return new NextResponse(new Uint8Array(content), { headers });
}
