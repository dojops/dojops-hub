import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseDopsString } from "@/lib/dops-parser";
import { saveDopsFile, sha256 } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import { listPackages } from "@/lib/search";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getAuthenticatedUser } from "@/lib/api-auth";
import type { Prisma } from "@prisma/client";

// GET /api/packages — list packages
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
  const VALID_SORTS = ["recent", "stars", "downloads"] as const;
  const rawSort = searchParams.get("sort") || "recent";
  const sort = (VALID_SORTS as readonly string[]).includes(rawSort)
    ? (rawSort as (typeof VALID_SORTS)[number])
    : "recent";
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
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = checkRateLimit(`publish:${user.id}`, RATE_LIMITS.publish);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const changelog = (formData.get("changelog") as string) || null;
  const clientHash = (formData.get("sha256") as string) || null;

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

  // Compute server-side hash and verify against client-provided hash
  const serverHash = sha256(buffer);

  if (!clientHash) {
    return NextResponse.json(
      {
        error:
          "SHA-256 hash is required for publish integrity. Compute the hash client-side and include it as the 'sha256' form field.",
      },
      { status: 400 },
    );
  }

  if (clientHash !== serverHash) {
    return NextResponse.json(
      {
        error: "Integrity check failed: SHA-256 hash from client does not match uploaded file.",
        expected: clientHash,
        actual: serverHash,
      },
      { status: 400 },
    );
  }

  const hash = clientHash;

  // Parse and validate (v2 only — v1 rejected by parser)
  let parsed;
  try {
    parsed = parseDopsString(content);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  // Explicit v1 rejection (belt-and-suspenders — parser already rejects v1)
  if (parsed.frontmatter.dops !== "v2") {
    return NextResponse.json(
      { error: "v1 .dops format is no longer supported. Please migrate to v2." },
      { status: 400 },
    );
  }

  const { meta } = parsed.frontmatter;
  const slug = slugify(meta.name);

  const versionData = buildVersionData(parsed, {
    changelog,
    bufferLength: buffer.length,
    hash,
  });

  // Check if package exists
  const existingPkg = await prisma.package.findUnique({ where: { slug } });

  if (existingPkg) {
    return handleExistingPackage(existingPkg, user.id, slug, meta, buffer, versionData);
  }

  // Create new package + version
  versionData.filePath = await saveDopsFile(slug, meta.version, buffer);

  await prisma.package.create({
    data: {
      authorId: user.id,
      name: meta.name,
      slug,
      description: meta.description,
      tags: meta.tags || [],
      versions: { create: versionData },
    },
  });

  return NextResponse.json({ slug, version: meta.version, created: true }, { status: 201 });
}

function buildVersionData(
  parsed: ReturnType<typeof parseDopsString>,
  opts: { changelog: string | null; bufferLength: number; hash: string },
) {
  const fm = parsed.frontmatter;

  return {
    semver: fm.meta.version,
    changelog: opts.changelog,
    filePath: "",
    fileSize: opts.bufferLength,
    sha256: opts.hash,
    riskLevel: fm.risk?.level ?? null,
    permissions: fm.permissions ?? undefined,
    fileSpecs: fm.files ?? undefined,
    dopsVersion: "v2",
    // Shared optional fields
    detection: (fm.detection ?? undefined) as Prisma.InputJsonValue | undefined,
    verification: (fm.verification ?? undefined) as Prisma.InputJsonValue | undefined,
    scope: (fm.scope ?? undefined) as Prisma.InputJsonValue | undefined,
    execution: (fm.execution ?? undefined) as Prisma.InputJsonValue | undefined,
    updateConfig: (fm.update ?? undefined) as Prisma.InputJsonValue | undefined,
    capabilities: (fm.capabilities ?? undefined) as Prisma.InputJsonValue | undefined,
    // v2 context block
    contextBlock: fm.context as Prisma.InputJsonValue,
  };
}

async function handleExistingPackage(
  existingPkg: { id: string; authorId: string },
  userId: string,
  slug: string,
  meta: { version: string; description: string; tags?: string[] },
  buffer: Buffer,
  versionData: ReturnType<typeof buildVersionData>,
) {
  if (existingPkg.authorId !== userId) {
    return NextResponse.json(
      { error: "A package with this name already exists and belongs to another user" },
      { status: 403 },
    );
  }

  const existingVersion = await prisma.version.findUnique({
    where: { packageId_semver: { packageId: existingPkg.id, semver: meta.version } },
  });
  if (existingVersion) {
    return NextResponse.json({ error: `Version ${meta.version} already exists` }, { status: 409 });
  }

  versionData.filePath = await saveDopsFile(slug, meta.version, buffer);

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
