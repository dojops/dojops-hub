import { PackageCard } from "./PackageCard";

interface PackageGridProps {
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

export function PackageGrid({ packages }: PackageGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {packages.map((pkg) => (
        <PackageCard key={pkg.id} pkg={pkg} />
      ))}
    </div>
  );
}
