import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserProfile } from "@/components/user/UserProfile";
import { PackageGrid } from "@/components/package/PackageGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Metadata } from "next";

interface Props {
  readonly params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: { bio: true, _count: { select: { packages: true } } },
  });
  const description =
    user?.bio ||
    `${username}'s profile on DojOps Hub — ${user?._count.packages ?? 0} published skills.`;
  const url = `https://hub.dojops.ai/users/${username}`;
  return {
    title: username,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${username} | DojOps Hub`,
      description,
      url,
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `${username} | DojOps Hub`,
      description,
    },
  };
}

export default async function UserPage({ params }: Props) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      packages: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        include: { author: { select: { username: true, displayName: true, avatarUrl: true } } },
      },
      _count: { select: { stars: true } },
    },
  });

  if (!user) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <UserProfile user={user} starCount={user._count.stars} />

      <div className="mt-12">
        <SectionHeading
          title="Published Skills"
          subtitle={`${user.packages.length} skill${user.packages.length === 1 ? "" : "s"}`}
        />
        {user.packages.length === 0 ? (
          <EmptyState title="No skills published yet" />
        ) : (
          <PackageGrid packages={user.packages} />
        )}
      </div>
    </div>
  );
}
