import { PackageGrid } from "@/components/package/PackageGrid";
import { EmptyState } from "@/components/ui/EmptyState";

interface UserStarsProps {
  packages: Array<{
    id: string;
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
  }>;
}

export function UserStars({ packages }: UserStarsProps) {
  if (packages.length === 0) {
    return <EmptyState title="No starred modules yet" />;
  }
  return <PackageGrid packages={packages} />;
}
