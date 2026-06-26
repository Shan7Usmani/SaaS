# Current Sprint — Sprint 4

> Sprint goal, scope, stories, and deadlines
> Updated: 2026-06-09

---

## Sprint Info

| Field | Value |
|-------|-------|
| Sprint | 4 |
| Focus | MVP Completion & P0 Remediation |
| Start | 2026-06-08 |
| End | 2026-06-14 |
| Status | In Progress |

## Sprint Goal

Complete all remaining MVP features and fix all P0 security/architecture issues identified in ARCHITECT_REVIEW.md.

## Stories in Scope

| Story ID | Description | Status |
|----------|-------------|--------|
| US-001 | User can sign up with email | ✅ Done |
| US-002 | User can sign in with Google | ✅ Done |
| US-003 | User can generate personalized roadmap | ✅ Done |
| US-004 | User can upload resume for AI analysis | ✅ Done |
| US-005 | User can start a mock interview | ✅ Done |
| US-006 | User can track job applications | ✅ Done |
| US-007 | User can view dashboard with progress | ✅ Done |
| US-008 | User can reset password | ✅ Done |
| US-009 | User account is secured with RLS | 🔴 P0 Fix |
| US-010 | API endpoints are rate-limited | 🔴 P0 Fix |

## P0 Remediation Tasks

| # | Task | Owner | Est. Hours | Status |
|---|------|-------|------------|--------|
| 1 | Fix Storage RLS policies | Backend | 2-3 | Pending |
| 2 | Wire rate limiter HOF to all routes | Backend | 2-3 | Pending |
| 3 | Implement account lockout on failed login | Backend | 2-3 | Pending |
| 4 | Replace public URLs with signed URLs | Backend | 1-2 | Pending |
| 5 | Add data export endpoint | Backend | 2-3 | Pending |
| 6 | Implement account deletion with admin client | Backend | 2-3 | Pending |

## Key Deadlines

- 2026-06-11: All P0 fixes done
- 2026-06-13: QA pass complete
- 2026-06-14: Sprint review
