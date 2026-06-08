# PlacementOS — Fix Priority

**Classification Key**

| Priority | Meaning | Action |
|----------|---------|--------|
| **P0** | Launch blocker | Fix before MVP launch. Core feature broken or critical data leak. |
| **P1** | Must fix before beta | Severe bug or security gap. Product is technically usable but risky. |
| **P2** | Post-beta | Fix after beta launch. Important but not blocking. |
| **P3** | Technical debt | Address when refactoring. Low impact or nice-to-have. |

---

## P0 — Launch Blockers (11 items)

These make core features non-functional or expose user data. Ship nothing without fixing these.

### B1 — Resume Analysis Sends No PDF Content to AI
- **File:** `next-app/app/api/resume/[id]/analyze/route.ts:36-57`
- **Fix:** Pass extracted PDF text (from `pdfBuffer` or `extractTextFromPDF()`) into the AI prompt instead of using a context-free hardcoded string.
- **Why P0:** The entire Resume Analyzer feature is broken — AI evaluates nothing, scores are hallucinated.

### B2 — Interview Frontend Calls Non-Existent API Endpoint
- **File:** `next-app/app/(dashboard)/interview/page.tsx:144`
- **Fix:** Replace `"/api/interview/placeholder/answer"` with the real endpoint `"/api/interview/${interviewId}/answer"`. The `interviewId` must be threaded through from the start response.
- **Why P0:** AI-powered interview evaluation is completely bypassed. Falls back to client-side word-count mock.

### B4 — Dashboard Hardcodes Fake Scores
- **File:** `next-app/app/(dashboard)/dashboard/page.tsx:80-84`
- **Fix:** Call `GET /api/dashboard` (which already exists and returns real data) and render response. Remove hardcoded constants.
- **Why P0:** Every user sees the same fake scores. The API exists but the page ignores it.

### B7 — Client-Side Supabase Writes via Browser Anon Key
- **File:** `next-app/app/(dashboard)/onboarding/page.tsx:150-161`
- **Fix:** Replace `createClient()` (browser client) with a `fetch("POST /api/user/profile")` call. Move the upsert to the `PUT /api/user/profile` route with Zod validation.
- **Why P0:** Any frontend code (or XSS) can write arbitrary data to the `profiles` table with the exposed anon key.

### B9 — Resume Upload MIME Type Check Logic Inverted
- **File:** `next-app/app/api/resume/upload/route.ts:26`
- **Fix:** Change `&&` to `||`: `if (file.type !== ALLOWED_MIME || !file.name.endsWith(".pdf"))`.
- **Why P0:** Attacker can upload `malware.exe` renamed to `resume.pdf` — the check passes when name ends in `.pdf` regardless of actual type.

### B10 — Gemini API Misuses System Instruction
- **File:** `next-app/lib/ai/gemini.ts:20-26`
- **Fix:** Move `systemInstruction` to the top-level `system_instruction` parameter in the Gemini API request body instead of pushing it into `contents[]` as a user message.
- **Why P0:** Gemini models don't receive system context correctly. Roadmap generation lacks proper guardrails and instructions.

### B11 — In-Memory Rate Limiter Breaks on Serverless (Never Imported)
- **File:** `next-app/lib/utils/rate-limit.ts:3`, `next-app/lib/ai/rate-limiter.ts`
- **Fix (two parts):**
  1. Replace the in-memory `Map` in `rate-limit.ts` with a Supabase-database-backed or Upstash Redis counter. The existing `usage_tracking` table in `rate-limiter.ts` is the correct approach — remove the in-memory duplicate.
  2. Import and call `checkRateLimit()` in ALL API route handlers (login, signup, roadmap, resume, interview). Currently it is imported by zero routes.
- **Why P0:** No rate limiting exists anywhere. Attacker can bankrupt the platform with 100K AI calls in minutes.

### B14 — Three Duplicate App Directories with Conflicting Code
- **File:** Project root has `next-app/`, `tp/`, `src/` — three parallel Next.js scaffolds.
- **Fix:** Consolidate into a single project. `next-app/` is the real application. Remove `tp/` and `src/`, merge `package.json` (only `tp/` has one) to the root, verify `tsconfig.json` paths are correct.
- **Why P0:** No `package.json` at project root. Running `npm run dev` launches the wrong scaffold. Build pipeline is undefined.

