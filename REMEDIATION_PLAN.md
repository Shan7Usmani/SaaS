# Remediation Plan — PlacementOS P0 Issues

> **Date:** 2026-06-09  
> **Scope:** All Critical + High findings from ARCHITECT_REVIEW.md  
> **Priority:** P0 — Must Fix Before Launch  

---

## P0-1: Storage Bucket RLS Not Implemented

**ID:** SEC-01 / DB-04  
**Severity:** Critical  
**Risk:** Resume PDFs stored in Supabase Storage have no RLS. If the bucket is public, any user who knows a file URL can access any resume. If the bucket is private, all API calls to get PDFs fail.

### Root Cause

The `supabase/policies/` directory contains RLS policies for all 6 database tables but has **no file for Storage policies**. The resume upload route (`app/api/resume/upload/route.ts:85-95`) stores files at `resumes/{userId}/{filename}` via Supabase Storage, but there is no SQL policy restricting read/write access to the bucket by user identity.

Storage RLS requires a separate policy syntax (`storage.objects` vs regular tables) and was omitted.

### Files Affected

| File | Line(s) | Role |
|------|---------|------|
| `supabase/policies/` | — | Missing `07_storage_resumes.sql` |
| `app/api/resume/upload/route.ts` | 85-95 | Uploads to Supabase Storage with no access control |
| `app/api/resume/[id]/route.ts` | 25 | Returns `pdf_url` which could be a public URL |

### Owner

Backend (Database + API)

### Fix Order

**1 of 6** — Data exposure is the highest severity. Fix before any deployment or user testing.

### Estimated Effort

**Small (1-2 hours)**

| Step | Task | Time |
|------|------|------|
| 1 | Create `supabase/policies/07_storage_resumes.sql` with `storage.objects` RLS policy | 30 min |
| 2 | Policy: user can SELECT where `bucket_id = 'resumes'` and `(storage.foldername(name))[1] = auth.uid()::text` | |
| 3 | Same for INSERT — user can write only to own folder | |
| 4 | Switch from `getPublicUrl()` to `createSignedUrl()` with 1-hour expiry | 45 min |
| 5 | Update `app/api/resume/[id]/route.ts` to return a fresh signed URL on each GET | 15 min |
| 6 | Verify with a test: User A cannot access User B's resume URL | 15 min |

---

## P0-2: No Rate Limiting on Non-AI API Routes

**ID:** SEC-02 / API-03  
**Severity:** Critical  
**Risk:** Any endpoint (auth, dashboard, profile, applications) can be hammered without restriction. Auth endpoints are vulnerable to brute-force. Dashboard endpoints can be scraped. The rate limiter library exists but is dead code.

### Root Cause

`lib/utils/rate-limit.ts` exports `checkRateLimit()` and `getRateLimitHeaders()` but **no route handler imports or calls them**. The AI rate limiter (`lib/ai/rate-limiter.ts`) is called from 3 routes (roadmap generate, resume analyze, interview start), but the generic rate limiter for non-AI routes is completely disconnected.

### Files Affected

| File | Line(s) | Role |
|------|---------|------|
| `lib/utils/rate-limit.ts` | 1-49 | Exists but never imported anywhere — dead code |
| `app/api/auth/signup/route.ts` | — | No rate limiting |
| `app/api/auth/login/route.ts` | — | No rate limiting |
| `app/api/auth/logout/route.ts` | — | No rate limiting |
| `app/api/auth/reset-password/route.ts` | — | No rate limiting |
| `app/api/auth/google/route.ts` | — | No rate limiting |
| `app/api/user/profile/route.ts` | — | No rate limiting |
| `app/api/dashboard/route.ts` | — | No rate limiting |
| `app/api/applications/route.ts` | — | No rate limiting |
| `app/api/applications/[id]/route.ts` | — | No rate limiting |
| `app/api/resume/route.ts` | — | No rate limiting |
| `app/api/interview/route.ts` | — | No rate limiting |
| `app/api/roadmap/[id]/route.ts` | — | No rate limiting |
| `app/api/roadmap/[id]/topic/[topicId]/route.ts` | — | No rate limiting |

### Owner

