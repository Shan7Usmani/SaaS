# PlacementOS — Development Backlog

> **Legend:**  
> 🟢 P0 = MVP (Week 1-4) | 🟡 P1 = Core (Week 5-8) | 🟠 P2 = Growth (Week 9-12) | 🔴 P3 = Scale (Week 13+)  
> Complexity: S (1-2 hrs), M (3-6 hrs), L (1-2 days), XL (3-5 days)

---

## Sprint 1: Foundation (Week 1)

### Project Setup

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| DB-001 | Set up Supabase project, enable PostgreSQL + Auth + Storage | DB | S | 🟢 P0 |
| DB-002 | Create `users` table with profile fields (college, branch, year, cgpa, target_companies, dsa_level, role) | DB | S | 🟢 P0 |
| DB-003 | Enable Row Level Security (RLS) on all tables | DB | M | 🟢 P0 |
| FE-001 | Initialize Next.js 15 with TypeScript, Tailwind, ShadCN | FE | S | 🟢 P0 |
| FE-002 | Set up project folder structure (`/app`, `/components`, `/lib`, `/types`) | FE | S | 🟢 P0 |
| FE-003 | Configure ESLint + Prettier | FE | S | 🟢 P0 |
| FE-004 | Set up environment variables (.env.local template) | FE | S | 🟢 P0 |
| FE-005 | Create base layout with navigation shell (sidebar + topbar) | FE | M | 🟢 P0 |
| AI-001 | Set up Gemini API client with error handling and retry logic | AI | M | 🟢 P0 |
| AI-002 | Set up OpenAI client fallback for interview evaluation | AI | M | 🟢 P0 |

### Authentication

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| FE-006 | Build signup page (email + password, Google OAuth) | FE | M | 🟢 P0 |
| FE-007 | Build login page | FE | M | 🟢 P0 |
| FE-008 | Build password reset flow | FE | M | 🟢 P0 |
| FE-009 | Create auth middleware (redirect unauthenticated users to /login) | FE | S | 🟢 P0 |
| BE-001 | Configure Supabase Auth (email + Google OAuth providers) | BE | S | 🟢 P0 |
| BE-002 | Create auth API routes (signup, login, logout, reset-password) | BE | M | 🟢 P0 |
| BE-003 | Create profile API route (GET/PUT /api/user/profile) | BE | M | 🟢 P0 |

### Onboarding

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| FE-010 | Build multi-step onboarding form (college info → targets → DSA level → role) | FE | L | 🟢 P0 |
| FE-011 | Build progress indicator for onboarding steps | FE | S | 🟢 P0 |
| FE-012 | Create profile completion check (redirect to onboarding if incomplete) | FE | M | 🟢 P0 |
| BE-004 | Store onboarding data in `users` table via PATCH | BE | S | 🟢 P0 |

---

## Sprint 2: Roadmap Generator (Week 2)

### Database

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| DB-004 | Create `roadmaps` table (user_id, target_company, months JSON, generated_at) | DB | S | 🟢 P0 |
| DB-005 | Create `roadmap_topics` table (roadmap_id, month, topic_name, is_completed, completed_at) | DB | S | 🟢 P0 |
| DB-006 | Seed pre-built roadmaps (Amazon SDE-1, Google SWE, TCS Digital, Infosys SES) | DB | M | 🟢 P0 |

### Backend

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| BE-005 | Create POST /api/roadmap/generate (calls AI → stores → returns) | BE | L | 🟢 P0 |
| BE-006 | Implement roadmap prompt (user profile → structured month-by-month plan) | BE | M | 🟢 P0 |
| BE-007 | Create GET /api/roadmap/:id | BE | S | 🟢 P0 |
| BE-008 | Create PATCH /api/roadmap/:id/topic/:topicId (mark complete/incomplete) | BE | S | 🟢 P0 |
| BE-009 | Implement roadmap regeneration rate limiting (3x/day free) | BE | M | 🟢 P0 |
| BE-010 | Create fallback: serve pre-built roadmaps when AI generation fails | BE | M | 🟢 P0 |
| BE-011 | Parse AI response JSON safely with validation | BE | M | 🟢 P0 |

### Frontend

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| FE-013 | Build roadmap timeline view (month-by-month accordion) | FE | L | 🟢 P0 |
| FE-014 | Build topic completion toggle with animation | FE | M | 🟢 P0 |
| FE-015 | Build "Regenerate Roadmap" button with confirmation dialog | FE | M | 🟢 P0 |
| FE-016 | Show roadmap loading skeleton during AI generation | FE | S | 🟢 P0 |
| FE-017 | Show roadmap completion percentage at top | FE | S | 🟢 P0 |
| FE-018 | Handle AI failure state — show fallback roadmap option | FE | M | 🟢 P0 |