### S1 — Auth Tokens Stored in Browser localStorage
- **File:** `next-app/lib/supabase/client.ts:3-7`
- **Fix:** Configure Supabase client to use cookies instead of localStorage. Add `cookieOptions` to `createBrowserClient()`. Or use the `@supabase/ssr` cookie-based middleware pattern (already partially set up in `middleware.ts`).
- **Why P0:** One stored XSS anywhere in the app (resume suggestions, company names, chat) = all user JWT tokens exfiltrated = full account takeover.

### S3 — No Brute Force Protection on Login
- **File:** `next-app/app/api/auth/login/route.ts:18-21`
- **Fix:** Add `checkRateLimit()` call at the top of the login route handler using the Supabase-backed rate limiter (fix B11 first). Key by IP + email combination. Add CAPTCHA via Cloudflare Turnstile or Google reCAPTCHA v3.
- **Why P0:** 1000 password guesses per minute with no lockout. Credential stuffing attack guarantees account compromise.

### S5 — Resume PDFs Accessed via Public (Permanent) URLs
- **File:** `next-app/app/api/resume/upload/route.ts:76-78`
- **Fix:** Replace `supabase.storage.from("resumes").getPublicUrl()` with `supabase.storage.from("resumes").createSignedUrl(storagePath, 3600)` to generate 1-hour expiring signed URLs. Store the signed URL (not public URL) in the database.
- **Why P0:** Any attacker who guesses or enumerates user IDs can download every student's resume (PII: phone, address, DOB) permanently.

---

## P1 — Must Fix Before Beta (18 items)

The app is technically functional with these, but beta testers will hit bugs, confusion, or unnecessary risk.

### B3 — Password Policy Mismatch (Client Min 6 vs Server Min 8)
- **File:** `next-app/schemas/auth.ts:5` vs `next-app/app/api/auth/signup/route.ts:8`
- **Fix:** Align both Zod schemas to min 8 (matching `SECURITY_PLAN.md`). The frontend schema must match the backend.
- **Effort:** 5 minutes. Change one number and regenerate types.

### B5 — Interview Total Score Double-Counts Last Answer
- **File:** `next-app/app/(dashboard)/interview/page.tsx:182-188`
- **Fix:** Remove line 183 (`const lastScore = ...`). `answers` already contains all scores including the last one. Change `allScores` to just `answers.map(a => a.score)`.
- **Effort:** 2 minutes.

### B6 — AI Prompt Injection via Unsanitized User Input
- **Files:** `next-app/lib/ai/prompts/roadmap.ts:10-34`, all AI call sites
- **Fix:** Add a sanitization layer before passing user input to AI prompts: (a) Strip newlines from single-line fields. (b) Truncate to 200 chars per field. (c) Reject input matching known prompt injection patterns (`Ignore instructions`, `system prompt`, `DAN`). (d) Wrap user input in XML-style tags and tell the AI not to treat tag contents as instructions.
- **Effort:** 2-3 hours. Create `lib/ai/sanitize.ts` utility.

### B8 — Auth Callback Open Redirect (Limited)
- **File:** `next-app/app/auth/callback/route.ts:30`
- **Fix:** Validate the `next` parameter: ensure it starts with `/` and does not contain `//` or `@` (protocol-relative redirect). Or use an allowlist of valid path prefixes.
- **Effort:** 10 minutes.

### B12 — Profile Schema Enums Mismatch Across 3 Files
- **Files:** `next-app/schemas/profile.ts:11`, `next-app/app/api/user/profile/route.ts:14`, `next-app/types/index.ts:11`
- **Fix:** Define the enum once in a shared constants file (`lib/constants.ts`). Import into all three locations. The `SECURITY_PLAN.md` values (`swe`, `data_analyst`, `ai_engineer`, `web_dev`) are the source of truth.
- **Effort:** 30 minutes.

### B13 — Roadmap Regeneration Count Always Set to 1
- **File:** `next-app/app/api/roadmap/generate/route.ts:79-85`
- **Fix:** Remove the hardcoded `regeneration_count: 1` from the INSERT. Add a query before INSERT to fetch the previous roadmap's count (if any) and increment it.
- **Effort:** 1 hour.

