import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readDopsFile } from "@/lib/storage";

// GET /api/download/:slug/:version — serve .dops file
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; version: string }> },
) {
  const { slug, version } = await params;

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

  const safeName = pkg.name.replace(/[^\w.-]/g, "_");
  const safeVersion = ver.semver.replace(/[^\w.-]/g, "_");

  return new NextResponse(new Uint8Array(content), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${safeName}-${safeVersion}.dops"`,
      "X-Checksum-Sha256": ver.sha256,
    },
  });
}
