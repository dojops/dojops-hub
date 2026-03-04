# Contributing

Contributions to DojOps Hub are welcome! This is the module marketplace for the [DojOps](https://github.com/dojops/dojops) ecosystem.

## Development Setup

```bash
git clone https://github.com/dojops/dojops-hub.git
cd dojops-hub
npm install
docker-compose up -d db   # Start PostgreSQL
npx prisma migrate dev    # Apply migrations
npm run dev               # Start dev server
```

## Available Commands

```bash
npm run dev           # Next.js dev server
npm run build         # Prisma generate + Next.js build
npm run lint          # ESLint
npm run format        # Prettier write
npm run format:check  # Prettier check
npx prisma studio     # Visual database browser
```

## Commit Convention

This repo uses [Conventional Commits](https://www.conventionalcommits.org/). Husky enforces this on every commit.

```
feat(api): add token revocation endpoint
fix(ui): correct star button optimistic update
docs: update API examples
```

## PR Checklist

- [ ] All linting passes (`npm run lint`)
- [ ] Formatting is correct (`npm run format:check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Database migrations are included if schema changed
- [ ] New API endpoints include rate limiting
- [ ] Breaking changes are documented
