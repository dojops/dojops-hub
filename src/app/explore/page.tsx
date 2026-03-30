import { prisma } from "@/lib/prisma";
import { listPackages, searchPackages } from "@/lib/search";
import { PackageGrid } from "@/components/package/PackageGrid";
import { SearchBar } from "@/components/ui/SearchBar";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore skills",
  description:
    "Browse and discover DevOps skills for DojOps. Filter by category, search by name, and find the right automation skill for your infrastructure.",
  openGraph: {
    title: "Explore skills | DojOps Hub",
    description: "Browse and discover DevOps skills for DojOps.",
    url: "https://hub.dojops.ai/explore",
    siteName: "DojOps Hub",
  },
};

interface Props {
  readonly searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function ExplorePage({ searchParams }: Props) {
  const sp = await searchParams;
  const query = sp.q || "";
  const sort = (sp.sort || "recent") as "recent" | "stars" | "downloads";
  const tag = sp.tag;
  const page = Math.max(1, Number(sp.page) || 1);

  let result;
  if (query) {
    result = await searchPackages(query, { page, pageSize: 18 });
  } else {
    result = await listPackages({ page, pageSize: 18, sort, tag });
  }

  const totalPages = Math.ceil(result.total / result.pageSize);

  // Get popular tags
  const allTags = await prisma.package.findMany({
    where: { status: "ACTIVE" },
    select: { tags: true },
  });
  const tagCounts = new Map<string, number>();
  for (const p of allTags) {
    for (const t of p.tags) {
      tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
    }
  }
  const popularTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([name, count]) => ({ name, count }));

  const baseSearchParams: Record<string, string> = {};
  if (query) baseSearchParams.q = query;
  if (sort !== "recent") baseSearchParams.sort = sort;
  if (tag) baseSearchParams.tag = tag;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Explore Skills</h1>
        <p className="mt-1 text-text-secondary">
          Browse {result.total} available skill{result.total === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar className="w-full sm:max-w-md" />

        <div className="flex items-center gap-2">
          {(["recent", "stars", "downloads"] as const).map((s) => (
            <Link
              key={s}
              href={`/explore?${new URLSearchParams({ ...baseSearchParams, sort: s, page: "1" }).toString()}`}
            >
              <Button variant={sort === s ? "primary" : "ghost"} size="sm">
                {{ recent: "Recent", stars: "Most Stars", downloads: "Most Downloads" }[s]}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Tags */}
      {popularTags.length > 0 && !query && (
        <div className="mb-8 flex flex-wrap gap-2">
          {tag && (
            <Link href="/explore">
              <Button variant="ghost" size="sm">
                Clear filter
              </Button>
            </Link>
          )}
          {popularTags.map((t) => (
            <Link
              key={t.name}
              href={`/explore?${new URLSearchParams({ ...baseSearchParams, tag: t.name, page: "1" }).toString()}`}
            >
              <Button variant={tag === t.name ? "primary" : "secondary"} size="sm">
                {t.name} ({t.count})
              </Button>
            </Link>
          ))}
        </div>
      )}

      {result.packages.length === 0 ? (
        <EmptyState
          title={query ? "No results found" : "No skills yet"}
          description={
            query
              ? `No skills match "${query}". Try a different search term.`
              : "Be the first to publish a .dops skill."
          }
          action={
            !query && (
              <Link href="/publish">
                <Button>Publish a Skill</Button>
              </Link>
            )
          }
        />
      ) : (
        <>
          <PackageGrid packages={result.packages} />
          <div className="mt-8">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              basePath="/explore"
              searchParams={baseSearchParams}
            />
          </div>
        </>
      )}
    </div>
  );
}
