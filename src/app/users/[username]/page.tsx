import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserProfile } from "@/components/user/UserProfile";
import { PackageGrid } from "@/components/package/PackageGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return { title: `${username}` };
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
          title="Published Modules"
          subtitle={`${user.packages.length} module${user.packages.length !== 1 ? "s" : ""}`}
        />
        {user.packages.length > 0 ? (
          <PackageGrid packages={user.packages} />
        ) : (
          <EmptyState title="No modules published yet" />
        )}
      </div>
    </div>
  );
}
