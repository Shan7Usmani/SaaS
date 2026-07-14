<div align="center">

# PlacementOS

**Your AI Placement Coach**

From *"I don't know where to start"* to *"I'm interview-ready for Amazon, Microsoft, TCS, Infosys"*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-placementos--gold.vercel.app-blue?style=for-the-badge&logo=vercel)](https://placementos-gold.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

</div>

---

## The Problem

1.5M+ engineering students in India sit for placements every year. Their preparation is scattered across:
- Random YouTube playlists
- WhatsApp groups with outdated info
- ₹50K coaching centers with no personalization
- Excel sheets tracking 47 different things

**There is no single platform that takes a student from "lost" to "placed."**

## What PlacementOS Does

PlacementOS is an AI-powered platform that replaces the entire scattered prep workflow with one intelligent system.

### Core Features (MVP - Live)

| Feature | What It Does |
|---------|-------------|
| **AI Roadmap Generator** | Personalized month-by-month plan based on target companies, current DSA level, and branch |
| **Resume Analyzer** | Upload PDF → AI scores ATS compatibility, keywords, projects, skills with fix suggestions |
| **Mock Interviews** | AI conducts technical + HR interviews, evaluates answers, scores confidence |
| **Application Tracker** | Kanban board to track Applied → OA → Interview → Offer across all companies |
| **Placement Dashboard** | Single view: DSA progress, resume score, interview readiness, aptitude, communication |
| **Auth System** | Email/password + Google OAuth, rate limiting, RLS security |

### Coming Soon

| Feature | Description |
|---------|------------|
| DSA Tracker | Sync LeetCode/GFG/HackerRank, AI analyzes weak topics |
| Company Prep | Amazon/Google/Microsoft-specific OA patterns, interview guides |
| Aptitude Trainer | AI-generated infinite practice sets with mistake bank |
| Job Finder | Aggregate jobs from LinkedIn, Internshala, Wellfound, Naukri |
| Study Groups | Cohort-based prep with leaderboards |
| Behavioral Coach | STAR framework training with AI feedback |

## Tech Stack

```
Frontend          Backend           AI                Infrastructure
─────────────     ─────────────     ─────────────     ──────────────
Next.js 16        Supabase          Gemini 2.5 Flash  Vercel
React 19          PostgreSQL        OpenAI GPT-5      Supabase Cloud
TypeScript 5      Row Level Sec.    PDF.js            Sentry
Tailwind CSS 4    Auth (GoTrue)     Prompt Routing    
ShadCN/UI         Storage (R2)                        
Tanstack Query    Rate Limiting                        
React Hook Form   Zod Validation                      
```

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      Next.js 16 App                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Dashboard │  │ Roadmap  │  │ Resume   │  │Interview │ │
│  │  Page     │  │  Page    │  │  Page    │  │  Page    │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │              │              │              │       │
│  ┌────┴──────────────┴──────────────┴──────────────┴────┐ │
│  │              API Routes (20 endpoints)               │ │
│  │  Auth │ Profile │ Roadmap │ Resume │ Interview │ App  │ │
│  └──────────────────────┬──────────────────────────────┘ │
└─────────────────────────┼────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    ┌────┴────┐    ┌──────┴──────┐   ┌────┴────┐
    │Supabase │    │  AI Router  │   │ Sentry  │
    │PostgreSQL│   │  ┌────────┐ │   │ Error   │
    │Auth     │    │  │Gemini  │ │   │ Tracking│
    │Storage  │    │  │OpenAI  │ │   │         │
    │RLS      │    │  └────────┘ │   │         │
    └─────────┘    └─────────────┘   └─────────┘
```

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account (free tier works)
- Gemini API key (free tier: 60 req/min)
- OpenAI API key (optional, for interview mode)

### Installation

```bash
# Clone the repo
git clone https://github.com/Shan7Usmani/SaaS.git
cd SaaS

# Install dependencies
cd next-app
npm install

# Set up environment
cp .env.example .env.local
# Fill in your Supabase + AI keys

# Run database migrations
npx supabase db push

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-key

# Optional (for interview mode)
OPENAI_API_KEY=your-openai-key

# Optional (error tracking)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register with email |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/google` | Google OAuth |
| GET | `/api/user/profile` | Get profile |
| PUT | `/api/user/profile` | Update profile |
| POST | `/api/roadmap/generate` | AI generates roadmap |
| GET | `/api/roadmap/[id]` | Get roadmap |
| PATCH | `/api/roadmap/[id]/topic/[topicId]` | Update topic progress |
| POST | `/api/resume/upload` | Upload PDF resume |
| POST | `/api/resume/[id]/analyze` | AI analyzes resume |
| GET | `/api/resume/[id]` | Get resume + score |
| GET | `/api/resumes` | List all resumes |
| POST | `/api/interview/start` | Start mock interview |
| POST | `/api/interview/[id]/answer` | Submit answer |
| GET | `/api/interview/[id]` | Get interview |
| GET | `/api/interviews` | List interviews |
| GET | `/api/applications` | List applications |
| POST | `/api/applications` | Add application |
| PATCH | `/api/applications/[id]` | Update stage |
| DELETE | `/api/applications/[id]` | Remove application |
| GET | `/api/dashboard` | Dashboard stats |

All routes are rate-limited with `X-RateLimit-*` headers.

## Security

- **Row Level Security** on all database tables
- **Signed URLs** for resume storage (1-hour expiry)
- **Rate limiting** on every API endpoint
- **Input validation** via Zod schemas
- **CSRF protection** via SameSite cookies
- **No secrets in client code** — all sensitive operations server-side

## Database Schema

```
profiles          → user identity, college, branch, year, CGPA
roadmaps          → AI-generated plans with target companies
roadmap_topics    → individual topics with completion tracking
resumes           → PDF uploads with AI scores
interviews        → mock interview sessions with feedback
applications      → job application pipeline (Kanban)
feature_flags     → feature gating for free/pro tiers
usage_tracking    → daily AI usage per user (rate limits)
```

## Monetization

| Tier | Price | Features |
|------|-------|----------|
| **Free** | ₹0 | 20 AI chats/day, basic roadmap, 1 resume analysis |
| **Pro** | ₹499/mo | Unlimited roadmap, resume reviews, mock interviews |
| **Premium** | ₹999/mo | Voice interviews, company prep, advanced analytics |

## Performance

- Dashboard loads in <2s on 3G
- AI responses stream in <5s
- PDF parsing completes in <15s
- 0 TypeScript errors
- 20/20 API routes implemented
- 7/7 RLS policies enforced

## Author

**Shan Usmani** — [GitHub](https://github.com/Shan7Usmani) • [LinkedIn](https://linkedin.com/in/shan7usmani) • [Portfolio](https://portfolio-one-gamma-59.vercel.app)

Built as a student who lived through the placement chaos. This is the tool I wish I had.

---

<div align="center">

**If this project helped you, give it a ⭐**

</div>
