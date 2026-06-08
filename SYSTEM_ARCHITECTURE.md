# PlacementOS — System Architecture

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Next.js 15 (Vercel Edge/SSR)                │  │
│  │  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌────────────┐  │  │
│  │  │  Pages  │ │ App Router│ │ Server │ │  Service    │  │  │
│  │  │         │ │  (RSC)   │ │ Actions│ │   Workers   │  │  │
│  │  └─────────┘ └──────────┘ └────────┘ └────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────────┐
│                    API / BFF Layer                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Next.js API Routes (Route Handlers)           │  │
│  │  ┌──────────┐ ┌───────────┐ ┌────────┐ ┌──────────┐  │  │
│  │  │  Auth    │ │  Roadmap  │ │Resume  │ │Interview │  │  │
│  │  │ Routes   │ │  Routes   │ │Routes  │ │ Routes   │  │  │
│  │  └──────────┘ └───────────┘ └────────┘ └──────────┘  │  │
│  │  ┌──────────┐ ┌───────────┐ ┌────────┐ ┌──────────┐  │  │
│  │  │  App     │ │  Dashboard│ │  DSA   │ │  Code    │  │  │
│  │  │ Tracker  │ │  Routes   │ │ Routes │ │ Review   │  │  │
│  │  └──────────┘ └───────────┘ └────────┘ └──────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└──────┬──────────────┬──────────────┬────────────────┬───────┘
       │              │              │                │
       ▼              ▼              ▼                ▼
┌──────────┐  ┌────────────┐  ┌──────────┐  ┌────────────────┐
│ Supabase │  │  Supabase  │  │Cloudflare│  │   AI Gateway   │
│   Auth   │  │ PostgreSQL │  │   R2     │  │                │
│(GoTrue)  │  │  (Primary) │  │(File     │  │ ┌────────────┐ │
│          │  │            │  │ Storage) │  │ │  Gemini    │ │
│ JWT      │  │  RLS       │  │          │  │ │  2.5 Flash │ │
│ Tokens   │  │  Realtime  │  │ Resumes  │  │ └────────────┘ │
│          │  │            │  │ PDFs     │  │ ┌────────────┐ │
│          │  │            │  │          │  │ │  GPT-4o    │ │
│          │  │            │  │ Signed   │  │ │  mini      │ │
│          │  │            │  │ URLs     │  │ └────────────┘ │
│          │  │            │  │          │  │ ┌────────────┐ │
│          │  │            │  │          │  │ │ Pinecone   │ │
│          │  │            │  │          │  │ │ (Post-MVP) │ │
│          │  │            │  │          │  │ └────────────┘ │
└──────────┘  └────────────┘  └──────────┘  └────────────────┘
```

## 2. Architecture Principles

| Principle | Application |
|-----------|-------------|
| **Server-side First** | All AI calls, file processing, and auth validation happen on the server. Client never holds API keys. |
| **Stateless API** | API routes are stateless. Session state stored in Supabase. JWT carries identity. |
| **Defense in Depth** | RLS at DB level + middleware at API level + input validation at edge. |
| **Graceful Degradation** | If AI is down, serve cached/fallback content. Never show a blank error. |
| **Cost-Aware Routing** | Expensive AI calls (GPT-4o) used only for interview eval. Cheap calls (Gemini Flash) for everything else. |
| **Streaming by Default** | AI responses streamed via SSE to avoid timeout and improve UX. |

## 3. Data Flow — Key Paths

### 3.1 Roadmap Generation
```
User Profile → POST /api/roadmap/generate → Build Prompt → Gemini 2.5 Flash
                                                              │
                    ┌─────────────────────────────────────────┘
                    ▼
              Parse JSON Response
                    │
                    ▼
          Validate against schema
                    │
                    ▼
          INSERT roadmaps + roadmap_topics
                    │
                    ▼
          Return roadmap → Client renders timeline
```

### 3.2 Resume Analysis
```
PDF Upload → POST /api/resume/upload → Validate (size, type, virus scan)
                │
                ▼
          Store in Cloudflare R2 → Signed URL
                │
                ▼
          Extract text (pdfjs) → POST /api/resume/analyze
                │
                ▼
          Gemini 2.5 Flash (ATS score, keywords, suggestions)
                │
                ▼
          INSERT resumes table → Return score + suggestions
```

### 3.3 Mock Interview
```
POST /api/interview/start → Gemini generates 5 questions → Store session
         │
         ▼ (Loop per question)
POST /api/interview/:id/answer → GPT-4o mini evaluates
         │
         ▼
Store score per question → Return feedback
         │
         ▼ (After last question)
      Session summary with total score
