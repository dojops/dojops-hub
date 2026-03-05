import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

const packageWithAuthor = {
  author: { select: { username: true, displayName: true, avatarUrl: true } },
} satisfies Prisma.PackageInclude;

export async function searchPackages(
  query: string,
  { page = 1, pageSize = 20 }: { page?: number; pageSize?: number } = {},
) {
  // Sanitize: remove special tsquery characters and injection vectors
  const sanitized = query.replace(/[&|!():*<>'"\\;\0]/g, " ").trim();
  if (!sanitized) return { packages: [], total: 0, page, pageSize };

  // Convert to tsquery format: word1 & word2
  const tsquery = sanitized
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `${w}:*`)
    .join(" & ");

  const where = Prisma.sql`
    "searchVector" @@ to_tsquery('english', ${tsquery})
    AND "status" = 'ACTIVE'
  `;

  const [packages, countResult] = await Promise.all([
    prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        slug: string;
        description: string;
        tags: string[];
        starCount: number;
        downloadCount: number;
        createdAt: Date;
        authorId: string;
        rank: number;
      }>
    >`
      SELECT "id", "name", "slug", "description", "tags", "starCount", "downloadCount", "createdAt", "authorId",
        ts_rank("searchVector", to_tsquery('english', ${tsquery})) as rank
      FROM "Package"
      WHERE ${where}
      ORDER BY rank DESC
      LIMIT ${pageSize}
      OFFSET ${(page - 1) * pageSize}
    `,
    prisma.$queryRaw<[{ count: bigint }]>`
      SELECT count(*) FROM "Package" WHERE ${where}
    `,
  ]);

  const total = Number(countResult[0].count);

  // Fetch authors for results
  const authorIds = [...new Set(packages.map((p) => p.authorId))];
  const authors = await prisma.user.findMany({
    where: { id: { in: authorIds } },
    select: { id: true, username: true, displayName: true, avatarUrl: true },
  });
  const authorMap = new Map(authors.map((a) => [a.id, a]));

  const packagesWithAuthors = packages.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    tags: p.tags,
    starCount: p.starCount,
    downloadCount: p.downloadCount,
    createdAt: p.createdAt,
    rank: p.rank,
    author: authorMap.get(p.authorId) || {
      username: "unknown",
      displayName: null,
      avatarUrl: null,
    },
  }));

  return { packages: packagesWithAuthors, total, page, pageSize };
}

export async function listPackages({
  page = 1,
  pageSize = 20,
  sort = "recent" as "recent" | "stars" | "downloads",
  tag,
}: {
  page?: number;
  pageSize?: number;
  sort?: "recent" | "stars" | "downloads";
  tag?: string;
} = {}) {
  const where: Prisma.PackageWhereInput = { status: "ACTIVE" };
  if (tag) {
    where.tags = { has: tag };
  }

  const sortMap: Record<string, Prisma.PackageOrderByWithRelationInput> = {
    stars: { starCount: "desc" },
    downloads: { downloadCount: "desc" },
    recent: { createdAt: "desc" },
  };
  const orderBy = sortMap[sort] ?? sortMap.recent;

  const [packages, total] = await Promise.all([
    prisma.package.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: packageWithAuthor,
    }),
    prisma.package.count({ where }),
  ]);

  return { packages, total, page, pageSize };
}
