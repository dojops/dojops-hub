import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sortVersionsDesc } from "@/lib/utils";
import { PackageDetail } from "@/components/package/PackageDetail";
import { DopsPreview } from "@/components/package/DopsPreview";
import { StarButton } from "@/components/community/StarButton";
import { CommentThread } from "@/components/community/CommentThread";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  readonly params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await prisma.package.findUnique({
    where: { slug },
    select: { name: true, description: true, tags: true },
  });
  if (!pkg) return { title: "Not Found" };
  const url = `https://hub.dojops.ai/packages/${slug}`;
  return {
    title: pkg.name,
    description: pkg.description || `${pkg.name} — a DojOps DevOps automation skill.`,
    keywords: pkg.tags,
    alternates: { canonical: url },
    openGraph: {
      title: `${pkg.name} | DojOps Hub`,
      description: pkg.description || `${pkg.name} — a DojOps DevOps automation skill.`,
      url,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${pkg.name} | DojOps Hub`,
      description: pkg.description || `${pkg.name} — a DojOps DevOps automation skill.`,
    },
  };
}

export default async function PackagePage({ params }: Props) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  const pkg = await prisma.package.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      author: { select: { username: true, displayName: true, avatarUrl: true } },
      versions: true,
      comments: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { username: true, displayName: true, avatarUrl: true } } },
      },
    },
  });

  if (!pkg) notFound();

  sortVersionsDesc(pkg.versions);
  const latestVersion = pkg.versions[0] || null;

  // Check if user has starred
  let isStarred = false;
  if (session) {
    const star = await prisma.star.findUnique({
      where: { userId_packageId: { userId: session.user.id, packageId: pkg.id } },
    });
    isStarred = !!star;
  }

  // Try to parse .dops for section preview
  let sections = null;
  if (latestVersion) {
    try {
      const { readDopsFile } = await import("@/lib/storage");
      const { parseDopsString } = await import("@/lib/dops-parser");
      const content = await readDopsFile(pkg.slug, latestVersion.semver);
      const parsed = parseDopsString(content.toString("utf-8"));
      sections = parsed.sections;
    } catch {
      // File might not exist or be unparseable
    }
  }

  // JSON-LD structured data — values from validated DB fields, JSON.stringify auto-escapes
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: pkg.name,
    description: pkg.description,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Linux, macOS, Windows",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Person", name: pkg.author.displayName || pkg.author.username },
    ...(pkg.starCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingCount: pkg.starCount,
        bestRating: 1,
        worstRating: 0,
      },
    }),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <PackageDetail
        pkg={pkg}
        latestVersion={
          latestVersion
            ? {
                semver: latestVersion.semver,
                fileSize: latestVersion.fileSize,
                sha256: latestVersion.sha256,
                riskLevel: latestVersion.riskLevel,
                permissions: latestVersion.permissions as Record<string, string> | null,
                inputFields: latestVersion.inputFields as Record<string, unknown> | null,
                outputSpec: latestVersion.outputSpec as Record<string, unknown> | null,
                fileSpecs: latestVersion.fileSpecs as unknown[] | null,
                dopsVersion: (latestVersion as Record<string, unknown>).dopsVersion as
                  | string
                  | null,
                contextBlock: (latestVersion as Record<string, unknown>).contextBlock as {
                  technology?: string;
                  fileFormat?: string;
                  bestPractices?: string[];
                  context7Libraries?: Array<{ name: string; query: string }>;
                } | null,
                createdAt: latestVersion.createdAt,
              }
            : null
        }
        totalVersions={pkg.versions.length}
      />

      <div className="mt-6">
        <StarButton slug={pkg.slug} initialStarred={isStarred} initialCount={pkg.starCount} />
      </div>

      {sections && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Skill Specification</h2>
          <DopsPreview sections={sections} />
        </div>
      )}

      <div className="mt-12">
        <CommentThread
          slug={pkg.slug}
          comments={pkg.comments.map((c) => ({
            id: c.id,
            body: c.body,
            createdAt: c.createdAt,
            user: c.user,
            isAuthor: c.user.username === pkg.author.username,
          }))}
          isAuthenticated={!!session}
        />
      </div>
    </div>
  );
}