```

## 4. AI Pipeline Architecture

```
┌──────────────────┐     ┌───────────────────┐     ┌──────────────────┐
│  Prompt Template  │────▶│   AI Provider     │────▶│ Response Parser  │
│  Registry         │     │   (Gemini/OpenAI) │     │ & Validator     │
└──────────────────┘     └───────────────────┘     └──────────────────┘
         │                                                    │
         ▼                                                    ▼
┌──────────────────┐                                ┌──────────────────┐
│ - User Profile   │                                │ JSON Schema      │
│ - Context        │                                │ Validation       │
│ - System Prompt  │                                │ Fallback Handler │
│ - Few-shot       │                                │ Retry Logic      │
└──────────────────┘                                └──────────────────┘
```

### AI Provider Routing

| Feature | Model | Priority | Fallback | Max Retries |
|---------|-------|----------|----------|-------------|
| Roadmap Gen | Gemini 2.5 Flash | Primary | Pre-built template | 2 |
| Resume Analysis | Gemini 2.5 Flash | Primary | Cached last result | 2 |
| Interview Eval | GPT-4o mini | Primary | Gemini 2.5 Flash | 1 |
| DSA Analysis | Gemini 2.5 Flash | Primary | None | 2 |
| Code Review | Gemini 2.5 Flash | Primary | GPT-4o mini | 1 |

### Rate Limiting & Queuing
- **AI calls per user**: 20/day (Free), unlimited (Pro)
- **Queue**: In-memory queue with 10 req/min per user throttle
- **Burst**: Max 3 concurrent AI calls per user
- **Timeout**: 15s per AI call, fallback after timeout

## 5. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Vercel (Global Edge)                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Next.js 15 App                                      │  │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────────┐  │  │
│  │  │ Static     │  │ Serverless │  │ Edge Functions │  │  │
│  │  │ Assets     │  │ Functions  │  │ (Middleware)  │  │  │
│  │  └────────────┘  └────────────┘  └───────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
┌─────────────────────┐   ┌─────────────────────────────┐
│  Supabase (US East) │   │  Cloudflare R2 (Global)     │
│  ┌───────────────┐  │   │  ┌───────────────────────┐  │
│  │ PostgreSQL    │  │   │  │ Resume PDFs           │  │
│  │ Auth          │  │   │  │ Interview Recordings  │  │
│  │ Storage       │  │   │  │ (Post-MVP)            │  │
│  │ Realtime      │  │   │  └───────────────────────┘  │
│  └───────────────┘  │   └─────────────────────────────┘
└─────────────────────┘
```

### Environment Breakdown

| Environment | Purpose | Region | Supabase Branch |
|-------------|---------|--------|----------------|
| `development` | Local dev | Localhost | `main` (local) |
| `preview` | PR previews | Vercel edge | Branch per PR |
| `production` | Live | Vercel edge + US East | `main` |

### CI/CD Pipeline
```
Git Push → GitHub Actions → Lint → TypeCheck → Build → Vercel Deploy
                               │
                               ▼
                         Preview URL (if PR)
                               │
                               ▼
                    Production (if main branch)
```

## 6. Caching Strategy

| Data | Cache | TTL | Invalidation |
|------|-------|-----|--------------|
| Dashboard scores | React Server Component cache | 60s | On profile/score update |
| Roadmap | RSC cache + DB | 5 min | On regenerate |
| Resume scores | DB (no cache) | — | On re-analysis |
| Interview questions | Session (in-memory) | Session TTL | On session end |
| Company data | Static JSON (Vercel CDN) | 24h | Manual redeploy |
| Job listings | Server cache | 30 min | On sync |

## 7. Monitoring & Observability

| Tool | Purpose | Free Tier |
|------|---------|-----------|
| Sentry | Error tracking, performance traces | 5k events/month |
| PostHog | Product analytics, session replays | Self-hosted free |
| Supabase Logs | DB queries, auth events, edge function logs | Included |
| Vercel Analytics | Web vitals, pageviews | Included |

## 8. Cost Projection (MVP — 10k users)

| Service | Cost/month | Notes |
|---------|-----------|-------|
| Vercel Pro | $20 | Hobby enough for MVP |
| Supabase Pro | $25 | 8GB DB, 50GB bandwidth |
| Cloudflare R2 | $0 | Free tier (10GB) |
| Gemini 2.5 Flash | ~$10 | ~10k calls/month |
| GPT-4o mini | ~$5 | ~5k calls/month |
| Sentry | $0 | Free tier |
| Custom domain | $0 | Included with Vercel |
| **Total** | **~$60/month** | Scales to ~10k MAU |
