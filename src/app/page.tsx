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
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="animate-fade-in-up text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-gradient-cyan">DojOps Tools</span>
            <br />
            <span className="text-text-primary">Marketplace</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Discover, publish, and install <code className="font-mono text-neon-cyan-dim">.dops</code> tools
            for DojOps. Community-driven DevOps automation.
          </p>
          <div className="mx-auto mt-8 max-w-md animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <SearchBar />
          </div>
          <div className="mt-6 flex items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Link href="/explore">
              <Button variant="primary" size="lg">
                Explore Tools
              </Button>
            </Link>
            <Link href="/publish">
              <Button variant="secondary" size="lg">
                Publish a Tool
              </Button>
            </Link>
          </div>
          <div className="mt-8 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <code className="rounded-lg border border-glass-border bg-surface px-4 py-2 font-mono text-sm text-text-secondary">
              $ dojops tools install &lt;tool-name&gt;
            </code>
          </div>
        </div>
      </section>

      <div className="section-divider mx-auto max-w-5xl" />

      {/* Featured */}
      {featuredPackages.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading title="Featured Tools" subtitle="Most starred by the community" />
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
          <SectionHeading title="Recently Published" subtitle="Latest tools from the community" />
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
          <div className="rounded-xl border border-glass-border bg-surface p-12">
            <h2 className="text-xl font-semibold text-text-primary">No tools yet</h2>
            <p className="mt-2 text-text-secondary">
              Be the first to publish a .dops tool to the marketplace.
            </p>
            <Link href="/publish" className="mt-4 inline-block">
              <Button>Publish your first tool</Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
