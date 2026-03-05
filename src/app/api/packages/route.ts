import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseDopsStringAny } from "@/lib/dops-parser";
import { isV2Module } from "@/lib/dops-schema";
import { saveDopsFile } from "@/lib/storage";
import { slugify, sha256 } from "@/lib/utils";
import { listPackages } from "@/lib/search";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getAuthenticatedUser } from "@/lib/api-auth";
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

  if (clientHash && clientHash !== serverHash) {
    return NextResponse.json(
      {
        error: "Integrity check failed: SHA-256 hash from client does not match uploaded file.",
        expected: clientHash,
        actual: serverHash,
      },
      { status: 400 },
    );
  }

  // Use the client-provided hash as the publisher attestation (or fall back to server-computed)
  const hash = clientHash || serverHash;

  // Parse and validate (supports both v1 and v2 formats)
  let parsed;
  try {
    parsed = parseDopsStringAny(content);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  const { meta } = parsed.frontmatter;
  const slug = slugify(meta.name);
  const isV2 = isV2Module(parsed);

  const versionData = buildVersionData(parsed, isV2, {
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
  parsed: ReturnType<typeof parseDopsStringAny>,
  isV2: boolean,
  opts: { changelog: string | null; bufferLength: number; hash: string },
) {
  const data = {
    semver: parsed.frontmatter.meta.version,
    changelog: opts.changelog,
    filePath: "",
    fileSize: opts.bufferLength,
    sha256: opts.hash,
    riskLevel: parsed.frontmatter.risk?.level ?? null,
    permissions: parsed.frontmatter.permissions as Prisma.InputJsonValue | undefined,
    fileSpecs: parsed.frontmatter.files as Prisma.InputJsonValue | undefined,
    dopsVersion: isV2 ? "v2" : "v1",
    inputFields: undefined as Prisma.InputJsonValue | undefined,
    outputSpec: undefined as Prisma.InputJsonValue | undefined,
    contextBlock: undefined as Prisma.InputJsonValue | undefined,
  };

  if (isV2) {
    const fm = parsed.frontmatter as { context: unknown };
    data.contextBlock = fm.context as Prisma.InputJsonValue;
  } else {
    const fm = parsed.frontmatter as { input?: { fields: unknown }; output?: unknown };
    data.inputFields = (fm.input?.fields ?? undefined) as Prisma.InputJsonValue | undefined;
    data.outputSpec = (fm.output ?? undefined) as Prisma.InputJsonValue | undefined;
  }

  return data;
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
