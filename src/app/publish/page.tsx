import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { PublishForm } from "@/components/publish/PublishForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publish",
};

export default async function PublishPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-text-primary">Publish a Module</h1>
      <p className="mt-2 text-text-secondary">
        Upload a <code className="font-mono text-neon-cyan-dim">.dops</code> file to share your
        DevOps module with the community.
      </p>
      <div className="mt-8">
        <PublishForm />
      </div>
    </div>
  );
}
