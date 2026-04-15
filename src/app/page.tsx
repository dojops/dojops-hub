import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PackageGrid } from "@/components/package/PackageGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SearchBar } from "@/components/ui/SearchBar";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredPackages, recentPackages] = await Promise.all([
    prisma.package.findMany({
      where: { status: "ACTIVE" },
      orderBy: { starCount: "desc" },
      take: 6,
      include: { author: { select: { username: true, displayName: true, avatarUrl: true } } },
    }),
    prisma.package.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { author: { select: { username: true, displayName: true, avatarUrl: true } } },
    }),
  ]);

  return (
    <div className="bg-bg-primary">
      {/* Hero */}
      <section className="px-4 pb-12 pt-16 sm:pb-16 sm:pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
            DojOps Skills
            <br />
            <span className="text-[#3b82f6]">Marketplace</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-text-secondary sm:mt-6 sm:text-lg">
            Find, share, and install{" "}
            <code className="rounded-sm bg-bg-secondary px-1.5 py-0.5 font-mono text-xs text-text-primary sm:text-sm">
              .dops
            </code>{" "}
            skills for DojOps.
          </p>
          <div className="relative z-10 mx-auto mt-6 max-w-md sm:mt-8">
            <SearchBar />
          </div>
          <div className="mt-4 flex items-center justify-center gap-3 sm:mt-6 sm:gap-4">
            <Link href="/explore">
              <Button variant="primary" size="sm" className="sm:!h-11 sm:!px-5 sm:!text-base">
                Explore Skills
              </Button>
            </Link>
            <Link href="/publish">
              <Button variant="secondary" size="sm" className="sm:!h-11 sm:!px-5 sm:!text-base">
                Publish a Skill
              </Button>
            </Link>
          </div>
          <div className="mt-6 sm:mt-8">
            <code className="rounded-md border border-border-primary bg-bg-secondary px-3 py-1.5 font-mono text-xs text-text-secondary sm:px-4 sm:py-2 sm:text-sm">
              $ dojops skills install &lt;skill-name&gt;
            </code>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl border-t border-border-primary" />

      {/* Featured */}
      {featuredPackages.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading title="Featured Skills" subtitle="Most starred" />
          <PackageGrid packages={featuredPackages} />
          <div className="mt-8 text-center">
            <Link href="/explore?sort=stars">
              <Button variant="ghost">View all &rarr;</Button>
            </Link>
          </div>
        </section>
      )}

      {/* Recent */}
      {recentPackages.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <SectionHeading title="Recently Published" subtitle="Just added" />
          <PackageGrid packages={recentPackages} />
          <div className="mt-8 text-center">
            <Link href="/explore?sort=recent">
              <Button variant="ghost">View all &rarr;</Button>
            </Link>
          </div>
        </section>
      )}

      {/* Empty state for fresh installs */}
      {featuredPackages.length === 0 && recentPackages.length === 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="rounded-lg border border-border-primary bg-bg-card p-12 shadow-[var(--shadow-sm)]">
            <h2 className="text-xl font-semibold text-text-primary">No skills yet</h2>
            <p className="mt-2 text-text-secondary">
              Be the first to publish a .dops skill to the marketplace.
            </p>
            <Link href="/publish" className="mt-4 inline-block">
              <Button>Publish your first skill</Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
