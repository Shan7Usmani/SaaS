# PlacementOS — Backend Progress

> Generated: 2026-06-09
> Audit against: `DATABASE_SCHEMA.md`, `API_SPEC.md`

---

## 1. Database Migration Status

| Migration | Status | Notes |
|-----------|--------|-------|
| `20260608000001_create_profiles.sql` | ✅ Complete | Table named `profiles` (spec says `users`) |
| `20260608000002_create_roadmaps.sql` | ✅ Complete | Includes `roadmap_topics` sub-table |
| `20260608000003_create_resumes.sql` | ✅ Complete | |
| `20260608000004_create_interviews.sql` | ✅ Complete | |
| `20260608000005_create_applications.sql` | ✅ Complete | |
| `20260608000006_create_feature_flags.sql` | ✅ Complete | |
| `20260608000007_create_usage_tracking.sql` | ✅ Complete | |
| `20260608000008_enable_rls_all_tables.sql` | ❌ Missing | Mentioned in spec §9 |

### Schema Gaps vs `DATABASE_SCHEMA.md`

| Table | Column | Status | Issue |
|-------|--------|--------|-------|
| `profiles` (spec: `users`) | `auth_provider` | ❌ Missing | Spec has `text NOT NULL DEFAULT 'email'` |
| `profiles` (spec: `users`) | `auth_id` | ❌ Missing | Spec has `text UNIQUE` (Supabase Auth user ID) |
| `profiles` (spec: `users`) | `full_name` | ⚠️ Mismatch | Named `name` in migration, spec says `full_name` |
| `applications` | `stage` enum | ⚠️ Mismatch | Migration uses `'oa'`, spec says `'oa_received'` |
| `roadmaps` | `target_role` | ✅ Extra | Not in spec, useful extension |

### RLS Policy Status

| Policy File | Status | Notes |
|-------------|--------|-------|
| `01_profiles.sql` | ✅ Complete | |
| `02_roadmaps.sql` | ✅ Complete | Covers `roadmap_topics` via join |
| `03_resumes.sql` | ✅ Complete | |
| `04_interviews.sql` | ✅ Complete | |
| `05_applications.sql` | ✅ Complete | |
| `06_feature_flags.sql` | ✅ Complete | |
| `07_storage_resumes.sql` | ✅ **NEW** | Storage bucket RLS for `resumes/` folder isolation |

---

## 2. API Route Status (MVP — All Complete)

### 2.1 Auth — 5/5 ✅

| Endpoint | Status | Rate Limited |
|----------|--------|-------------|
| `POST /api/auth/signup` | ✅ | ✅ 5 req/min per IP |
| `POST /api/auth/login` | ✅ | ✅ 10 req/min per IP |
| `POST /api/auth/logout` | ✅ | ✅ 10 req/min per user |
| `POST /api/auth/reset-password` | ✅ | ✅ 3 req/min per IP |
| `POST /api/auth/google` | ✅ | ✅ 10 req/min per IP |

### 2.2 User Profile — 1/1 ✅

| Endpoint | Status | Rate Limited |
|----------|--------|-------------|
| `GET /api/user/profile` | ✅ | ✅ 60 req/min |
| `PUT /api/user/profile` | ✅ | ✅ 30 req/min |

### 2.3 Roadmap — 3/3 ✅

| Endpoint | Status | Rate Limited |
|----------|--------|-------------|
| `POST /api/roadmap/generate` | ✅ | ✅ HTTP + AI daily |
| `GET /api/roadmap/[id]` | ✅ | ✅ 60 req/min |
| `PATCH /api/roadmap/[id]/topic/[topicId]` | ✅ | ✅ 120 req/min |

### 2.4 Resume — 4/4 ✅

| Endpoint | Status | Rate Limited |
|----------|--------|-------------|
| `POST /api/resume/upload` | ✅ | ✅ 20 req/min + signed URLs |
| `POST /api/resume/[id]/analyze` | ✅ | ✅ AI daily + `after()` async |
| `GET /api/resume/[id]` | ✅ | ✅ 60 req/min + signed URL refresh |
| `GET /api/resumes` | ✅ | ✅ 30 req/min |

### 2.5 Interview — 4/4 ✅

