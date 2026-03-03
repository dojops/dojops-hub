import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { RiskBadge } from "./RiskBadge";
import { PermissionBadges } from "./PermissionBadges";
import { InstallCommand } from "./InstallCommand";
import { IntegrityHash } from "./IntegrityHash";
import { formatDate, formatBytes } from "@/lib/utils";

interface PackageDetailProps {
  pkg: {
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
  };
  latestVersion: {
    semver: string;
    fileSize: number;
    sha256: string;
    riskLevel: string | null;
    permissions: Record<string, string> | null;
    inputFields: Record<string, unknown> | null;
    outputSpec: Record<string, unknown> | null;
    fileSpecs: unknown[] | null;
    dopsVersion: string | null;
    contextBlock: {
      technology?: string;
      fileFormat?: string;
      bestPractices?: string[];
      context7Libraries?: Array<{ name: string; query: string }>;
    } | null;
    createdAt: Date;
  } | null;
  totalVersions: number;
}

export function PackageDetail({ pkg, latestVersion, totalVersions }: PackageDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-mono text-neon-cyan">{pkg.name}</h1>
            <p className="mt-2 text-text-secondary">{pkg.description}</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-text-secondary shrink-0">
            <span className="flex items-center gap-1">
              <svg
                width="16"
                height="16"
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
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              {pkg.downloadCount}
            </span>
          </div>
        </div>

        {/* Author */}
        <Link
          href={`/users/${pkg.author.username}`}
          className="mt-4 inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
        >
          {pkg.author.avatarUrl && (
            <Image
              src={pkg.author.avatarUrl}
              alt={pkg.author.username}
              width={20}
              height={20}
              className="rounded-full"
            />
          )}
          {pkg.author.displayName || pkg.author.username}
        </Link>

        {/* Tags */}
        {pkg.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {pkg.tags.map((tag) => (
              <Link key={tag} href={`/tags/${tag}`}>
                <Badge>{tag}</Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Install */}
      <InstallCommand name={pkg.name} />

      {/* Version info */}
      {latestVersion && (
        <div className="rounded-lg border border-glass-border bg-surface p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant="cyan">v{latestVersion.semver}</Badge>
            {latestVersion.dopsVersion && (
              <Badge variant="default">{latestVersion.dopsVersion}</Badge>
            )}
            {latestVersion.riskLevel && <RiskBadge level={latestVersion.riskLevel} />}
            <span className="text-xs text-text-secondary">
              {formatBytes(latestVersion.fileSize)}
            </span>
            <span className="text-xs text-text-secondary">
              {formatDate(latestVersion.createdAt)}
            </span>
          </div>

          <PermissionBadges
            permissions={latestVersion.permissions as Record<string, string> | null}
          />

          {/* v2: Context block */}
          {latestVersion.contextBlock && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-text-secondary">Technology</h3>
                <Badge variant="default">{latestVersion.contextBlock.technology}</Badge>
                {latestVersion.contextBlock.fileFormat && (
                  <Badge variant="default">{latestVersion.contextBlock.fileFormat}</Badge>
                )}
              </div>
              {latestVersion.contextBlock.bestPractices &&
                latestVersion.contextBlock.bestPractices.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-text-secondary mb-1">
                      Best Practices
                    </h3>
                    <ul className="list-disc list-inside text-xs text-text-secondary space-y-0.5">
                      {latestVersion.contextBlock.bestPractices.map((bp, i) => (
                        <li key={i}>{bp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              {latestVersion.contextBlock.context7Libraries &&
                latestVersion.contextBlock.context7Libraries.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-text-secondary mb-1">
                      Documentation Sources
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {latestVersion.contextBlock.context7Libraries.map((lib) => (
                        <Badge key={lib.name} variant="default">
                          {lib.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* v1: Input Fields */}
          {!latestVersion.contextBlock &&
            latestVersion.inputFields &&
            Object.keys(latestVersion.inputFields).length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-text-secondary mb-1">Input Fields</h3>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(latestVersion.inputFields).map((field) => (
                    <Badge key={field} variant="default">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          {latestVersion.fileSpecs &&
            (latestVersion.fileSpecs as Array<{ path: string }>).length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-text-secondary mb-1">Output Files</h3>
                <div className="flex flex-wrap gap-1">
                  {(latestVersion.fileSpecs as Array<{ path: string }>).map((f) => (
                    <code
                      key={f.path}
                      className="rounded bg-surface-elevated px-2 py-0.5 font-mono text-xs text-neon-cyan-dim"
                    >
                      {f.path}
                    </code>
                  ))}
                </div>
              </div>
            )}

          <div className="flex items-center gap-3">
            <Link
              href={`/packages/${pkg.slug}/versions`}
              className="text-xs text-neon-cyan hover:underline"
            >
              {totalVersions} version{totalVersions !== 1 ? "s" : ""}
            </Link>
          </div>

          {/* Integrity hash — publisher attestation */}
          <IntegrityHash hash={latestVersion.sha256} />
        </div>
      )}
    </div>
  );
}