Backend (API)

### Fix Order

**2 of 6** — After storage security. Auth endpoints need protection before any user goes live.

### Estimated Effort

**Medium (4-6 hours)**

Two approaches ranked by preference:

**Approach A (Recommended) — Higher-order function wrapper:**
| Step | Task | Time |
|------|------|------|
| 1 | Create `lib/api/with-rate-limit.ts` as a route handler wrapper | 1 hr |
| 2 | Wrapper reads rate limit config from a map keyed by path pattern | |
| 3 | Applies IP-based + user-ID-based limits per design spec | |
| 4 | Returns `X-RateLimit-*` headers on every response | 1 hr |
| 5 | Wire wrapper into all 14 unprotected route handlers | 2 hr |
| 6 | Test: verify headers present, limits enforced after threshold | 1 hr |
| 7 | Clean up: remove dead `lib/utils/rate-limit.ts` or replace with wrapper | 30 min |

**Approach B — Manual calls per route:**
| Step | Task | Time |
|------|------|------|
| 1 | Import and call `checkRateLimit()` at top of each route handler | 2 hr |
| 2 | Add `getRateLimitHeaders()` to each response | 1 hr |
| 3 | Configure per-endpoint limits matching SECURITY_PLAN.md tiers | 1 hr |
| 4 | Test: 14 routes individually | 2 hr |

---

## P0-3: No Account Lockout or Auth Rate Limiting

**ID:** SEC-03  
**Severity:** Critical  
**Risk:** Login endpoint has no failed-attempt tracking. An attacker can brute-force passwords indefinitely at full speed. No per-IP throttling on signup or password reset.

### Root Cause

Login, signup, and Google auth routes (`app/api/auth/*/route.ts`) defer entirely to Supabase Auth. Supabase Auth has built-in rate limiting at the infrastructure level (IP-based, ~30 req/min), but the design specifies **stricter requirements**: 5 req/min per IP, account lockout after 10 consecutive failures for 15 minutes. These are not configured.

### Files Affected

| File | Line(s) | Role |
|------|---------|------|
| `app/api/auth/login/route.ts` | 20-35 | No failed-attempt tracking |
| `app/api/auth/signup/route.ts` | 20-45 | No per-IP rate limit |
| `app/api/auth/google/route.ts` | 20-35 | No per-IP rate limit |
| `app/api/auth/reset-password/route.ts` | 18-30 | No per-IP rate limit |

### Owner

Backend (Auth)

### Fix Order

**3 of 6** — Ship with P0-2 (rate limiting wrapper covers this automatically). If approach A is taken for P0-2, this is partially resolved; the account lockout logic is additional.

### Estimated Effort

**Small-Medium (3-4 hours)**

| Step | Task | Time |
|------|------|------|
| 1 | Create `lib/auth/lockout.ts` — in-memory store tracking failed attempts per email+IP | 1 hr |
| 2 | Track failed logins in `POST /api/auth/login` — increment counter on 401 response | 30 min |
| 3 | Before validating credentials, check lockout status — return 429 if locked | 30 min |
| 4 | Threshold: 10 failures → lock for 15 minutes | 15 min |
| 5 | Reset counter on successful login | 15 min |
| 6 | Apply the general rate limiter from P0-2 to auth routes (5 req/min per IP) | 30 min |
| 7 | Test: 11 rapid failed logins → 12th returns 429 even with valid password | 30 min |

**Note:** If P0-2 Approach A (wrapper) is taken, the IP-based rate limiting part is free. Only the account-lockout-per-email logic needs custom work.

---

## P0-4: Cloudflare R2 Not Used — Supabase Storage with Public URLs

