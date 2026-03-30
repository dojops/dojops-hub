import { prisma } from "@/lib/prisma";
import { PackageGrid } from "@/components/package/PackageGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import type { Metadata } from "next";

interface Props {
  readonly params: Promise<{ tag: string }>;
  readonly searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  const count = await prisma.package.count({ where: { status: "ACTIVE", tags: { has: tag } } });
  const description = `Browse ${count} DojOps skill${count === 1 ? "" : "s"} tagged with "${tag}". Automation skills, ready to install.`;
  const url = `https://hub.dojops.ai/tags/${rawTag}`;
  return {
    title: `#${tag}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `#${tag} Skills | DojOps Hub`,
      description,
      url,
      siteName: "DojOps Hub",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `#${tag} Skills | DojOps Hub`,
      description,
    },
  };
}

export default async function TagPage({ params, searchParams }: Props) {
  const { tag: rawTag } = await params;
  const sp = await searchParams;
  const tag = decodeURIComponent(rawTag);
  const page = Math.max(1, Number(sp.page) || 1);
  const pageSize = 18;

  const [packages, total] = await Promise.all([
    prisma.package.findMany({
      where: { status: "ACTIVE", tags: { has: tag } },
      orderBy: { starCount: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { author: { select: { username: true, displayName: true, avatarUrl: true } } },
    }),
    prisma.package.count({ where: { status: "ACTIVE", tags: { has: tag } } }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        title={`#${tag}`}
        subtitle={`${total} skill${total === 1 ? "" : "s"} tagged with "${tag}"`}
      />

      {packages.length === 0 ? (
        <EmptyState title="No skills with this tag" />
      ) : (
        <>
          <PackageGrid packages={packages} />
          <div className="mt-8">
            <Pagination currentPage={page} totalPages={totalPages} basePath={`/tags/${rawTag}`} />
          </div>
        </>
      )}
    </div>
  );
}
