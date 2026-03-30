import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const packages = await prisma.package.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true, updatedAt: true, tags: true },
  });

  // Collect distinct tags from active packages
  const tagSet = new Set<string>();
  for (const pkg of packages) {
    for (const t of pkg.tags) {
      tagSet.add(t);
    }
  }

  // Get users who have at least one active package
  const users = await prisma.user.findMany({
    where: { packages: { some: { status: "ACTIVE" } } },
    select: { username: true, updatedAt: true },
  });

  const baseUrl = "https://hub.dojops.ai";

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/publish`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...packages.map((pkg) => ({
      url: `${baseUrl}/packages/${pkg.slug}`,
      lastModified: pkg.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...[...tagSet].map((tag) => ({
      url: `${baseUrl}/tags/${encodeURIComponent(tag)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    ...users.map((user) => ({
      url: `${baseUrl}/users/${user.username}`,
      lastModified: user.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
  ];
}
