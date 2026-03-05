import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sortVersionsDesc } from "@/lib/utils";
import { VersionHistory } from "@/components/package/VersionHistory";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  readonly params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Versions — ${slug}` };
}

export default async function VersionsPage({ params }: Props) {
  const { slug } = await params;

  const pkg = await prisma.package.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      versions: true,
    },
  });

  if (!pkg) notFound();

  sortVersionsDesc(pkg.versions);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link href={`/packages/${slug}`} className="text-sm text-neon-cyan hover:underline">
          &larr; {pkg.name}
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-text-primary">Version History</h1>
      </div>
      <VersionHistory versions={pkg.versions} />
    </div>
  );
}
