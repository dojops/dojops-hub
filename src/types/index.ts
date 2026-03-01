export interface PackageWithAuthor {
  id: string;
  name: string;
  slug: string;
  description: string;
  tags: string[];
  status: string;
  starCount: number;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
  author: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  versions?: VersionInfo[];
}

export interface VersionInfo {
  id: string;
  semver: string;
  changelog: string | null;
  fileSize: number;
  sha256: string;
  riskLevel: string | null;
  permissions: Record<string, string> | null;
  inputFields: Record<string, unknown> | null;
  outputSpec: Record<string, unknown> | null;
  fileSpecs: unknown[] | null;
  createdAt: Date;
}

export interface SearchResult {
  packages: PackageWithAuthor[];
  total: number;
  page: number;
  pageSize: number;
}

export type SortOption = "recent" | "stars" | "downloads";
