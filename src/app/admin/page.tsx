import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PackageModeration } from "@/components/admin/PackageModeration";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") redirect("/");

  const packages = await prisma.package.findMany({
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: {
      author: { select: { username: true, displayName: true } },
      _count: { select: { versions: true, comments: true } },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-text-primary mb-8">Admin — Package Moderation</h1>
      <PackageModeration packages={packages} />
    </div>
  );
}
