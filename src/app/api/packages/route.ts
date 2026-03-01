import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseDopsString } from "@/lib/dops-parser";
import { saveDopsFile } from "@/lib/storage";
import { slugify, sha256 } from "@/lib/utils";
import { listPackages } from "@/lib/search";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import type { Prisma } from "@prisma/client";

// GET /api/packages — list packages
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
  const sort = (searchParams.get("sort") || "recent") as "recent" | "stars" | "downloads";
  const tag = searchParams.get("tag") || undefined;

  const result = await listPackages({ page, pageSize, sort, tag });
  return NextResponse.json({
    packages: result.packages,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    totalPages: Math.ceil(result.total / result.pageSize),
  });
}

// POST /api/packages — publish new package
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = checkRateLimit(`publish:${session.user.id}`, RATE_LIMITS.publish);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const changelog = (formData.get("changelog") as string) || null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.name.endsWith(".dops")) {
    return NextResponse.json({ error: "File must have .dops extension" }, { status: 400 });
  }

  // Size limit: 1MB
  if (file.size > 1_048_576) {
    return NextResponse.json({ error: "File too large (max 1MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const content = buffer.toString("utf-8");

  // Parse and validate
  let parsed;
  try {
    parsed = parseDopsString(content);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  const { meta } = parsed.frontmatter;
  const slug = slugify(meta.name);
  const hash = sha256(buffer);

  const versionData = {
    semver: meta.version,
    changelog,
    filePath: "", // set below
    fileSize: buffer.length,
    sha256: hash,
    riskLevel: parsed.frontmatter.risk?.level ?? null,
    permissions: (parsed.frontmatter.permissions ?? undefined) as Prisma.InputJsonValue | undefined,
    inputFields: (parsed.frontmatter.input?.fields ?? undefined) as Prisma.InputJsonValue | undefined,
    outputSpec: (parsed.frontmatter.output ?? undefined) as Prisma.InputJsonValue | undefined,
    fileSpecs: (parsed.frontmatter.files ?? undefined) as Prisma.InputJsonValue | undefined,
  };

  // Check if package exists
  const existingPkg = await prisma.package.findUnique({ where: { slug } });

  if (existingPkg) {
    // Must be same author
    if (existingPkg.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "A package with this name already exists and belongs to another user" },
        { status: 403 },
      );
    }

    // Check version doesn't already exist
    const existingVersion = await prisma.version.findUnique({
      where: { packageId_semver: { packageId: existingPkg.id, semver: meta.version } },
    });
    if (existingVersion) {
      return NextResponse.json(
        { error: `Version ${meta.version} already exists` },
        { status: 409 },
      );
    }

    // Save file and create new version
    const filePath = await saveDopsFile(slug, meta.version, buffer);
    versionData.filePath = filePath;

    await prisma.$transaction([
      prisma.version.create({
        data: { packageId: existingPkg.id, ...versionData },
      }),
      prisma.package.update({
        where: { id: existingPkg.id },
        data: {
          description: meta.description,
          tags: meta.tags || [],
        },
      }),
    ]);

    return NextResponse.json({ slug, version: meta.version, updated: true });
  }

  // Create new package + version
  if (!versionData.filePath) {
    const filePath = await saveDopsFile(slug, meta.version, buffer);
    versionData.filePath = filePath;
  }

  await prisma.package.create({
    data: {
      authorId: session.user.id,
      name: meta.name,
      slug,
      description: meta.description,
      tags: meta.tags || [],
      versions: { create: versionData },
    },
  });

  return NextResponse.json({ slug, version: meta.version, created: true }, { status: 201 });
}