### AI

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| AI-003 | Design and iterate on roadmap generation prompt (profile → structured JSON) | AI | L | 🟢 P0 |
| AI-004 | Add guardrails against hallucinated topics unrelated to placement prep | AI | M | 🟢 P0 |
| AI-005 | Implement response validation (ensure JSON output matches schema) | AI | M | 🟢 P0 |

---

## Sprint 3: Resume Analyzer (Week 3)

### Database

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| DB-007 | Create `resumes` table (user_id, pdf_url, score JSON, suggestions JSON, created_at) | DB | S | 🟢 P0 |
| DB-008 | Set up Supabase Storage bucket `resumes` with RLS (user can only see own) | DB | M | 🟢 P0 |

### Backend

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| BE-012 | Create POST /api/resume/upload (validate PDF → store in Supabase Storage → parse) | BE | L | 🟢 P0 |
| BE-013 | Implement PDF text extraction (pdfjs) | BE | M | 🟢 P0 |
| BE-014 | Create POST /api/resume/analyze (send text to AI → store score + suggestions) | BE | L | 🟢 P0 |
| BE-015 | Create GET /api/resume/:id (return score + suggestions) | BE | S | 🟢 P0 |
| BE-016 | Validate PDF size (<5MB), type (application/pdf), and text content | BE | M | 🟢 P0 |
| BE-017 | Generate signed URL for PDF access (expires in 1 hour) | BE | M | 🟢 P0 |

### Frontend

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| FE-019 | Build drag-and-drop PDF upload component | FE | M | 🟢 P0 |
| FE-020 | Build file validation UI (show error if not PDF or >5MB) | FE | S | 🟢 P0 |
| FE-021 | Build upload progress indicator | FE | S | 🟢 P0 |
| FE-022 | Build results display: radar chart for 4 dimensions, score circle | FE | M | 🟢 P0 |
| FE-023 | Build improvement suggestions list (bullet points with categories) | FE | M | 🟢 P0 |
| FE-024 | Build "Analyze Again" button (upload new version) | FE | S | 🟢 P0 |
| FE-025 | Handle empty/insufficient text extracted error state | FE | S | 🟢 P0 |

### AI

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| AI-006 | Design resume analysis prompt (structured output: ats_score, keyword_score, project_score, skills_score, suggestions[]) | AI | L | 🟢 P0 |
| AI-007 | Add resume-specific guardrails (don't hallucinate skills on resume, only analyze what's there) | AI | M | 🟢 P0 |

---

## Sprint 4: Mock Interview + App Tracker + Dashboard (Week 4)

### Database

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| DB-009 | Create `interviews` table (user_id, type, questions JSON, scores JSON, total_score, answers JSON, created_at) | DB | S | 🟢 P0 |
| DB-010 | Create `applications` table (user_id, company, role, stage, notes, applied_at, updated_at) | DB | S | 🟢 P0 |

