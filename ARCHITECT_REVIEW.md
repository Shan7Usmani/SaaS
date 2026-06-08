# Architecture Review — PlacementOS

> **Date:** 2026-06-09  
> **Scope:** Design documents vs. `next-app/` implementation  
> **Files reviewed:** 114 source files (9,333+ lines)

---

## 1. DATABASE_SCHEMA.md vs Implementation

### 1.1 Table Name Deviation

| Design | Implementation | Severity | Impact |
|--------|---------------|----------|--------|
| `users` | `profiles` | Medium | All FK references, API code, and types use `profiles` instead of `users`. `profiles` is actually better (avoids collision with `auth.users` in Supabase), but the design doc should be updated. |

### 1.2 Column Deviations — `profiles` (was `users`)

| Design Column | Implementation | Status |
|-------------|---------------|--------|
| `full_name` | `name` | Minor rename |
| `auth_provider` | Missing | Not stored (inferred from Supabase Auth metadata) |
| `auth_id` | Missing | Not stored (Supabase Auth handles internally) |
| `updated_at` trigger | Implemented | ✓ |
| `handle_new_user()` trigger | Implemented | ✓ (bonus — auto-creates profile on signup) |

### 1.3 Column Deviations — `roadmaps`

| Design | Implementation | Status |
|--------|---------------|--------|
| No `target_role` | Has `target_role` | Extra column (benign addition) |
| `updated_at` trigger | Implemented | ✓ |

### 1.4 Column Deviations — `resumes`

| Design | Implementation | Status |
|--------|---------------|--------|
| No `status` column | Has `status` (`uploaded`/`analyzing`/`completed`/`failed`) | Good addition — enables async analysis flow |

### 1.5 Column Deviations — `interviews`

| Design | Implementation | Status |
|--------|---------------|--------|
| `timer_per_question` SMALLINT | ✓ Matches | — |
| `created_at` index | `interviews_created_at_idx` | ✓ |

### 1.6 Column Deviations — `applications`

| Design | Implementation | Status |
|--------|---------------|--------|
| Stage `'oa_received'` | Stage `'oa'` | Minor rename. Frontend label still says "OA Received". Inconsistent. |
| `updated_at` trigger | Implemented | ✓ |

### 1.7 Missing Indexes