| Endpoint | Status | Rate Limited |
|----------|--------|-------------|
| `POST /api/interview/start` | ✅ | ✅ HTTP + AI daily |
| `POST /api/interview/[id]/answer` | ✅ | ✅ HTTP + AI daily + bounds check |
| `GET /api/interview/[id]` | ✅ | ✅ 60 req/min |
| `GET /api/interviews` | ✅ | ✅ 30 req/min |

### 2.6 Applications — 4/4 ✅

| Endpoint | Status | Rate Limited |
|----------|--------|-------------|
| `GET /api/applications` | ✅ | ✅ 60 req/min |
| `POST /api/applications` | ✅ | ✅ 20 req/min |
| `PATCH /api/applications/[id]` | ✅ | ✅ 30 req/min |
| `DELETE /api/applications/[id]` | ✅ | ✅ 20 req/min |

### 2.7 Dashboard — 1/1 ✅

| Endpoint | Status | Rate Limited |
|----------|--------|-------------|
| `GET /api/dashboard` | ✅ | ✅ 60 req/min |

---

## 3. P0 Issue Fixes Applied

### Resume Analysis
| Issue | Fix | Status |
|-------|-----|--------|
| Sync blocking (violates spec async pattern) | Used `after()` from `next/server` — returns `{id, status: "analyzing"}` immediately, AI runs in background | ✅ |
| No PDF text fed to AI | `lib/pdf/extractor.ts` now extracts actual resume text and passes to AI prompt | ✅ |
| `pdfBuffer` declared but unused | Removed dead code, now properly extracts text | ✅ |
| Public PDF URLs (security) | Upload now uses `createSignedUrl(3600)`; GET `/:id` refreshes signed URL on read | ✅ |

### Interview Endpoint
| Issue | Fix | Status |
|-------|-----|--------|
| Answer route missing AI rate limit | Added `checkAILimit(user.id, "interview_answer")` | ✅ |
| No bounds check on `question_index` | Added guard: `question_index >= interview.question_count` returns 422 | ✅ |
| Direct mutation of DB response object | Changed to `[...existingAnswers]` spread copy | ✅ |
| Missing HTTP rate limiting | Added `checkRateLimit` + `getRateLimitHeaders` to all routes | ✅ |