### Backend — Mock Interview

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| BE-018 | Create POST /api/interview/start (generate 5 questions via AI → store session) | BE | L | 🟢 P0 |
| BE-019 | Create POST /api/interview/:id/answer (submit answer → AI evaluates → store score) | BE | L | 🟢 P0 |
| BE-020 | Create GET /api/interview/:id (return session with questions + scores) | BE | S | 🟢 P0 |
| BE-021 | Create GET /api/interviews (list user's interview history) | BE | S | 🟢 P0 |
| BE-022 | Implement timer logic (60s per question, auto-submit "No answer") | BE | M | 🟢 P0 |
| BE-023 | Handle network drops — allow resume from last unanswered question | BE | M | 🟢 P0 |

### Backend — Application Tracker

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| BE-024 | Create POST /api/applications (add application) | BE | S | 🟢 P0 |
| BE-025 | Create GET /api/applications (list with stage filter) | BE | S | 🟢 P0 |
| BE-026 | Create PATCH /api/applications/:id (update stage, notes) | BE | S | 🟢 P0 |

### Backend — Dashboard

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| BE-027 | Create GET /api/dashboard (aggregate scores: roadmap %, resume score, interview avg, application stats) | BE | M | 🟢 P0 |
| BE-028 | Calculate overall Placement Score from weighted sub-scores | BE | M | 🟢 P0 |

### Frontend — Mock Interview

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| FE-026 | Build interview start screen (select type: technical, set question count) | FE | M | 🟢 P0 |
| FE-027 | Build question screen: question card, answer textarea, visible timer, submit button | FE | M | 🟢 P0 |
| FE-028 | Build auto-submit when timer expires with "Time's up!" state | FE | M | 🟢 P0 |
| FE-029 | Build answer feedback card (score, AI evaluation, suggested answer) | FE | M | 🟢 P0 |
| FE-030 | Build interview summary screen (per-question scores, total, pass/fail) | FE | M | 🟢 P0 |
| FE-031 | Build interview history list | FE | S | 🟢 P0 |
| FE-032 | Handle empty state: "No interviews yet. Start your first mock interview!" | FE | S | 🟢 P0 |

### Frontend — Application Tracker

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| FE-033 | Build "Add Application" form (company, role, stage selector) | FE | M | 🟢 P0 |
| FE-034 | Build application list view with stage badges and counts | FE | M | 🟢 P0 |
| FE-035 | Build stage update dropdown (move application between stages) | FE | M | 🟢 P0 |
| FE-036 | Build empty state: "No applications yet. Start applying!" | FE | S | 🟢 P0 |

### Frontend — Dashboard

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| FE-037 | Build Placement Score card (large circle with score, sub-scores below) | FE | M | 🟢 P0 |
| FE-038 | Build score progress bars for each sub-score (DSA, Resume, Interview, Aptitude, Communication) | FE | M | 🟢 P0 |
| FE-039 | Build target score section with "gap to target" indicator | FE | M | 🟢 P0 |
| FE-040 | Build quick-action cards linking to each module | FE | S | 🟢 P0 |
| FE-041 | Handle partial data state (show "Not yet assessed" for missing sub-scores) | FE | M | 🟢 P0 |
| FE-042 | Build daily tip component | FE | S | 🟢 P0 |

---

## Sprint 5: DSA Tracker (Week 5-6) — P1

### Database

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| DB-011 | Create `dsa_accounts` table (user_id, platform, username, last_synced_at) | DB | S | 🟡 P1 |
| DB-012 | Create `synced_questions` table (user_id, platform, question_id, title, difficulty, topic, solved_at) | DB | M | 🟡 P1 |
| DB-013 | Create `topic_mastery` table (user_id, topic, solved_count, status [strong/average/weak]) | DB | M | 🟡 P1 |

### Backend

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| BE-029 | Create POST /api/dsa/connect (verify username on platform, store connection) | BE | M | 🟡 P1 |
| BE-030 | Implement LeetCode scraper (public profile: total solved, difficulty, topic tags) | BE | XL | 🟡 P1 |
| BE-031 | Implement GFG scraper | BE | XL | 🟡 P1 |
| BE-032 | Implement HackerRank scraper | BE | XL | 🟡 P1 |
| BE-033 | Create POST /api/dsa/sync (fetch latest data from all connected platforms) | BE | L | 🟡 P1 |
| BE-034 | Implement question deduplication across platforms | BE | M | 🟡 P1 |
| BE-035 | Implement streak calculation | BE | M | 🟡 P1 |
| BE-036 | Create GET /api/dsa/analytics (topic breakdown, difficulty distribution, recommendations) | BE | L | 🟡 P1 |
| BE-037 | Implement scheduled sync (cron job every 6 hours) | BE | M | 🟡 P1 |

### Frontend

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| FE-043 | Build "Connect Platform" page with 3 platform cards | FE | M | 🟡 P1 |
| FE-044 | Build connection status indicators (connected, last synced, sync now button) | FE | M | 🟡 P1 |
| FE-045 | Build DSA analytics dashboard: total solved, streak, difficulty pie chart, topic bar chart | FE | L | 🟡 P1 |
| FE-046 | Build AI recommendations section with topic-specific CTAs | FE | M | 🟡 P1 |
| FE-047 | Build weekly goal setter + progress bar | FE | M | 🟡 P1 |

### AI

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| AI-008 | Design DSA analysis prompt (topic data → strong/average/weak + recommendations) | AI | M | 🟡 P1 |

---

## Sprint 6: AI Coding Mentor (Week 6-7) — P1

### Database

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| DB-014 | Create `code_reviews` table (user_id, code, language, analysis JSON, created_at) | DB | S | 🟡 P1 |

### Backend

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| BE-038 | Create POST /api/code/review (accept code → AI analysis → store → return) | BE | L | 🟡 P1 |
| BE-039 | Implement language auto-detection from code | BE | M | 🟡 P1 |
| BE-040 | Create POST /api/code/:id/follow-up (chat context on same code) | BE | M | 🟡 P1 |
| BE-041 | Implement input validation (max 500 lines, block empty/trivial content) | BE | M | 🟡 P1 |

### Frontend

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| FE-048 | Build code editor with syntax highlighting (Monaco or CodeMirror) | FE | L | 🟡 P1 |
| FE-049 | Build analysis results panel: complexity badges, explanation, optimized code | FE | L | 🟡 P1 |
| FE-050 | Build follow-up chat on top of analysis | FE | M | 🟡 P1 |
| FE-051 | Build review history list | FE | S | 🟡 P1 |

### AI

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| AI-009 | Design code review prompt (time complexity, space complexity, optimization, edge cases) | AI | L | 🟡 P1 |
| AI-010 | Add safety checks — block execution or deployment suggestions | AI | M | 🟡 P1 |

---

## Sprint 7: Project Builder + Company Prep (Week 8-9) — P2

### Backend

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| BE-042 | Create POST /api/projects/generate (user input → AI → architecture + schema + API + deploy) | BE | L | 🟠 P2 |
| BE-043 | Create POST /api/projects/export (generate PDF/Markdown) | BE | M | 🟠 P2 |
| BE-044 | Create GET /api/companies/:slug (return company prep data) | BE | M | 🟠 P2 |
| BE-045 | Seed company database (Amazon, Google, Microsoft, TCS, Infosys, etc.) | BE | L | 🟠 P2 |
| BE-046 | Create POST /api/companies/:slug/experiences (submit interview experience) | BE | M | 🟠 P2 |

### Frontend

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| FE-052 | Build project generator input screen (domain, tech stack, difficulty) | FE | M | 🟠 P2 |
| FE-053 | Build output display: tabs for architecture, DB schema, API, deploy | FE | L | 🟠 P2 |
| FE-054 | Build export button (PDF/Markdown) | FE | S | 🟠 P2 |
| FE-055 | Build company prep page with tabs (pattern, topics, experiences) | FE | L | 🟠 P2 |
| FE-056 | Build interview experience submission form | FE | M | 🟠 P2 |

---

## Sprint 8: Aptitude + Behavioral Coach (Week 10-11) — P2

### Backend

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| BE-047 | Create POST /api/aptitude/generate (topic + difficulty → AI generates 10 questions) | BE | L | 🟠 P2 |
| BE-048 | Create POST /api/aptitude/submit (answers → evaluate → store accuracy) | BE | M | 🟠 P2 |
| BE-049 | Create GET /api/aptitude/mistakes (review incorrect answers with explanations) | BE | S | 🟠 P2 |
| BE-050 | Create POST /api/behavioral/practice (AI asks HR question → evaluate response) | BE | M | 🟠 P2 |

### Frontend

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| FE-057 | Build aptitude topic selector + difficulty slider | FE | M | 🟠 P2 |
| FE-058 | Build quiz interface (question, 4 options, timer, next) | FE | M | 🟠 P2 |
| FE-059 | Build results screen with accuracy + mistake bank | FE | M | 🟠 P2 |
| FE-060 | Build behavioral coach interface (question → answer → feedback) | FE | M | 🟠 P2 |

---

## Sprint 9: Job Finder + Application Tracker (Kanban) (Week 12-13) — P3

### Backend

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| BE-051 | Implement LinkedIn job scraper (RSS/API) | BE | XL | 🔴 P3 |
| BE-052 | Implement Internshala job scraper | BE | XL | 🔴 P3 |
| BE-053 | Implement Wellfound job scraper | BE | XL | 🔴 P3 |
| BE-054 | Implement Naukri job scraper | BE | XL | 🔴 P3 |
| BE-055 | Create job deduplication service | BE | L | 🔴 P3 |
| BE-056 | Create POST /api/jobs/match (profile → ranked job matches) | BE | M | 🔴 P3 |
| BE-057 | Upgrade PATCH /api/applications/:id to support kanban order | BE | M | 🔴 P3 |

### Frontend

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| FE-061 | Build job listings page with filters and match scores | FE | L | 🔴 P3 |
| FE-062 | Build job detail modal (description, apply link, save button) | FE | M | 🔴 P3 |
| FE-063 | Upgrade application list to Kanban board (drag-and-drop) | FE | XL | 🔴 P3 |
| FE-064 | Build application stats dashboard (conversion funnel) | FE | M | 🔴 P3 |

---

## Sprint 10: Study Groups + Analytics (Week 14+) — P3

### Database

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| DB-015 | Create `study_groups` table (name, target_company, created_by, max_members) | DB | S | 🔴 P3 |
| DB-016 | Create `group_members` table (group_id, user_id, role) | DB | S | 🔴 P3 |
| DB-017 | Create `study_sessions` table (user_id, duration_minutes, date, notes) | DB | S | 🔴 P3 |

### Backend

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| BE-058 | Create CRUD for study groups (create, join, leave, list) | BE | L | 🔴 P3 |
| BE-059 | Implement group chat (Supabase Realtime) | BE | L | 🔴 P3 |
| BE-060 | Create POST /api/analytics/study-log (log study session) | BE | S | 🔴 P3 |
| BE-061 | Create GET /api/analytics/dashboard (all graphs data) | BE | L | 🔴 P3 |

### Frontend

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| FE-065 | Build study groups browse/join/create pages | FE | L | 🔴 P3 |
| FE-066 | Build group dashboard (members, progress, leaderboard) | FE | L | 🔴 P3 |
| FE-067 | Build analytics dashboard with charts (Chart.js or Recharts) | FE | L | 🔴 P3 |
| FE-068 | Build study timer/logger component | FE | M | 🔴 P3 |

---

## Sprint 11: Monetization (Week 15-16) — P3

### Backend

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| BE-062 | Integrate Stripe/Razorpay payment gateway | BE | L | 🔴 P3 |
| BE-063 | Create subscription tiers (Free, Pro ₹499, Premium ₹999) | BE | M | 🔴 P3 |
| BE-064 | Implement usage tracking (AI chats/day, roadmap regens) | BE | M | 🔴 P3 |
| BE-065 | Create middleware to enforce rate limits per tier | BE | M | 🔴 P3 |
| BE-066 | Create webhook handler for subscription events (renewal, cancellation, failed payment) | BE | L | 🔴 P3 |

### Frontend

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| FE-069 | Build pricing page with feature comparison | FE | M | 🔴 P3 |
| FE-070 | Build subscription management page (current plan, usage, upgrade/downgrade) | FE | M | 🔴 P3 |
| FE-071 | Build upgrade prompts at paywall points with usage bars | FE | M | 🔴 P3 |

---

## Non-Functional / Cross-Cutting Tasks

| ID | Task | Area | Complexity | Priority |
|----|------|------|------------|----------|
| OPS-001 | Set up Vercel project with custom domain | Ops | S | 🟢 P0 |
| OPS-002 | Set up Supabase production project | Ops | S | 🟢 P0 |
| OPS-003 | Configure Cloudflare R2 bucket with signed URLs | Ops | M | 🟢 P0 |
| OPS-004 | Set up error monitoring (Sentry free tier) | Ops | M | 🟢 P0 |
| OPS-005 | Set up analytics (PostHog self-hosted or Plausible) | Ops | M | 🟡 P1 |
| OPS-006 | Configure CI/CD (GitHub Actions → Vercel) | Ops | M | 🟢 P0 |
| OPS-007 | Implement rate limiting across all API routes | Ops | M | 🟢 P0 |
| OPS-008 | Write API documentation (Postman/ReadMe) | Docs | M | 🟡 P1 |
| OPS-009 | Set up automated DB backups | Ops | S | 🟢 P0 |
| OPS-010 | Load test with k6 (target: 500 concurrent users) | Ops | L | 🟡 P1 |

---

## Summary

| Sprint | Focus | Tasks | Points |
|--------|-------|-------|--------|
| Week 1 | Foundation + Auth + Onboarding | 16 | ~30 |
| Week 2 | Roadmap Generator | 12 | ~24 |
| Week 3 | Resume Analyzer | 10 | ~20 |
| Week 4 | Mock Interview + App Tracker + Dashboard | 18 | ~30 |
| Week 5-6 | DSA Tracker | 12 | ~36 |
| Week 6-7 | AI Coding Mentor | 9 | ~24 |
| Week 8-9 | Project Builder + Company Prep | 9 | ~28 |
| Week 10-11 | Aptitude + Behavioral Coach | 8 | ~22 |
| Week 12-13 | Job Finder + Kanban | 9 | ~36 |
| Week 14+ | Study Groups + Analytics + Monetization | 14 | ~36 |
| Cross-cutting | Ops, monitoring, CI/CD | 10 | ~16 |

**Total: ~127 tasks, ~300 story points**

## Effort Estimate (Solo Founder)

| Phase | Weeks | Hours/week | Total hours |
|-------|-------|------------|-------------|
| P0 (MVP) | 4 | 50-60 | 200-240 |
| P1 (Core) | 4 | 40-50 | 160-200 |
| P2 (Growth) | 4 | 30-40 | 120-160 |
| P3 (Scale) | 8+ | 20-30 | 160-240 |

**MVP to market: ~4 weeks at ~55 hrs/week**  
**Full platform: ~20 weeks at ~35 hrs/week avg**