### E1 — Interview Timer Expires With No Auto-Submit
- **File:** `next-app/app/(dashboard)/interview/page.tsx:55-64`
- **Fix:** When `timeLeft` reaches 0, call `handleSubmit()` automatically instead of just stopping the timer.
- **Effort:** 15 minutes.

### E2 — Empty Interview Answer Passes Validation
- **File:** `next-app/app/api/interview/[id]/answer/route.ts:8-9`
- **Fix:** Increase minimum to `z.string().min(20, "Answer must be at least 20 characters").max(5000)`.
- **Effort:** 2 minutes.

### E3 — Null CGPA Renders as Literal "null" in AI Prompt
- **File:** `next-app/lib/ai/prompts/roadmap.ts:16`
- **Fix:** Wrap profile fields with a helper: `${profile.cgpa ? \`- CGPA: ${profile.cgpa}\` : ""}`. Apply to all optional fields.
- **Effort:** 10 minutes.

### E4 — Concurrent Roadmap Generation Race Condition
- **File:** `next-app/app/api/roadmap/generate/route.ts`
- **Fix:** Add a loading state on the frontend button (disable while generating). Use Supabase `FOR UPDATE` row lock or add a unique constraint on `(user_id, target_company)` where `status != 'completed'`.
- **Effort:** 1-2 hours.

### E5 — CGPA Out of Range Not Validated on Frontend
- **File:** `next-app/app/(dashboard)/onboarding/page.tsx:274`
- **Fix:** Add `min={0}` and `max={10}` to the HTML input, and validate in the `handleSubmit` before upserting.
- **Effort:** 15 minutes.

### E6 — Profile Update Accepts Any Zod-Valid Field (No Field Allowlist)
- **File:** `next-app/app/api/user/profile/route.ts:50`
- **Fix:** Create a strict allowlist of updatable fields. Remove `onboarding_completed` from the schema (should only be set by the onboarding flow, not a generic PATCH).
- **Effort:** 30 minutes.

### E7 — HR Interview Fallback Uses Technical Questions
- **File:** `next-app/app/api/interview/start/route.ts:47`
- **Fix:** Create a separate `HR_QUESTIONS` array with appropriate questions. Fall back to the correct array based on `type`.
- **Effort:** 15 minutes.

### S2 — No Security Headers (CSP, HSTS, etc.)
- **File:** `next-app/next.config.ts:1-5`
- **Fix:** Add `async headers()` to `next.config.ts` with `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`. Use a strict CSP with hash-based script-src for Next.js inline scripts.
- **Effort:** 1 hour.

### S4 — No Content Moderation on AI Output
- **File:** All AI call sites (roadmap, resume, interview routes)
- **Fix:** Pass AI output through OpenAI Moderation API (or a keyword filter for MVP) before displaying to user. Reject/filter toxic content.
- **Effort:** 2-3 hours.

### S6 — No Audit Logging on Admin Client Usage
- **File:** `next-app/lib/supabase/admin.ts:1-19`
- **Fix:** Add a logger wrapper around the admin client that logs the calling function, user context (if available), timestamp, and query table. This aids incident investigation.
- **Effort:** 30 minutes.

### S7 — User Enumeration via Distinct Signup Error Message
- **File:** `next-app/app/api/auth/signup/route.ts:26-31`
- **Fix:** Return identical response for both success and "email exists" cases: "If eligible, a verification email has been sent." Log the actual error server-side.
- **Effort:** 5 minutes.

### S8 — No Request Size Limiting
- **File:** All JSON API routes
- **Fix:** Add middleware or a helper that rejects requests with `content-length > 1MB` for JSON routes (resume upload has its own 5MB limit).
- **Effort:** 1 hour.

---

## P2 — Post-Beta (7 items)

Fix these after beta launch. Important but not blocking.

### M1 — No Error Boundary or 404 Page
- **Fix:** Add `error.tsx` and `not-found.tsx` to the app directory. Wrap the root layout with `<ErrorBoundary>`. Show a friendly "Something went wrong" page with a retry button instead of a crash screen.
- **Effort:** 2 hours.