**ID:** SEC-06  
**Severity:** High  
**Risk:** Resume PDFs are stored in Supabase Storage and accessed via `getPublicUrl()`, which generates predictable URLs. Even with RLS, a public URL bypasses RLS entirely (it's a CDN URL, not an API call). The Cloudflare R2 client exists but is unused.

### Root Cause

The design specifies Cloudflare R2 for file storage with signed URLs (1-hour expiry). The implementation uses Supabase Storage directly because it was faster to integrate. The R2 client (`lib/r2/client.ts`, 136 lines) was built but never wired into the upload route. A code comment at `app/api/resume/upload/route.ts:83` says: `// Upload to Supabase Storage (will be migrated to Cloudflare R2 post-MVP)`.

### Files Affected

| File | Line(s) | Role |
|------|---------|------|
| `app/api/resume/upload/route.ts` | 83-95 | Uploads to Supabase Storage instead of R2 |
| `app/api/resume/upload/route.ts` | 98-100 | Calls `getPublicUrl()` instead of `createSignedUrl()` |
| `lib/r2/client.ts` | 1-136 | Fully implemented but never imported |
| `lib/r2/index.ts` | 1-14 | Singleton wrapper never imported |
| `.env.example` | 18-21 | R2 vars commented as optional |

### Owner

Backend (Storage)

### Fix Order

**4 of 6** — Can proceed in parallel with P0-1 and P0-2 (different files). If RLS on Supabase Storage is implemented first (P0-1), this becomes Medium priority since the immediate data exposure is contained.

### Estimated Effort

**Medium (4-6 hours)**

**Option A (Switch to R2):**

| Step | Task | Time |
|------|------|------|
| 1 | Uncomment R2 env vars in `.env.example`, set as required | 15 min |
| 2 | Replace `supabase.storage.from("resumes").upload()` with `getR2Client().upload()` in upload route | 1 hr |
| 3 | Implement signed URL generation in R2 client (HMAC-based, 1hr expiry) | 2 hr |
| 4 | Replace `getPublicUrl()` with signed URL in upload response | 30 min |
| 5 | Update `app/api/resume/[id]/route.ts` to generate fresh signed URL on each GET | 30 min |
| 6 | Test upload → verify signed URL works → verify URL expires after 1hr | 1 hr |

**Option B (Fix Supabase Storage — Faster):**

| Step | Task | Time |
|------|------|------|
| 1 | Keep Supabase Storage but switch from `getPublicUrl()` to `createSignedUrl()` | 1 hr |
| 2 | Add Storage RLS (covered by P0-1) | 0 (already done) |
| 3 | Set bucket to private | 15 min |
| 4 | Test end-to-end upload + read flow | 30 min |

**Recommendation:** Option B for MVP speed, then migrate to R2 post-MVP as originally planned.

---

## P0-5: User Data Export Not Available

**ID:** API-01  
**Severity:** High  
**Risk:** Users cannot export their data. This is a compliance gap (data portability right). The design specifies `GET /api/user/export` returns a JSON blob of all user data.

### Root Cause

No route handler was created at `app/api/user/export/route.ts`. During Sprint 1-4 implementation, data export was deprioritized behind core features. The route path exists in the API spec but has zero code.

### Files Affected

| File | Line(s) | Role |
|------|---------|------|
| — | — | **Missing file** `app/api/user/export/route.ts` |

### Owner

Backend (API)

### Fix Order

**5 of 6** — Compliance feature. Needed before general user availability but can ship after security fixes.

### Estimated Effort

**Small (2-3 hours)**

| Step | Task | Time |
|------|------|------|
| 1 | Create `app/api/user/export/route.ts` | 15 min |
| 2 | Query all user-owned tables: profiles, roadmaps, resumes, interviews, applications, usage_tracking | 1 hr |
| 3 | Aggregate into a single JSON structure with metadata (exported_at, user_id) | 30 min |
| 4 | Return as downloadable JSON file (`Content-Disposition: attachment`) | 30 min |
| 5 | Test: export matches actual DB contents for a test user | 30 min |

---

## P0-6: Account Deletion Not Available

**ID:** API-02  
**Severity:** High  
**Risk:** Users cannot delete their accounts. Compliance gap (right to erasure). Design specifies `DELETE /api/user/account` cascade-deletes all data within 48 hours.

### Root Cause

No route handler at `app/api/user/account/route.ts`. Supabase Auth supports user deletion via admin API, but no endpoint exposes it. Cascade delete logic across 7+ tables was never written.

### Files Affected

| File | Line(s) | Role |
|------|---------|------|
| — | — | **Missing file** `app/api/user/account/route.ts` (or `app/api/user/account/route.ts`) |
| `lib/supabase/admin.ts` | 1-19 | Admin client exists (needed for auth.users deletion) — unused |

### Owner

Backend (API + DB)

### Fix Order

**6 of 6** — Same compliance category as P0-5. Can be implemented in parallel.

### Estimated Effort

**Small-Medium (3-4 hours)**

| Step | Task | Time |
|------|------|------|
| 1 | Create `app/api/user/account/route.ts` with DELETE handler | 15 min |
| 2 | Verify user identity via JWT (same as all routes) | 15 min |
| 3 | Delete data in dependency order: roadmap_topics → roadmaps, resumes, interviews, applications, usage_tracking → profile → auth.users | 1.5 hr |
| 4 | Delete resume PDFs from Storage (iterate user's folder) | 30 min |
| 5 | Use `supabase.auth.admin.deleteUser()` via admin client | 30 min |
| 6 | Add `deleted_at` soft-delete pattern or hard-delete (design says 48h — implement as immediate hard delete with confirmation) | 30 min |
| 7 | Test: create user, add data, delete, verify DB cleanup | 30 min |

---

## Execution Summary

### Dependency Graph

```
P0-1 (Storage RLS) ──────────────┐
                                 ├── None block others, but order matters
P0-2 (Rate Limiting) ────────────┤
    └── P0-3 (Lockout) ──────────┤  (lockout depends on rate limit wrapper)
                                 │
P0-4 (R2/Signed URLs) ───────────┤  (can use Supabase signed URLs as interim)
                                 │
P0-5 (Data Export) ──────────────┤  (independent)
                                 │
P0-6 (Account Deletion) ─────────┘  (independent)
```

### Recommended Parallel Batches

| Batch | Issues | Est. Time | Parallelizable |
|-------|--------|-----------|----------------|
| **Batch A** | P0-1 (Storage RLS) + P0-4 Option B (Supabase signed URLs) | 2-3 hrs | Yes — same developer |
| **Batch B** | P0-2 (Rate limiting wrapper) + P0-3 (Lockout) | 5-7 hrs | Yes — same developer, shared primitives |
| **Batch C** | P0-5 (Data export) + P0-6 (Account deletion) | 5-7 hrs | Yes — two developers in parallel |

### Total Effort

| Category | Hours |
|----------|-------|
| Batch A (Storage) | 2-3 |
| Batch B (Auth security) | 5-7 |
| Batch C (Compliance) | 5-7 |
| **Total** | **12-17 hours** |

### Owner Assignment

| Issue | Owner | Notes |
|-------|-------|-------|
| P0-1 | Backend (DB) | SQL policy + minor API changes |
| P0-2 | Backend (API) | Higher-order function wrapper |
| P0-3 | Backend (Auth) | Lockout module + wire into login |
| P0-4 | Backend (Storage) | Option B recommended (signed URL swap) |
| P0-5 | Backend (API) | New route, reads all tables |
| P0-6 | Backend (API + DB) | New route, cascade delete + admin API |

### Rollback Plan

Each issue is independently revertible. If a fix causes regression:

| Issue | Rollback Action |
|-------|-----------------|
| P0-1 | Drop the storage policy SQL, revert to no RLS (previous state) |
| P0-2 | Remove the `withRateLimit()` wrapper import from affected routes |
| P0-3 | Remove lockout check from login route, delete lockout module |
| P0-4 | Revert `createSignedUrl()` back to `getPublicUrl()` |
| P0-5 | Remove the export route file |
| P0-6 | Remove the account deletion route file |

### Verification Checklist (Post-Fix)

- [ ] User A cannot access User B's resume via direct URL or API
- [ ] Signed URL expires after 1 hour; regenerated on GET
- [ ] GET `/api/dashboard` returns `X-RateLimit-Remaining: 29` on first call
- [ ] 11th rapid login attempt returns 429 (not 401)
- [ ] 6th rapid request to `/api/auth/signup` in 1 minute returns 429
- [ ] `GET /api/user/export` returns valid JSON with all user data
- [ ] `DELETE /api/user/account` removes user from auth.users and all tables
- [ ] Resume PDF removed from storage on account deletion
