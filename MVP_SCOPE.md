# PlacementOS — MVP Scope

## Objective

Launch a functional product in 4 weeks that delivers enough value for a student to:
1. Create a personalized roadmap
2. Get their resume scored
3. Practice mock interviews
4. Track their placement journey

Everything beyond this is a retention or monetization feature — not needed for launch.

## In Scope (P0 — Must Have)

### Authentication & Onboarding
- Email + password signup/login
- Google OAuth
- Onboarding questionnaire (college, branch, year, CGPA, target companies, DSA level, role)
- Profile editing after onboarding
- Password reset

### Module 2: AI Roadmap Generator (Simplified)
- Onboarding → AI generates a month-by-month roadmap
- Topics organized by month
- Manual "Mark as Complete" toggle per topic
- Roadmap regeneration (3x/day free, unlimited Pro)
- Pre-built roadmaps as fallback (Amazon SDE-1, Google SWE, TCS Digital, Infosys SES)

### Module 5: Resume Analyzer (Simplified)
- PDF upload (max 5MB)
- Text extraction + AI analysis
- Score: 0-100 across 4 dimensions (ATS, Keywords, Projects, Skills)
- Bullet-point improvement suggestions
- Score display only (no history graph in MVP)

### Module 7: Mock Interview System (Simplified)
- Technical mode only (no HR round in MVP)
- 5-question session (DSA/CS fundamentals)
- Type answers, AI evaluates and scores
- Timer: 60s per question
- Score at end with per-question feedback

### Module 12: Application Tracker (Basic)
- Manual add application (company, role, date applied)
- 4 stages: Applied → OA Received → Interview → Offer
- Simple list view (not kanban in MVP)
- Total counts per stage

### Module 1: Dashboard (Basic)
- Aggregate score from available data
- Show sub-scores that have data
- "Complete your profile" prompts for missing data
- Link to each module

## Out of Scope (P1 — Week 8+)

### Deferred from MVP
- DSA Tracker (Module 3) — platform connection scraping is complex, needs more time
- AI Coding Mentor (Module 4) — requires code execution sandbox for safety
- Project Builder (Module 6) — multi-turn agent, heavy AI cost
- HR Mock Interviews — voice/video is post-MVP
- Company-Specific Prep (Module 8) — requires content curation
- Aptitude Generator (Module 9) — math problem generation is unreliable with current AI
- Behavioral Coach (Module 10) — requires prompt engineering finesse
- Job Finder (Module 11) — scraping 4 portals is legally gray and maintenance-heavy
- Study Groups (Module 13) — realtime and moderation overhead
- Placement Analytics (Module 14) — requires data accumulation before it's useful

### Cut Entirely for V1
- Voice/video interviews
- System design interview prep
- Open-source model support (use APIs only)
- RAG with Pinecone (add post-launch)
- Mobile app (responsive web only)
- College ambassador dashboard
- Admin panel (manual DB management is fine)

## Feature Flags for Gradual Rollout

```
ONBOARDING: enabled
ROADMAP_GENERATOR: enabled (simplified)
RESUME_ANALYZER: enabled (simplified)
MOCK_INTERVIEW: enabled (tech only)
APP_TRACKER: enabled (basic)
DASHBOARD: enabled (basic)
DSA_TRACKER: disabled
CODING_MENTOR: disabled
PROJECT_BUILDER: disabled
COMPANY_PREP: disabled
APTITUDE: disabled
BEHAVIORAL_COACH: disabled
JOB_FINDER: disabled
STUDY_GROUPS: disabled
ANALYTICS: disabled
```

## MVP Architecture Decisions

### Database (Supabase PostgreSQL)

**Tables needed for MVP:**
- `users` — auth + profile
- `roadmaps` — user_id, target_company, months (JSON), created_at
- `roadmap_topics` — roadmap_id, topic, month, is_completed
- `resumes` — user_id, score (JSON), suggestions (JSON), pdf_url, created_at
- `interviews` — user_id, type, questions (JSON), scores (JSON), total_score, created_at
- `applications` — user_id, company, role, stage, notes, created_at

**Not needed for MVP:**
- `dsa_accounts` — deferred
- `questions_synced` — deferred
- `study_groups` — deferred
- `group_members` — deferred

### AI Usage in MVP

| Feature | Model | Cost per call | Daily volume (est.) |
|---------|-------|---------------|---------------------|
| Roadmap generation | Gemini 2.5 Flash | ~$0.01 | 200 → $2/day |
| Resume analysis | Gemini 2.5 Flash | ~$0.03 | 100 → $3/day |
| Mock interview eval | GPT-4o mini | ~$0.02 | 500 → $10/day |
| **Total** | | | **~$15/day → $450/month** |

At $499/month Pro (100 users) + $0 ads, MVP is cash-flow positive at 1 Pro user.

### API Endpoints (Next.js App Router)

```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/google
GET    /api/user/profile
PUT    /api/user/profile

POST   /api/roadmap/generate
GET    /api/roadmap/:id
PATCH  /api/roadmap/:id/topic/:topicId

POST   /api/resume/upload
GET    /api/resume/:id
GET    /api/resume/:id/score

POST   /api/interview/start
POST   /api/interview/:id/answer
GET    /api/interview/:id
GET    /api/interviews

POST   /api/applications
GET    /api/applications
PATCH  /api/applications/:id

GET    /api/dashboard
```

## MVP Design Constraints

- Mobile-first responsive (80% of students use phones)
- No animated loaders — use skeleton screens
- No dark mode in MVP (add post-launch)
- All text in English (Hindi/i18n is P2)
- All AI interactions show typing indicator with "Analyzing..." text
- Error states must have a CTA button (never a dead end)

## Success Criteria for Exiting MVP

1. 200 registered users (organic, no paid acquisition)
2. 40 active users (DAU) by week 4
3. 100 roadmaps generated
4. 50 resumes analyzed
5. 200 mock interviews completed
6. Free → Pro: at least 3 conversions
7. NPS survey sent to first 100 users
8. System handles 500 concurrent users without degradation

If these are met, proceed to P1. If not, iterate on MVP before building more features.
