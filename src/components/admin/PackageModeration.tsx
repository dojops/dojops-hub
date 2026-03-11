"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface PackageRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  starCount: number;
  downloadCount: number;
  author: { username: string; displayName: string | null };
  _count: { versions: number; comments: number };
}

export function PackageModeration({
  packages: initialPackages,
}: Readonly<{ packages: PackageRow[] }>) {
  const [packages, setPackages] = useState(initialPackages);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/packages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setPackages(packages.map((p) => (p.id === id ? { ...p, status } : p)));
    }
  }

  const statusVariantMap: Record<string, string> = {
    ACTIVE: "green",
    FLAGGED: "amber",
    REMOVED: "red",
  };
  const statusVariant = (s: string) => statusVariantMap[s] ?? "red";

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-primary bg-bg-secondary text-left text-text-secondary font-semibold text-sm">
            <th className="pb-3 pr-4">Package</th>
            <th className="pb-3 pr-4">Author</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3 pr-4">Stats</th>
            <th className="pb-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {packages.map((pkg) => (
            <tr
              key={pkg.id}
              className="border-b border-border-primary bg-bg-card hover:bg-bg-card-hover transition-colors"
            >
              <td className="py-3 pr-4 font-mono text-text-primary">{pkg.name}</td>
              <td className="py-3 pr-4 text-text-secondary">{pkg.author.username}</td>
              <td className="py-3 pr-4">
                <Badge variant={statusVariant(pkg.status) as "green" | "amber" | "red"}>
                  {pkg.status}
                </Badge>
              </td>
              <td className="py-3 pr-4 text-text-secondary">
                {pkg._count.versions}v / {pkg.starCount}* / {pkg.downloadCount}dl
              </td>
              <td className="py-3">
                <div className="flex gap-2">
                  {pkg.status !== "ACTIVE" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateStatus(pkg.id, "ACTIVE")}
                    >
                      Activate
                    </Button>
                  )}
                  {pkg.status !== "FLAGGED" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateStatus(pkg.id, "FLAGGED")}
                    >
                      Flag
                    </Button>
                  )}
                  {pkg.status !== "REMOVED" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateStatus(pkg.id, "REMOVED")}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