| Index | Status |
|-------|--------|
| `profiles_auth_id_idx` | Not applicable (auth_id column doesn't exist) |
| `profiles_tier_idx` | Implemented (bonus) |

### 1.8 Missing Tables (Deferred per MVP Scope — Correct)

| Table | Sprint | Status |
|-------|--------|--------|
| `dsa_accounts` | P1 | Not created ✓ (correctly deferred) |
| `synced_questions` | P1 | Not created ✓ |
| `code_reviews` | P1 | Not created ✓ |
| `subscriptions` | P3 | Not created ✓ |
| `study_groups` | P3 | Not created ✓ |
| `group_members` | P3 | Not created ✓ |
| `study_sessions` | P3 | Not created ✓ |

### 1.9 RLS Policy Status

| Policy | Design | Implementation | Status |
|--------|--------|---------------|--------|
| `profiles` — user reads own | ✓ | ✓ | ✓ |
| `profiles` — user inserts own | ✓ | ✓ | ✓ |
| `profiles` — user updates own | ✓ | ✓ | ✓ |
| `roadmaps` — user manages own | ✓ | ✓ | ✓ |
| `roadmap_topics` — via JOIN check | ✓ | ✓ | ✓ |
| `resumes` — user manages own | ✓ | ✓ | ✓ |
| `interviews` — user manages own | ✓ | ✓ | ✓ |
| `applications` — user manages own | ✓ | ✓ | ✓ |
| `feature_flags` — public read | ✓ | ✓ | ✓ |
| **Storage `resumes/` — user folder isolation** | ✓ | **NOT IMPLEMENTED** | ❌ |

### 1.10 Migration Naming

| Design | Implementation | Status |
|--------|---------------|--------|
| `YYYYMMDDHHMMSS_description.sql` | Follows same convention | ✓ |
| Migration order (1-7) | Same | ✓ |

### Findings

| # | Finding | Severity |
|---|---------|----------|
| DB-01 | `profiles` table name differs from design `users` — design doc is stale | Medium |
| DB-02 | `auth_provider` and `auth_id` columns dropped from profiles — Supabase Auth handles this, acceptable but undocumented deviation | Low |
| DB-03 | Application stage `'oa'` vs design's `'oa_received'` — frontend label says "OA Received" while DB stores `'oa'` | Low |
| DB-04 | **Storage bucket RLS not implemented** — resume files in Supabase Storage have no RLS policies enforcing user isolation | **High** |
| DB-05 | `full_name` implemented as `name` — minor, but all API code and types use `name` | Low |

---

## 2. API_SPEC.md vs Implementation

### 2.1 Endpoint Coverage

| Endpoint | Design | Implementation | Status |
|----------|--------|---------------|--------|
| `POST /api/auth/signup` | ✓ | ✓ | ✓ |
| `POST /api/auth/login` | ✓ | ✓ | ✓ |
| `POST /api/auth/logout` | ✓ | ✓ | ✓ |
| `POST /api/auth/reset-password` | ✓ | ✓ | ✓ |
| `POST /api/auth/google` | ✓ | ✓ | ✓ |
| `GET /api/user/profile` | ✓ | ✓ | ✓ |
| `PUT /api/user/profile` | ✓ | ✓ | ✓ |
| `GET /api/user/export` | ✓ | **NOT IMPLEMENTED** | ❌ |
| `DELETE /api/user/account` | ✓ | **NOT IMPLEMENTED** | ❌ |
| `POST /api/roadmap/generate` | ✓ | ✓ | ✓ |
| `GET /api/roadmap/:id` | ✓ | ✓ | ✓ |
| `PATCH /api/roadmap/:id/topic/:topicId` | ✓ | ✓ | ✓ |
| `POST /api/resume/upload` | ✓ | ✓ | ✓ |
| `GET /api/resume/:id` | ✓ | ✓ | ✓ |
| `POST /api/resume/:id/analyze` | Not in spec | ✓ | Bonus endpoint |
| `GET /api/resumes` | ✓ as `GET /api/resumes` | ✓ as `GET /api/resume` | Minor path diff |
| `POST /api/interview/start` | ✓ | ✓ | ✓ |
| `GET /api/interview/:id` | ✓ | ✓ | ✓ |
| `POST /api/interview/:id/answer` | ✓ | ✓ | ✓ |
| `GET /api/interviews` | ✓ as `GET /api/interviews` | ✓ as `GET /api/interview` | Minor path diff |
| `GET /api/applications` | ✓ | ✓ | ✓ |
| `POST /api/applications` | ✓ | ✓ | ✓ |
| `PATCH /api/applications/:id` | ✓ | ✓ | ✓ |
| `DELETE /api/applications/:id` | Not in spec | ✓ | Bonus endpoint |
| `GET /api/dashboard` | ✓ | ✓ | ✓ |
| `GET /api/health` | Not in spec | ✓ | Bonus endpoint |

### 2.2 Response Shape Deviations

| Endpoint | Field | Design | Implementation | Status |
|----------|-------|--------|---------------|--------|
| `POST /api/interview/start` | `questions` | Returns all 5 questions | Returns only the first question; rest returned one-at-a-time via subsequent calls | Minor |
| `GET /api/dashboard` | `communication` sub-score | Present | Set to `null` (not implemented yet) | Expected |
| `GET /api/dashboard` | `aptitude` sub-score | Present | Set to `null` (not implemented yet) | Expected |
| `GET /api/resume/:id` | Status `425` when analyzing | Returns `425 ANALYZING` | Implemented correctly | ✓ |
| `POST /api/applications` | `applied_at` | Design says `date` type | Implementation accepts `string` and converts | Minor |

### 2.3 Rate Limiting — NOT Enforced on API Routes

| Design Requirement | Implementation | Status |
|--------------------|---------------|--------|
| Rate limit headers on all responses (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`) | **Not returned on any response** | ❌ |
| Rate limiting on auth endpoints (5 req/min per IP) | **Not implemented** | ❌ |
| Rate limiting on dashboard (30 req/min) | **Not implemented** | ❌ |
| AI rate limiting per user/day | **Implemented** (via `lib/ai/rate-limiter.ts`) | ✓ |
| Generic rate limiter exists (`lib/utils/rate-limit.ts`) | **Exists but never called** from any route handler | ❌ |

### 2.4 Zod Schema Deviations

| Schema | Design | Implementation | Status |
|--------|--------|---------------|--------|
| Signup password min | 8 chars | 8 chars (signup), 6 chars (login schema in schemas/auth.ts) | Inconsistent |
| Password complexity | uppercase + lowercase + number | **Not validated** | ❌ |
| `preferred_role` enum | `'swe'`, `'data_analyst'`, `'ai_engineer'`, `'web_dev'` | `'swe'`, `'data'`, `'ai'`, `'web'` in types; `'swe', 'data_analyst', 'ai_engineer', 'web_dev'` in API route | Inconsistent between types and API |

### 2.5 Findings

| # | Finding | Severity |
|---|---------|----------|
| API-01 | `GET /api/user/export` not implemented — user data export right unfulfilled | Medium |
| API-02 | `DELETE /api/user/account` not implemented — account deletion right unfulfilled | Medium |
| API-03 | Rate limiting not enforced on any non-AI route — generic rate limiter exists but unused | **High** |
| API-04 | Password complexity validation missing — only min length checked | Medium |
| API-05 | `preferred_role` enum values inconsistent between types and API route validation | Low |
| API-06 | Application stage `'oa'` in API doesn't match design's `'oa_received'` | Low |

---

## 3. FOLDER_STRUCTURE.md vs Implementation

### 3.1 Structural Deviations

| Design Path | Implementation Path | Status |
|-------------|-------------------|--------|
| `src/app/` | `app/` | Flat structure (no `src/` dir) |
| `src/components/auth/` | **Not created** — auth logic in page files directly | ❌ |
| `src/components/onboarding/` | **Not created** — onboarding is a single page | ❌ |
| `src/components/dashboard/` | **Not created** — dashboard components inline in page | ❌ |
| `src/hooks/use-auth.ts` (full) | `hooks/use-auth.ts` (1-line re-export from provider) | Thin |
| `src/hooks/use-roadmap.ts` | **Not created** | ❌ |
| `src/hooks/use-resume.ts` | **Not created** | ❌ |
| `src/hooks/use-interview.ts` | **Not created** | ❌ |
| `src/hooks/use-applications.ts` | **Not created** | ❌ |
| `src/hooks/use-dashboard.ts` | **Not created** | ❌ |
| `src/hooks/use-feature-flag.ts` | **Not created** | ❌ |
| `src/hooks/use-timer.ts` | **Not created** | ❌ |
| `src/stores/auth-store.ts` | **Not created** | ❌ |
| `src/stores/interview-store.ts` | **Not created** | ❌ |
| `src/stores/ui-store.ts` | **Not created** | ❌ |
| `src/lib/validators/` (per-feature files) | `schemas/auth.ts`, `schemas/profile.ts`, `lib/validators/index.ts` | Consolidated |
| `src/lib/ai/prompts/resume.ts` | **Not created** | ❌ |
| `src/lib/ai/prompts/interview.ts` | **Not created** | ❌ |
| `src/lib/ai/prompts/dsa-analysis.ts` | **Not created** | ❌ |
| `src/lib/ai/prompts/code-review.ts` | **Not created** | ❌ |
| `src/lib/dsa/leetcode.ts` | **Not created** (P1) | Correctly deferred |
| `src/lib/dsa/geeksforgeeks.ts` | **Not created** (P1) | Correctly deferred |
| `src/lib/dsa/hackerrank.ts` | **Not created** (P1) | Correctly deferred |
| `src/lib/constants/companies.ts` | **Not created** | ❌ |
| `src/lib/constants/topics.ts` | **Not created** | ❌ |
| `src/lib/constants/feature-flags.ts` | **Not created** | ❌ |
| `.github/workflows/ci.yml` | **Not created** | ❌ |
| `.github/workflows/deploy.yml` | **Not created** | ❌ |

### 3.2 Extra Files Not in Design

| File | Purpose | Value |
|------|---------|-------|
| `proxy.ts` | Next.js 16 middleware replacement | Required |
| `providers/auth-provider.tsx` | Auth context provider | Required |
| `providers/query-provider.tsx` | React Query setup | Required |
| `components/theme-provider.tsx` | Theme support (dark/light/system) | Required |
| `components/layout/mobile-bottom-nav.tsx` | Mobile bottom navigation | Required |
| `components/features/ai/loading-states.tsx` | AI loading/error/recommendation components | Required |
| `components/features/ai/score-display.tsx` | Animated score circle component | Required |
| `components/features/interview/interview-setup.tsx` | Interview mode selection | Required |
| `components/features/interview/interview-session.tsx` | Active interview UI | Required |
| `components/features/interview/interview-summary.tsx` | Interview results | Required |
| `components/features/resume/resume-uploader.tsx` | PDF upload drag-and-drop | Required |
| `components/features/resume/resume-results.tsx` | Resume analysis display | Required |
| `components/features/roadmap/roadmap-header.tsx` | Roadmap progress header | Required |
| `components/features/roadmap/month-accordion.tsx` | Month-by-month topic list | Required |
| `lib/logger/index.ts` | Structured logging | Required |
| `lib/r2/client.ts` + `index.ts` | Cloudflare R2 client | Required |
| `lib/pdf/extractor.ts` | PDF text extraction | Required |
| `instrumentation.ts` | Sentry instrumentation | Required |
| `sentry.*.config.ts` | Sentry configuration | Required |
| `vercel.json` | Vercel deployment config | Required |

### 3.3 Component Library Deviations

| Design | Implementation | Status |
|--------|---------------|--------|
| `components/ui/button.tsx` | ✓ | ✓ |
| `components/ui/card.tsx` | ✓ | ✓ |
| `components/ui/input.tsx` | ✓ | ✓ |
| `components/ui/dialog.tsx` | ✓ | ✓ |
| `components/ui/toast.tsx` | `sonner.tsx` instead (Sonner toast library) | Equivalent |
| `components/ui/progress.tsx` | ✓ | ✓ |
| `components/ui/badge.tsx` | ✓ | ✓ |
| `components/ui/tabs.tsx` | ✓ | ✓ |
| `components/ui/select.tsx` | ✓ | ✓ |
| `components/ui/textarea.tsx` | ✓ | ✓ |
| `components/ui/skeleton.tsx` | ✓ | ✓ |
| `components/ui/avatar.tsx` | ✓ | ✓ |

### 3.4 Additional UI Components Not in Design

| Component | Purpose |
|-----------|---------|
| `checkbox.tsx` | Used in DSA tracker |
| `dropdown-menu.tsx` | User menu in header |
| `scroll-area.tsx` | Sidebar scrolling |
| `separator.tsx` | Visual dividers |
| `sheet.tsx` | Mobile slide-out nav |
| `switch.tsx` | Settings toggles |
| `label.tsx` | Form labels |
| `tooltip.tsx` | Hover tooltips |

### 3.5 Findings

| # | Finding | Severity |
|---|---------|----------|
| FS-01 | No `src/` prefix — design and implementation use different root structures | Low |
| FS-02 | 8 hook files defined in design, only 3 exist (`use-auth`, `use-debounce`, `use-media-query`) | Medium |
| FS-03 | State management stores not created — interview state managed locally in page component, auth via provider | Medium |
| FS-04 | AI prompt files incomplete — only `roadmap.ts` exists; resume, interview, DSA, code-review prompts missing | Medium |
| FS-05 | No `.github/workflows/` — CI/CD pipeline not configured | Medium |
| FS-06 | Constants directory missing — company data, topics, feature flags are hardcoded in components | Low |

---

## 4. SECURITY_PLAN.md vs Implementation

### 4.1 Authentication

| Requirement | Design | Implementation | Status |
|-------------|--------|---------------|--------|
| Email + Password | ✓ | ✓ | ✓ |
| Google OAuth | ✓ | ✓ | ✓ |
| JWT via Supabase | ✓ | ✓ | ✓ |
| Access token TTL (1hr) | ✓ | Supabase default (1hr) | ✓ |
| Refresh token TTL (30d) | ✓ | Supabase default (30d) | ✓ |
| Password min 8 chars | ✓ | ✓ | ✓ |
| Password complexity (upper+lower+number) | ✓ | **Not validated** | ❌ |
| Common password check | ✓ | **Not implemented** | ❌ |
| Account lockout (10 fails → 15min) | ✓ | **Not implemented** | ❌ |
| Auth rate limiting (5 req/min) | ✓ | **Not implemented** | ❌ |

### 4.2 RLS

| Requirement | Design | Implementation | Status |
|-------------|--------|---------------|--------|
| RLS on all tables | ✓ | ✓ | ✓ |
| Feature flags public read | ✓ | ✓ | ✓ |
| Storage bucket RLS | ✓ | **Not implemented** | ❌ |

### 4.3 API Security

| Requirement | Design | Implementation | Status |
|-------------|--------|---------------|--------|
| JWT validation | ✓ | ✓ (via Supabase server client) | ✓ |
| Zod input validation | ✓ | ✓ | ✓ |
| Rate limit headers | ✓ | **Not returned** | ❌ |
| Rate limiting (non-AI routes) | ✓ | **Not implemented** | ❌ |
| CORS allowlist | ✓ | **Not configured** (Vercel default) | ❌ |
| Content-Type validation | ✓ | Partial (not explicitly checked) | Low |
| Request body size limiting | ✓ | **Not implemented** (except file upload) | Low |

### 4.4 File Upload Security

| Step | Design | Implementation | Status |
|------|--------|---------------|--------|
| MIME type check | ✓ | ✓ | ✓ |
| File extension check | ✓ | ✓ | ✓ |
| Magic number check | ✓ | ✓ | ✓ |
| Size check (5MB) | ✓ | ✓ | ✓ |
| Filename sanitization | ✓ | ✓ | ✓ |
| User folder isolation | ✓ | ✓ (uses `{userId}/` prefix) | ✓ |
| Stored in Cloudflare R2 | ✓ | **Uses Supabase Storage instead** (R2 client exists but unused) | ❌ |
| Signed URL (1hr expiry) | ✓ | **Not implemented** (uses Supabase public URL) | ❌ |

### 4.5 AI Provider Security

| Requirement | Design | Implementation | Status |
|-------------|--------|---------------|--------|
| Keys in env vars | ✓ | ✓ | ✓ |
| Keys never client-side | ✓ | ✓ | ✓ |
| Prompt injection guardrails | ✓ | Basic (no explicit guardrails code) | Low |
| JSON schema enforcement | ✓ | Partial (manual JSON.parse with try/catch) | Low |
| `do_not_train` parameter | ✓ | **Not sent** to OpenAI/Gemini API calls | Low |

### 4.6 Data Privacy

| Right | Design | Implementation | Status |
|-------|--------|---------------|--------|
| Data export | `GET /api/user/export` | **Not implemented** | ❌ |
| Account deletion | `DELETE /api/user/account` | **Not implemented** | ❌ |
| Data correction | `PUT /api/user/profile` | ✓ | ✓ |

### 4.7 Infrastructure Security

| Measure | Design | Implementation | Status |
|---------|--------|---------------|--------|
| X-Frame-Options: DENY | Implied | ✓ (vercel.json) | ✓ |
| X-Content-Type-Options: nosniff | Implied | ✓ (vercel.json) | ✓ |
| Referrer-Policy | Implied | ✓ (vercel.json) | ✓ |
| poweredByHeader: false | Implied | ✓ (next.config.ts) | ✓ |
| Sentry error monitoring | ✓ | ✓ (fully configured) | ✓ |
| CORS restricted origins | ✓ | **Not configured** | ❌ |

### 4.8 Findings

| # | Finding | Severity |
|---|---------|----------|
| SEC-01 | **Storage bucket RLS not implemented** — resume PDFs accessible if bucket is public | **Critical** |
| SEC-02 | **Rate limiting not enforced on non-AI routes** — generic rate limiter exists but is dead code | **High** |
| SEC-03 | **No account lockout or auth rate limiting** — brute-force protection missing | **High** |
| SEC-04 | Password complexity validation missing — only length check | Medium |
| SEC-05 | CORS allowlist not configured | Medium |
| SEC-06 | Cloudflare R2 not used for MVP (Supabase Storage instead) — signed URLs not implemented | Medium |
| SEC-07 | User data export and account deletion endpoints not implemented | Medium |
| SEC-08 | `do_not_train` not sent to AI providers | Low |
| SEC-09 | No credential stuffing detection | Low |

---

## 5. Cross-Cutting Findings

### 5.1 TypeScript Type Coverage

| Type | Design | Implementation | Status |
|------|--------|---------------|--------|
| `UserProfile` | ✓ | `types/index.ts` | `year` field instead of `current_year`, `name` instead of `full_name` |
| `PlacementScore` | ✓ | ✓ | Matches |
| `Roadmap` | ✓ | ✓ | Has `target_role` (bonus) |
| `Resume` | ✓ | ✓ | Has `score` as nested object |
| `Interview` | ✓ | ✓ | Has `feedback` field not in design |
| `Application` | ✓ | ✓ | Stage uses `'oa'` not `'oa_received'` |
| `Supabase generated types` | `types/supabase.ts` | **Not generated** | ❌ |

### 5.2 Error Handling

| Aspect | Design | Implementation | Status |
|--------|--------|---------------|--------|
| `AppError` class | ✓ | ✓ | ✓ |
| `handleApiError()` | ✓ | ✓ | ✓ |
| `unauthorized()`, `notFound()` | ✓ | ✓ | ✓ |
| `rateLimited()` | ✓ | ✓ | ✓ |
| Consistent error shape | `{ error, code }` | ✓ | ✓ |
| ZodError mapping | ✓ | ✓ | ✓ |

### 5.3 Environment Variables

| Variable | Design | Implementation | Status |
|----------|--------|---------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | ✓ | ✓ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ | ✓ | ✓ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ | ✓ | ✓ |
| `GEMINI_API_KEY` | ✓ | ✓ | ✓ |
| `OPENAI_API_KEY` | ✓ | ✓ | ✓ |
| `NEXT_PUBLIC_SENTRY_DSN` | ✓ | ✓ | ✓ |
| `SENTRY_AUTH_TOKEN` | ✓ | ✓ | ✓ |
| `R2_*` vars | ✓ | ✓ (commented as optional) | ✓ |

### 5.4 Cost & Scale Projections (from SYSTEM_ARCHITECTURE.md)

| Service | Projected Cost | Current State | Notes |
|---------|---------------|---------------|-------|
| Vercel Pro | $20/mo | Not deployed | Pre-deployment |
| Supabase Pro | $25/mo | Not deployed | Not connected to real Supabase |
| Cloudflare R2 | $0 (free tier) | Not used (Supabase Storage) | R2 client exists but unused |
| Gemini + OpenAI | ~$15/mo | API keys configured | Not actively calling (mock data in frontend) |
| Sentry | $0 (free tier) | Configured | ✓ |
| **Total** | **~$60/mo** | **~$0 (pre-launch)** | — |

---

## 6. Deviation Summary by Severity

### Critical (Must Fix Before Launch)

| ID | Issue | Document |
|----|-------|----------|
| SEC-01 | Storage bucket RLS not implemented — resume PDFs accessible without auth | SECURITY_PLAN.md |
| SEC-02 | No rate limiting on non-AI API routes — dead code in `lib/utils/rate-limit.ts` | SECURITY_PLAN.md |
| SEC-03 | No account lockout or auth rate limiting — brute force vulnerability | SECURITY_PLAN.md |

### High (Fix Before User Facing)

| ID | Issue | Document |
|----|-------|----------|
| DB-04 | Storage bucket RLS missing (same as SEC-01) | DATABASE_SCHEMA.md |
| API-03 | Rate limiting not enforced (same as SEC-02) | API_SPEC.md |
| SEC-06 | Cloudflare R2 not used — files stored in Supabase Storage with public URLs | SECURITY_PLAN.md |
| API-01 | User data export not available (`GET /api/user/export`) | API_SPEC.md |
| API-02 | Account deletion not available (`DELETE /api/user/account`) | API_SPEC.md |

### Medium (Address Post-MVP)

| ID | Issue | Document |
|----|-------|----------|
| DB-01 | Table name `profiles` vs design `users` — design doc stale | DATABASE_SCHEMA.md |
| FS-02 | Only 3 of 11 hook files exist | FOLDER_STRUCTURE.md |
| FS-03 | State management stores not created | FOLDER_STRUCTURE.md |
| FS-04 | AI prompt files for resume, interview, DSA, code-review missing | FOLDER_STRUCTURE.md |
| FS-05 | No CI/CD pipeline (`.github/workflows/`) | FOLDER_STRUCTURE.md |
| API-04 | Password complexity not enforced | API_SPEC.md |
| SEC-04 | Password complexity not enforced (same) | SECURITY_PLAN.md |
| SEC-05 | CORS allowlist not configured | SECURITY_PLAN.md |
| SEC-07 | `do_not_train` not sent to AI providers | SECURITY_PLAN.md |

### Low (Documentation or Minor)

| ID | Issue | Document |
|----|-------|----------|
| DB-03 | Stage `'oa'` vs `'oa_received'` | DATABASE_SCHEMA.md |
| DB-05 | `full_name` → `name` rename undocumented | DATABASE_SCHEMA.md |
| FS-01 | No `src/` prefix — structural difference | FOLDER_STRUCTURE.md |
| FS-06 | Constants hardcoded in components vs library files | FOLDER_STRUCTURE.md |
| API-05 | `preferred_role` enum inconsistent between types and API | API_SPEC.md |
| API-06 | Application stage `'oa'` doesn't match design | API_SPEC.md |
| SEC-09 | No credential stuffing detection | SECURITY_PLAN.md |

---

## 7. Recommendations

### Priority 0 (Before Launch)
1. **Add storage bucket RLS policy** for Supabase Storage resumes bucket — user folder isolation
2. **Wire `checkRateLimit()` into all API route handlers** — at minimum auth and dashboard endpoints
3. **Move resume storage to Cloudflare R2 with signed URLs** or add proper Supabase Storage RLS + signed URLs

### Priority 1 (Before User Onboarding)
4. **Implement `GET /api/user/export` and `DELETE /api/user/account`** — legal/compliance requirement
5. **Add password complexity validation** — check uppercase, lowercase, digit, common password block
6. **Configure CORS allowlist** in Vercel or Next.js config

### Priority 2 (Sprint 5-8 Alignment)
7. **Update DATABASE_SCHEMA.md** to reflect actual table names, columns, and conventions
8. **Update API_SPEC.md** response shapes to match implementation (especially interview partial-return pattern)
9. **Create missing hook files** — extract logic from pages into `use-roadmap`, `use-resume`, `use-interview`, `use-applications`, `use-dashboard` hooks
10. **Create remaining AI prompt files** — `prompts/resume.ts`, `interview.ts`, `dsa-analysis.ts`, `code-review.ts`
11. **Generate Supabase types** (`npm run db:types`) and replace manual `types/index.ts`

### Priority 3 (Technical Debt)
12. **Update FOLDER_STRUCTURE.md** to match actual layout (no `src/` prefix, actual component locations)
13. **Create `.github/workflows/ci.yml`** for lint + typecheck + build on PR
14. **Move hardcoded constants** (companies, topics) into `lib/constants/`
15. **Standardize `preferred_role` enum** across types, schemas, and API routes
