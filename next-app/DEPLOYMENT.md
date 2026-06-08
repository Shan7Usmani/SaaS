# Deployment Guide

## Architecture

```
Git Push (main)
  → GitHub Actions CI (lint, typecheck, build, db check)
  → Vercel Preview Deploy
  → Vercel Production Deploy
  → Health Check
```

## Prerequisites

1. **Vercel** account (free tier: 100GB bandwidth, 6000 build min/mo)
2. **Supabase** project (free tier: 500MB DB, 50k MAU)
3. **Sentry** account (free tier: 5k events/mo)
4. **GitHub** repository

## Initial Setup

### 1. Supabase

```bash
# Create project at https://supabase.com
# Run migrations
npx supabase db push

# Generate TypeScript types
npm run db:types
```

**Required env vars:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link
vercel login
vercel link

# Set root directory to `next-app/` in Vercel dashboard:
#   Project Settings → Root Directory → next-app
```

**Vercel Dashboard** → Project Settings → Environment Variables:
- Add all variables from `.env.example`
- Set `SENTRY_AUTH_TOKEN` for source map uploads

### 3. GitHub Secrets

Add these to **GitHub repo → Settings → Secrets and variables → Actions**:

| Secret | Purpose |
|--------|---------|
| `VERCEL_TOKEN` | Vercel API token (from Vercel dashboard → Settings → Tokens) |
| `VERCEL_ORG_ID` | Vercel org ID (`vercel teams list`) |
| `VERCEL_PROJECT_ID` | Vercel project ID (`vercel project ls`) |
| `SENTRY_AUTH_TOKEN` | Sentry auth token (from Sentry → Settings → Auth Tokens) |

**GitHub Variables** (non-secret):
| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN |

### 4. Sentry

```bash
# Create project at https://sentry.io
# Copy DSN to NEXT_PUBLIC_SENTRY_DSN
```

## Environments

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| Production | `main` | `https://placementos.vercel.app` | Live |
| Preview | PR branches | `https://*-git-*.vercel.app` | Testing |

## CI/CD Pipeline

### CI (on PR + push to main)
- Lint (ESLint)
- TypeScript check (`tsc --noEmit`)
- Production build
- Database migration dry-run

### Deploy (on push to main)
1. Deploy preview (branch deployment)
2. Promote to production
3. Health check against `/api/health`

## Monitoring

### Error Tracking (Sentry)

| Config | Rate |
|--------|------|
| Client traces | 10% |
| Server traces | 20% |
| Session replays | 5% (100% on error) |

### Health Check

Endpoint: `GET /api/health`

```
Response:
{
  "status": "healthy" | "degraded",
  "timestamp": "2026-06-09T...",
  "uptime": 123.45,
  "environment": "production",
  "checks": {
    "database": "ok" | "error"
  },
  "responseTimeMs": 42
}
```

### Logging

Structured JSON logging via `@/lib/logger`:

```ts
import { logger } from "@/lib/logger"

logger.info("Roadmap generated", { userId, roadmapId })
logger.error("AI call failed", error, { feature: "roadmap", model })
```

Log levels controlled by `NEXT_PUBLIC_LOG_LEVEL` env var:
- `debug` (development)
- `info` (production default)
- `warn`
- `error`

## Cost Breakdown (MVP)

| Service | Cost | Notes |
|---------|------|-------|
| Vercel | $0 | Hobby tier, 100GB bandwidth |
| Supabase | $0 | Free tier, 500MB DB |
| Sentry | $0 | Free tier, 5k events/mo |
| GitHub Actions | $0 | Public repo, 2000 min/mo |
| **Total** | **$0/mo** | Scales to ~1k users |

## Troubleshooting

### Build fails
- Check `Vercel Root Directory` is set to `next-app/`
- Verify all env vars are set in Vercel dashboard

### Database errors
- Run `supabase migration up` to apply pending migrations
- Check RLS policies are enabled

### Sentry not reporting
- Verify `NEXT_PUBLIC_SENTRY_DSN` is correct
- Check `SENTRY_AUTH_TOKEN` is set for source maps
