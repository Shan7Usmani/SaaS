# Project Context — PlacementOS

> Persistent reference for all agents
> Updated: 2026-06-09

---

## Product

**PlacementOS** — "Your AI Placement Coach"
An AI-powered placement preparation platform for college students. Generates personalized roadmaps, analyzes resumes, conducts mock interviews, and tracks job applications.

## Current Phase

**MVP Stabilization** — Core features built, P0 issues being remediated.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Library | ShadCN UI (Base UI + Radix) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (GoTrue) |
| Storage | Supabase Storage (signed URLs) |
| AI | Gemini (roadmap/resume), OpenAI (interview) |
| Deployment | Vercel |
| Monitoring | Sentry |
| Version Control | GitHub |
| Package Manager | npm |
| Package Manager | npm |

## Key Architecture Decisions

- `profiles` table (not `users`) to avoid collision with `auth.users`
- Rate limiting via wrapper HOF (not middleware)
- Resume PDFs stored in Supabase Storage with signed URLs (not Cloudflare R2)
- AI routing: Gemini → roadmap & resume analysis; OpenAI → interview
- Dashboard data served from aggregation queries, not separate tables

## Directory Layout

```
SaaS-Product/
├── Project-vision.md            # Product vision document
├── PRODUCT_REQUIREMENTS.md      # 14 modules, personas, requirements
├── USER_STORIES.md              # 20 stories across all epics
├── MVP_SCOPE.md                 # Week 4 scope, cut lines, feature flags
├── DEVELOPMENT_BACKLOG.md       # 127 tasks across 11 sprints
├── SYSTEM_ARCHITECTURE.md       # Architecture design doc
├── DATABASE_SCHEMA.md           # Database schema design doc
├── API_SPEC.md                  # API specification doc
├── SECURITY_PLAN.md             # Security architecture doc
├── FOLDER_STRUCTURE.md          # Folder structure doc
├── ARCHITECT_REVIEW.md          # Architecture review findings
├── REMEDIATION_PLAN.md          # P0 remediation plan
├── WORKSPACE_ARCHITECTURE.md    # Workspace design doc
├── BOOTSTRAP_SYSTEM_DESIGN.md   # Bootstrap system design doc
├── AGENT_MEMORY_SYSTEM.md       # Agent memory system design doc
├── TERMINAL_AUTOMATION_PLAN.md  # Terminal automation design doc
├── bootstrap.ps1                # Workspace bootstrap script
├── next-app/                    # Next.js 16 implementation
│   ├── app/                     # App Router pages & API routes
│   ├── components/              # React components
│   ├── lib/                     # Utilities, AI, Supabase clients
│   ├── supabase/                # Migrations & seed data
│   ├── types/                   # TypeScript types
│   └── styles/                  # Global styles
└── workspace/                   # Agent orchestration (this directory)
```

## Key Constraints

- Windows development environment (PowerShell 5.1)
- Post-MVP: Cloudflare R2 for resume storage, Stripe for subscriptions, WebSockets for real-time
- Feature flags control access to post-MVP modules
- All user data is row-level-security isolated