### M3 — No Account Deletion API
- **File:** Missing endpoint (documented in `SECURITY_PLAN.md:332` but never built)
- **Fix:** Create `DELETE /api/user/account` that: (1) Verifies password. (2) Deletes user from Supabase Auth. (3) Cascade deletes all user data from all tables. (4) Removes R2 storage files. (5) Logs deletion. (6) Sends confirmation email.
- **Effort:** 4 hours.

### M4 — No Data Export API
- **File:** Missing endpoint (documented in `SECURITY_PLAN.md:331` but never built)
- **Fix:** Create `GET /api/user/export` that collects all user data (profile, roadmaps, resumes, interviews, applications) into a JSON file and returns it as a downloadable response.
- **Effort:** 2-3 hours.

### M5 — No Error Monitoring
- **File:** `src/` directory has Sentry setup, `next-app/` does not
- **Fix:** Copy Sentry configuration from `src/` into `next-app/`. Add `@sentry/nextjs` to `next-app/package.json`. Set up `instrumentation.ts` similar to what exists in `src/`.
- **Effort:** 1-2 hours.

### M6 — No Signed URL Utility for Resume Access
- **File:** `next-app/app/api/resume/upload/route.ts:76-78`
- **Fix:** After fixing the P0 `getPublicUrl` → `createSignedUrl` issue, also add a utility function `getSignedResumeUrl(storagePath)` that generates 1-hour signed URLs on-demand for the frontend to display/download resumes.
- **Effort:** 1 hour.

### M7 — No Admin Panel or Role-Based Access
- **Fix:** Create:
  1. An `admins` table or `role` field on `users` table.
  2. Admin middleware that checks role before allowing access to admin routes.
  3. Admin dashboard with user list, usage stats, content moderation tools.
- **Effort:** 1-2 weeks (separate tracked project).

### M10 — No Soft Delete Implementation
- **File:** `next-app/app/api/applications/[id]/route.ts:52-56`
- **Fix:** Replace `delete()` with `update({ deleted_at: new Date().toISOString() })`. Add `deleted_at IS NULL` filter to all SELECT queries on tables that specify soft delete in the schema.
- **Effort:** 2-3 hours.

---

## P3 — Technical Debt (3 items)

Low-priority improvements. Address when refactoring the relevant module.

### E8 — No Content-Type Validation on JSON Routes
- **Fix:** Add a middleware check: if request has a body and `content-type` is not `application/json` (for JSON routes), reject with 415.
- **Effort:** 30 minutes.

### M9 — No Request ID / Correlation Tracking
- **Fix:** Add `X-Request-ID` header (UUID) to all responses via middleware. Include in all error logs. Helps correlate serverless function logs.
- **Effort:** 1 hour.

### B8 Residual — Auth Callback Path Traversal
- **Fix:** Beyond the basic fix in P1, add a strict allowlist: only `/dashboard`, `/onboarding`, `/reset-password`, `/settings` are valid redirect targets.
- **Effort:** 15 minutes.

---

## Priority Summary

| Priority | Count | Typical Fix Time |
|----------|-------|-----------------|
| **P0** | 11 | 20-40 hours total |
| **P1** | 18 | 15-25 hours total |
| **P2** | 7 | 20-30 hours total |
| **P3** | 3 | 2-3 hours total |
| **Total** | **39** | **~60-100 hours** |

### Recommended Fix Order

1. **First P0 batch (30 min each):** B9 (MIME check), B13 (regeneration count), B3 (password mismatch), B5 (score double count), S7 (user enumeration), E2 (answer min length), E3 (null CGPA), E5 (CGPA validation)
2. **P0 architecture (3-5 hours each):** B1 (resume analysis), B2 (interview endpoint), B4 (dashboard API integration), B7 (remove client-side writes), B10 (Gemini fix), B11 (rate limiter), S1 (cookie auth), S3 (brute force), S5 (signed URLs), B14 (directory consolidation)
3. **P1 (1-3 hours each):** All 18 items
4. **P2/P3 (1-4 hours each):** Polish items

**Do not start P2/P3 until all P0 and P1 items are verified fixed.**