### Rate Limiting
| Issue | Fix | Status |
|-------|-----|--------|
| No HTTP rate limiting on any route | Applied `checkRateLimit` + `getRateLimitHeaders` to all 20 API routes | ✅ |
| Missing AI rate limit on interview answer | Added `interview_answer` to DAILY_LIMITS (20/day) | ✅ |
| No rate limit headers returned | All responses now include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` | ✅ |

### Storage Security
| Issue | Fix | Status |
|-------|-----|--------|
| No storage bucket RLS | Created `07_storage_resumes.sql` — folder-isolated policies for SELECT/INSERT/DELETE | ✅ |
| Public PDF URLs via `getPublicUrl()` | Replaced with `createSignedUrl(3600)` — 1-hour expiring signed URLs | ✅ |
| GET `/:id` returns stale public URL | Now refreshes signed URL on every read from `pdf_storage_path` | ✅ |

---

## 4. API Response Shape Discrepancies

| Endpoint | Spec Says | Implementation | Fix Needed? |
|----------|-----------|---------------|-------------|
| `POST /api/auth/signup` request | `full_name` | `name` | Low — frontend aligns to impl |
| `POST /api/resume/[id]/analyze` response | `{id, status: "analyzing"}` (async) | ✅ Now returns `{id, status: "analyzing"}` immediately via `after()` | ✅ Fixed |
| `POST /api/applications` stage values | `oa_received` | `oa` | Medium — must align with frontend |
| `PATCH /api/applications/[id]` stage values | `oa_received` | `oa` | Medium — must align with frontend |

---

## 5. Authentication Status

| Component | Status | Notes |
|-----------|--------|-------|
| Supabase Auth (GoTrue) | ✅ Configured | Server client in `lib/supabase/server.ts` |
| BFF API routes | ✅ 5 routes | Proxy auth calls with consistent error handling |
| Session management | ✅ Middleware | `middleware.ts` refreshes cookies |
| RLS enforcement | ✅ 7 policy files | All user-owned tables + storage bucket protected |
| Auth provider (React) | ⚠️ Frontend concern | Not in backend scope |
| Password reset flow | ✅ `POST /api/auth/reset-password` | Sends Supabase reset email |
| Google OAuth | ✅ `POST /api/auth/google` | Exchanges ID token |

---

## 6. Utility / Service Layer Status

| File | Status | Notes |
|------|--------|-------|
| `lib/supabase/admin.ts` | ✅ | Service role key client |
| `lib/supabase/server.ts` | ✅ | Cookie-based server client |
| `lib/supabase/client.ts` | ✅ | Browser client |
| `lib/supabase/middleware.ts` | ✅ | Middleware client |
| `lib/utils/errors.ts` | ✅ | `AppError` class, error codes, response mapper |
| `lib/utils/rate-limit.ts` | ✅ | In-memory HTTP rate limiter (now used by all routes) |
| `lib/utils/formatters.ts` | ✅ | Date/number helpers |
| `lib/ai/gemini.ts` | ✅ | Gemini API client |
| `lib/ai/openai.ts` | ✅ | OpenAI client |
| `lib/ai/router.ts` | ✅ | Provider router (Gemini → roadmap/resume, OpenAI → interview) |
| `lib/ai/rate-limiter.ts` | ✅ | DB-backed per-user daily limit (now includes `interview_answer`) |
| `lib/ai/prompts/roadmap.ts` | ✅ | Prompt builder + templates |
| `lib/pdf/extractor.ts` | ✅ | pdfjs-dist wrapper (now actively used by resume analyze) |
| `lib/r2/client.ts` | ❌ Not created | Cloudflare R2 — blocked on env setup |
| `lib/r2/upload.ts` | ❌ Not created | |
| `lib/r2/signed-url.ts` | ❌ Not created | |

---

## 7. Remaining Backend Tasks

### 🔴 High Priority

1. **Add `auth_provider` and `auth_id` columns to `profiles` table**
   - Migration `20260608000009_add_auth_fields.sql`
   - Enables provider-agnostic auth linking
2. **Create RLS enable migration (`20260608000008_enable_rls_all_tables.sql`)**
   - RLS is enabled per-table in individual policy files but a consolidated migration is missing
3. **Fix application stage values** — change `'oa'` → `'oa_received'` in:
   - Database CHECK constraint
   - Zod schemas in `applications/route.ts` and `applications/[id]/route.ts`
   - Dashboard stage counting
4. **Set up `.env.local`** with required runtime variables
5. **Run Supabase migrations** against the actual database instance

### 🟡 Medium Priority

6. **Rename `name` → `full_name` in profiles migration** to match spec
7. **Build `lib/r2/` service** — currently using Supabase Storage; R2 migration is post-MVP
8. **Add `GET /api/roadmap` listing endpoint** — list all user roadmaps
9. **Profile auto-creation on signup** — verify `handle_new_user()` trigger works end-to-end

### 🟢 Low Priority

10. **Post-MVP endpoints** (Sprint 5+):
    - DSA Tracker: 5 routes
    - Code Review: 3 routes
    - Project Builder: 2 routes
    - Company Prep: 3 routes
    - Aptitude: 3 routes
    - Job Finder: 2 routes
    - Subscription: 4 routes
11. **Seed data SQL** for feature flags

---

## 8. P0 Fix Summary

| Area | Before | After |
|------|--------|-------|
| Resume analyze | Sync blocking, no PDF text, public URLs | `after()` async, real PDF extraction, signed URLs |
| Interview answer | No AI rate limit, no bounds check, mutating refs | `checkAILimit()`, bound validation, immutability |
| Rate limiting | Only 3 AI routes limited, no HTTP limiting, no headers | All 20 routes limited, `X-RateLimit-*` headers on every response |
| Storage security | No bucket RLS, public URLs | Folder-isolated RLS, `createSignedUrl(3600)` |

---

## 9. TypeScript Compilation

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✅ **0 errors** |

---

## 10. Summary

```
MVP API Routes:       20 / 20  ✅ (100%)
Database Migrations:   7 / 8   ✅ (87.5%)
RLS Policies:          7 / 7   ✅ (100%) — includes storage bucket
Service Files:        13 / 16  ✅ (81.25%)
Rate Limited Routes:  20 / 20  ✅ (100%)
TypeScript Errors:     0       ✅
```
