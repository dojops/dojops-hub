<p align="center">
  <img src="public/icon.png" alt="DojOps Hub" width="80" />
</p>

<h1 align="center">DojOps Hub</h1>

<p align="center">
  <strong>Module marketplace for <a href="https://github.com/dojops/dojops">DojOps</a>.</strong><br />
  Discover, publish, and install <code>.dops</code> DevOps modules for the AI DevOps Automation Engine.
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

## Tech Stack

- **Next.js 15.2** (App Router, standalone output)
- **React 19** + **TypeScript 5.7**
- **PostgreSQL 16** + **Prisma 6.4** (ORM + migrations)
- **NextAuth.js 4.24** (GitHub OAuth)
- **Tailwind CSS v4** (cyberpunk dark theme)
- **Zod 3.24** (schema validation)

## Features

- **Package registry** — Publish, version, and download `.dops` module files
- **Full-text search** — PostgreSQL `tsvector` + GIN index with `ts_rank` ranking
- **GitHub OAuth** — Sign in with GitHub, role-based access (USER / ADMIN)
- **API tokens** — `dojops_` prefixed tokens with SHA-256 hashing, max 10 per user
- **Integrity verification** — SHA-256 publisher attestation on publish/install
- **Community** — Star packages, post comments, user profiles
- **Admin moderation** — Flag or remove packages
- **Rate limiting** — In-memory rate limiter on publish, star, comment, search, and token creation
- **CLI integration** — `dojops modules publish` / `dojops modules install` authenticate via Bearer token

## Pages

| Route                      | Description                               |
| -------------------------- | ----------------------------------------- |
| `/`                        | Homepage with recent packages             |
| `/explore`                 | Browse all packages (sort, filter by tag) |
| `/packages/:slug`          | Package detail + latest version           |
| `/packages/:slug/versions` | Full version history                      |
| `/publish`                 | Publish a new `.dops` module              |
| `/tags/:tag`               | Packages by tag                           |
| `/users/:username`         | User profile                              |
| `/settings/tokens`         | API token management                      |
| `/admin`                   | Package moderation (admin only)           |

## API Endpoints

| Method | Route                          | Auth    | Description                                   |
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

## Database Models

**8 models** in PostgreSQL:

- **User** — GitHub OAuth (githubId, username, role: USER/ADMIN, bio)
- **Account** / **Session** / **VerificationToken** — NextAuth internals
- **Package** — name, slug, description, tags, status (ACTIVE/FLAGGED/REMOVED), starCount, downloadCount, searchVector
- **Version** — semver, filePath, fileSize, sha256, riskLevel, permissions, inputFields, outputSpec, fileSpecs
- **Star** — Unique per user+package, atomic starCount increment
- **Comment** — User comments on packages
- **ApiToken** — SHA-256 hashed, `dojops_` + 40 hex chars, optional expiry

## Development

### Prerequisites

- Node.js >= 20
- PostgreSQL 16 (or use Docker)

### Setup

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

### Environment Variables

| Variable          | Description                             |
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

**Dockerfile**: Multi-stage build (node:20-slim). Runs `prisma migrate deploy` on startup, then drops to non-root user (`nextjs:1001`). Uploads stored at `/app/uploads` volume.

## Publish/Install Integrity

1. **Publish**: CLI computes SHA-256 client-side, sends as multipart field. Hub verifies hash matches uploaded file.
2. **Install**: CLI downloads `.dops` file, receives publisher hash via `X-Checksum-Sha256` header, recomputes locally. Mismatch aborts with integrity error.

## Components

31 components organized by domain:

- **Layout** (3): Navbar, Footer, Sidebar
- **UI** (8): GlowCard, Button, Badge, SearchBar, Pagination, SectionHeading, Spinner, EmptyState
- **Package** (9): PackageCard, PackageDetail, PackageGrid, DopsPreview, VersionHistory, RiskBadge, PermissionBadges, IntegrityHash, InstallCommand
- **Community** (4): StarButton, CommentThread, CommentItem, AuthorBadge
- **Publish** (2): PublishForm, MetadataPreview
- **User** (3): UserProfile, UserPackages, UserStars
- **Admin** (1): PackageModeration
- **Settings** (1): TokenManager

## Related Repos

| Repo                                                      | Description                                       |
| --------------------------------------------------------- | ------------------------------------------------- |
| [dojops/dojops](https://github.com/dojops/dojops)         | Main monorepo — CLI, API, all @dojops/\* packages |
| [dojops/dojops.ai](https://github.com/dojops/dojops.ai)   | Marketing website                                 |
| [dojops/dojops-doc](https://github.com/dojops/dojops-doc) | Documentation site                                |

## License

MIT
