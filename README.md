<p align="center">
  <img src="public/icon.png" alt="DojOps Hub" width="80" />
</p>

<h1 align="center">DojOps Hub</h1>

<p align="center">
  Skill marketplace for <a href="https://github.com/dojops/dojops">DojOps</a>.<br />
  Publish, install, and browse <code>.dops</code> DevOps skills.
</p>

<p align="center">
  <strong>Live:</strong> <a href="https://hub.dojops.ai">hub.dojops.ai</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/next.js-15.2-000?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/postgresql-16-336791?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/prisma-6.4-2D3748?style=flat-square&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/tailwind-v4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License" />
</p>

<p align="center">
  <a href="https://sonarcloud.io/summary/new_code?id=dojops_dojops-hub"><img src="https://sonarcloud.io/api/project_badges/measure?project=dojops_dojops-hub&metric=alert_status" alt="Quality Gate Status" /></a>
</p>

## Stack

- Next.js 15.2 (App Router, standalone output)
- React 19 + TypeScript 5.7
- PostgreSQL 16 + Prisma 6.4 (ORM + migrations)
- NextAuth.js 4.24 (GitHub OAuth)
- Tailwind CSS v4 (cyberpunk dark theme)
- Zod 3.24 (schema validation)

## What it does

Users sign in with GitHub, publish `.dops` skill files, and install skills published by others. The CLI handles both ends: `dojops skills publish` uploads a file with a SHA-256 hash, and `dojops skills install` downloads it and verifies the hash matches. If it doesn't, the install aborts.

Search uses PostgreSQL full-text search (`tsvector` + GIN index, ranked by `ts_rank`). Packages can be starred, commented on, and moderated by admins.

API tokens use a `dojops_` prefix with SHA-256 hashing. Max 10 per user.

Rate limiting is in-memory, applied to publish (5/hr), star (30/min), comment (10/min), search (60/min), and token creation (5/hr).

## Pages

| Route                      | What's there                              |
| -------------------------- | ----------------------------------------- |
| `/`                        | Homepage with recent packages             |
| `/explore`                 | Browse all packages (sort, filter by tag) |
| `/packages/:slug`          | Package detail + latest version           |
| `/packages/:slug/versions` | Full version history                      |
| `/publish`                 | Publish a new `.dops` skill               |
| `/tags/:tag`               | Packages by tag                           |
| `/users/:username`         | User profile                              |
| `/settings/tokens`         | API token management                      |
| `/admin`                   | Package moderation (admin only)           |

## API

| Method | Route                          | Auth    | What it does                                  |
| ------ | ------------------------------ | ------- | --------------------------------------------- |
| GET    | `/api/packages`                | No      | List packages (pagination, sort, tag filter)  |
| POST   | `/api/packages`                | Yes     | Publish package (multipart, max 1MB, SHA-256) |
| GET    | `/api/packages/:slug`          | No      | Package detail + latest version               |
| GET    | `/api/packages/:slug/:ver`     | No      | Specific version detail                       |
| POST   | `/api/packages/:slug/star`     | Yes     | Toggle star                                   |
| GET    | `/api/packages/:slug/comments` | No      | List comments                                 |
| POST   | `/api/packages/:slug/comments` | Yes     | Post comment (max 2000 chars)                 |
| GET    | `/api/download/:slug/:ver`     | No      | Download `.dops` file                         |
| GET    | `/api/search?q=`               | No      | Full-text search                              |
| GET    | `/api/users/:username`         | No      | Public user profile                           |
| PATCH  | `/api/admin/packages/:id`      | Admin   | Moderate package                              |
| GET    | `/api/tokens`                  | Session | List API tokens                               |
| POST   | `/api/tokens`                  | Session | Create API token                              |
| DELETE | `/api/tokens/:id`              | Session | Revoke API token                              |

## Database

8 models in PostgreSQL:

- User — GitHub OAuth (githubId, username, role: USER/ADMIN, bio)
- Account / Session / VerificationToken — NextAuth internals
- Package — name, slug, description, tags, status (ACTIVE/FLAGGED/REMOVED), starCount, downloadCount, searchVector
- Version — semver, filePath, fileSize, sha256, riskLevel, permissions, inputFields, outputSpec, fileSpecs
- Star — unique per user+package, atomic starCount increment
- Comment — user comments on packages
- ApiToken — SHA-256 hashed, `dojops_` + 40 hex chars, optional expiry

## Development

Requires Node.js >= 20 and PostgreSQL 16 (or use Docker).

```bash
git clone https://github.com/dojops/dojops-hub.git
cd dojops-hub
npm install

# Start database
docker-compose up -d db

# Configure environment
cp .env.example .env
# Edit .env with your GitHub OAuth credentials and database URL

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

### Environment variables

| Variable          | What it's for                           |
| ----------------- | --------------------------------------- |
| `DATABASE_URL`    | PostgreSQL connection string            |
| `NEXTAUTH_URL`    | Base URL (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Random secret for session encryption    |
| `GITHUB_ID`       | GitHub OAuth App client ID              |
| `GITHUB_SECRET`   | GitHub OAuth App client secret          |

### Commands

```bash
npm run dev            # Dev server (http://localhost:3000)
npm run build          # Prisma generate + Next.js build
npm run lint           # ESLint
npm run format         # Prettier write
npm run format:check   # Prettier check
npx prisma migrate dev # Run migrations
npx prisma studio      # Visual database browser
```

## Docker

```bash
# Full stack (app + postgres)
docker-compose up --build

# App available at http://localhost:3000
```

Multi-stage build (node:20-slim). Runs `prisma migrate deploy` on startup, then drops to non-root user (`nextjs:1001`). Uploads stored at `/app/uploads` volume.

## Integrity

1. On publish, the CLI computes a SHA-256 hash client-side and sends it with the file. The hub verifies the hash matches what was uploaded.
2. On install, the CLI downloads the `.dops` file and gets the publisher's hash from the `X-Checksum-Sha256` header. It recomputes locally. If the hashes don't match, the install aborts.

## Components

31 components, organized by what they do:

- Layout (3): Navbar, Footer, Sidebar
- UI (8): GlowCard, Button, Badge, SearchBar, Pagination, SectionHeading, Spinner, EmptyState
- Package (9): PackageCard, PackageDetail, PackageGrid, DopsPreview, VersionHistory, RiskBadge, PermissionBadges, IntegrityHash, InstallCommand
- Community (4): StarButton, CommentThread, CommentItem, AuthorBadge
- Publish (2): PublishForm, MetadataPreview
- User (3): UserProfile, UserPackages, UserStars
- Admin (1): PackageModeration
- Settings (1): TokenManager

## Related repos

| Repo                                                      | What it is                                        |
| --------------------------------------------------------- | ------------------------------------------------- |
| [dojops/dojops](https://github.com/dojops/dojops)         | Main monorepo — CLI, API, all @dojops/\* packages |
| [dojops/dojops.ai](https://github.com/dojops/dojops.ai)   | Marketing website                                 |
| [dojops/dojops-doc](https://github.com/dojops/dojops-doc) | Documentation site                                |

## License

MIT
