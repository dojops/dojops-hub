import Link from "next/link";
import { GlowCard } from "@/components/ui/GlowCard";
import { Badge } from "@/components/ui/Badge";
import { timeAgo } from "@/lib/utils";

interface PackageCardProps {
  pkg: {
    name: string;
    slug: string;
    description: string;
    tags: string[];
    starCount: number;
    downloadCount: number;
    createdAt: Date;
    author: {
      username: string;
      displayName: string | null;
      avatarUrl: string | null;
    };
  };
}

export function PackageCard({ pkg }: Readonly<PackageCardProps>) {
  return (
    <Link href={`/packages/${pkg.slug}`}>
      <GlowCard as="article" className="h-full max-w-sm p-4">
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="font-mono text-sm font-semibold text-text-primary">{pkg.name}</h3>
            <p className="mt-1 text-sm text-text-secondary line-clamp-2">{pkg.description}</p>
          </div>

          {pkg.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {pkg.tags.slice(0, 4).map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          )}

          <div className="mt-auto flex items-center justify-between pt-2 text-xs text-text-tertiary">
            <span className="flex items-center gap-1.5">
              {pkg.author.avatarUrl && (
                <img
                  src={pkg.author.avatarUrl}
                  alt=""
                  width={16}
                  height={16}
                  className="rounded-full"
                />
              )}
              {pkg.author.displayName || pkg.author.username}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                {pkg.starCount}
              </span>
              <span className="flex items-center gap-1">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                {pkg.downloadCount}
              </span>
              <span>{timeAgo(pkg.createdAt)}</span>
            </div>
          </div>
        </div>
      </GlowCard>
    </Link>
  );
}
