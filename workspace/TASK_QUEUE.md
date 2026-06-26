# Task Queue — PlacementOS

> Live task board. All agents update this file as work progresses.
> Updated: 2026-06-09

---

## Legend

| Status | Meaning |
|--------|---------|
| Pending | In queue, no owner |
| Assigned | Owner claimed |
| In Progress | Working |
| Review | Done, needs sign-off |
| Done | Completed |
| Blocked | Stuck, see notes |

## Backend Tasks

| # | Task | Priority | Owner | Status | Dependencies | Notes |
|---|------|----------|-------|--------|--------------|-------|
| BE-01 | Fix Storage RLS — add bucket-level policies | P0 | — | Pending | — | See REMEDIATION_PLAN.md §1 |
| BE-02 | Wire rate limiter HOF to all 20 API routes | P0 | — | Pending | — | lib/utils/rate-limit.ts exists, needs wiring |
| BE-03 | Implement account lockout (5 failed attempts → 15min cooldown) | P0 | — | Pending | — | See SECURITY_PLAN.md |
| BE-04 | Replace getPublicUrl() with createSignedUrl(3600) | P0 | — | Pending | — | Partially done in resume routes |
| BE-05 | Add GET /api/user/export data endpoint | P0 | — | Pending | — | JSON export of all user data |
| BE-06 | Implement DELETE /api/user/account with admin client | P0 | — | Pending | BE-05 | Requires admin Supabase client |
| BE-07 | Add auth_provider and auth_id columns to profiles | P1 | — | Pending | — | Migration 20260608000009 |
| BE-08 | Create consolidated RLS enable migration | P1 | — | Pending | — | Migration 20260608000008 |
| BE-09 | Fix application stage values (oa → oa_received) | P1 | — | Pending | — | DB + Zod + dashboard |
| BE-10 | Rename name → full_name in profiles migration | P2 | — | Pending | — | Low priority, frontend aligns to impl |

## Frontend Tasks

| # | Task | Priority | Owner | Status | Dependencies | Notes |
|---|------|----------|-------|--------|--------------|-------|
| FE-01 | Wire loading states to all mutation buttons | P1 | — | Pending | — | Use useMutation isPending |
| FE-02 | Add toast notifications for all API errors | P1 | — | Pending | — | sonner toast library available |
| FE-03 | Implement responsive sidebar navigation | P1 | — | Pending | — | Mobile-first |
| FE-04 | Add dark mode toggle persist | P2 | — | Pending | — | next-themes installed |
| FE-05 | Create error boundary pages (400, 401, 403, 404, 500) | P2 | — | Pending | — | |

## AI Tasks

| # | Task | Priority | Owner | Status | Dependencies | Notes |
|---|------|----------|-------|--------|--------------|-------|
| AI-01 | Improve roadmap prompt with career-specific templates | P1 | — | Pending | — | lib/ai/prompts/roadmap.ts |
| AI-02 | Add fallback model if primary AI provider fails | P2 | — | Pending | — | Gemini → OpenAI fallback |
| AI-03 | Optimize resume analysis prompt for structured JSON output | P2 | — | Pending | — | lib/ai/prompts/ |
| AI-04 | Add interview question difficulty calibration | P2 | — | Pending | — | Dynamic difficulty |

## DevOps Tasks

| # | Task | Priority | Owner | Status | Dependencies | Notes |
|---|------|----------|-------|--------|--------------|-------|
| DO-01 | Add .env.local template with all required vars | P1 | — | Pending | — | Document all env vars |
| DO-02 | Set up GitHub Actions CI (lint, typecheck, build) | P1 | — | Pending | — | See DEPLOYMENT.md |
| DO-03 | Configure Sentry performance monitoring | P2 | — | Pending | — | Currently only error tracking |
| DO-04 | Add health check endpoint monitoring | P2 | — | Pending | — | GET /api/health |

## QA Tasks

| # | Task | Priority | Owner | Status | Dependencies | Notes |
|---|------|----------|-------|--------|--------------|-------|
| QA-01 | Test all 20 API endpoints for expected responses | P1 | — | Pending | BE-01..BE-06 | Integration tests |
| QA-02 | Verify RLS isolation between users | P1 | — | Pending | BE-01 | Ensure User A cannot read User B data |
| QA-03 | Test rate limiting triggers correctly | P1 | — | Pending | BE-02 | 429 responses |
| QA-04 | Test account lockout flow | P1 | — | Pending | BE-03 | Lock + cooldown + unlock |
| QA-05 | Verify signed URLs expire correctly | P1 | — | Pending | BE-04 | 3600s expiry |
| QA-06 | Cross-browser UI testing | P2 | — | Pending | — | Chrome, Firefox, Edge |
