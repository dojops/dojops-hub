import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PackageGrid } from "@/components/package/PackageGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  readonly params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return { title: `Stars — ${username}` };
}

export default async function UserStarsPage({ params }: Props) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      stars: {
        orderBy: { createdAt: "desc" },
        include: {
          package: {
            include: {
              author: { select: { username: true, displayName: true, avatarUrl: true } },
            },
          },
        },
      },
    },
  });

  if (!user) notFound();

  const starredPackages = user.stars.map((s) => s.package).filter((p) => p.status === "ACTIVE");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link href={`/users/${username}`} className="text-sm text-neon-cyan hover:underline">
          &larr; {user.displayName || user.username}
        </Link>
      </div>

      <SectionHeading
        title="Starred Skills"
        subtitle={`${starredPackages.length} skill${starredPackages.length === 1 ? "" : "s"}`}
      />

      {starredPackages.length === 0 ? (
        <EmptyState title="No starred skills yet" />
      ) : (
        <PackageGrid packages={starredPackages} />
      )}
    </div>
  );
}
