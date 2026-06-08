# Implementation Plan

## 1. Database Tables (Supabase PostgreSQL)

### MVP Tables (Sprint 1)
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | User profile + onboarding data | id, email, name, college, branch, year, cgpa, target_companies[], dsa_level, preferred_role, tier, onboarding_completed |
| `roadmaps` | AI-generated placement roadmap | id, user_id, target_company, months(jsonb), completion_pct |
| `roadmap_topics` | Individual topics within roadmap | id, roadmap_id, month_number, topic_name, is_completed |
| `resumes` | Uploaded resume + analysis | id, user_id, pdf_url, pdf_storage_path, extracted_text, score(jsonb), suggestions(jsonb) |
| `interviews` | Mock interview sessions | id, user_id, type, questions(jsonb), answers(jsonb), scores(jsonb), total_score, status, current_question |
| `applications` | Job application tracker | id, user_id, company, role, stage, notes, applied_at |
| `feature_flags` | Gradual feature rollout | id, flag_name, is_enabled, user_percentage |
| `usage_tracking` | Rate limit counters | id, user_id, feature, count, reset_at |

### RLS Strategy
- All user-owned tables: `auth.uid() = user_id`
- `feature_flags`: public read
- Storage `resumes/` bucket: per-user folder isolation

---

## 2. API Routes (Next.js Route Handlers)

| Method | Path | Handler | Purpose |
|--------|------|---------|---------|
| POST | `/api/auth/signup` | `auth/signup/route.ts` | Register with email + password |
| POST | `/api/auth/login` | `auth/login/route.ts` | Authenticate user |
| POST | `/api/auth/logout` | `auth/logout/route.ts` | Sign out |
| POST | `/api/auth/reset-password` | `auth/reset-password/route.ts` | Send reset email |
| POST | `/api/auth/google` | `auth/google/route.ts` | Google OAuth |
| | | | |
| GET | `/api/user/profile` | `user/profile/route.ts` | Get own profile |
| PUT | `/api/user/profile` | `user/profile/route.ts` | Update profile |
| | | | |
| POST | `/api/roadmap/generate` | `roadmap/generate/route.ts` | Generate AI roadmap |
| GET | `/api/roadmap/[id]` | `roadmap/[id]/route.ts` | Get roadmap detail |
| PATCH | `/api/roadmap/[id]/topic/[topicId]` | `roadmap/[id]/topic/[topicId]/route.ts` | Toggle topic completion |
| | | | |
| POST | `/api/resume/upload` | `resume/upload/route.ts` | Upload PDF |
| GET | `/api/resume/[id]` | `resume/[id]/route.ts` | Get resume analysis |
| POST | `/api/resume/[id]/analyze` | `resume/[id]/analyze/route.ts` | Trigger AI analysis |
| GET | `/api/resumes` | `resume/route.ts` | List all resumes |
| | | | |
| POST | `/api/interview/start` | `interview/start/route.ts` | Start interview session |
| POST | `/api/interview/[id]/answer` | `interview/[id]/answer/route.ts` | Submit answer |
| GET | `/api/interview/[id]` | `interview/[id]/route.ts` | Get session details |
| GET | `/api/interviews` | `interview/route.ts` | List interview history |
| | | | |
| GET | `/api/applications` | `applications/route.ts` | List applications |
| POST | `/api/applications` | `applications/route.ts` | Create application |
| PATCH | `/api/applications/[id]` | `applications/[id]/route.ts` | Update application |
| DELETE | `/api/applications/[id]` | `applications/[id]/route.ts` | Delete application |
| | | | |
| GET | `/api/dashboard` | `dashboard/route.ts` | Aggregate dashboard data |

### Common Patterns
- Auth guard: `createServerSupabaseClient()` + `getUser()` in every protected route
- Validation: Zod schema per route, validated before handler logic
- Response shape: `{ data: T }` success, `{ error: string, code: string }` error
- Error codes: UNAUTHORIZED(401), FORBIDDEN(403), NOT_FOUND(404), VALIDATION_ERROR(422), RATE_LIMITED(429)

---

## 3. Authentication Flow

### Architecture
```
Client → Supabase Auth (GoTrue) → JWT → Next.js Middleware (cookie refresh)
                                                         ↓
                                            Protected Route Handler
                                                         ↓
                                              Supabase RLS (DB-level)
```

### Implementation
1. **Supabase Auth** handles email/password signup, login, Google OAuth
2. **Next.js Middleware** (`middleware.ts`) refreshes session cookies and redirects unauthenticated users
3. **AuthProvider** (React Context) listens to `onAuthStateChange` and exposes `signIn`, `signUp`, `signOut`
4. **API Routes** verify JWT via `supabase.auth.getUser()` on each request
5. **RLS Policies** enforce data isolation at the database level

### Auth API Routes (BFF pattern)
- `POST /api/auth/signup` — proxies to Supabase Auth, returns user + session
- `POST /api/auth/login` — proxies to Supabase Auth, returns user + session
- `POST /api/auth/logout` — clears session
- `POST /api/auth/reset-password` — sends reset email
- `POST /api/auth/google` — exchanges Google ID token for Supabase session

### Session Flow
```
1. User submits credentials → Supabase Auth validates → JWT issued
2. JWT stored in HTTP-only cookie by middleware
3. AuthProvider detects session via getSession() on mount
4. onAuthStateChange listener updates React state
5. API routes read JWT from Authorization header or cookie
```

---

## 4. Services

### 4.1 AI Service (`lib/ai/`)
| File | Purpose |
|------|---------|
| `gemini.ts` | Google Gemini API client (roadmap gen, resume analysis) |
| `openai.ts` | OpenAI API client (interview evaluation) |
| `router.ts` | Provider routing: cheap ops go to Gemini, eval goes to GPT-4o mini |
| `fallback.ts` | Cached/template fallback when AI is down |
| `rate-limiter.ts` | Per-user daily AI call counting against `usage_tracking` table |
| `prompts/*.ts` | Versioned prompt templates per feature |

### 4.2 File Service (`lib/r2/`)
| File | Purpose |
|------|---------|
| `client.ts` | Cloudflare R2 S3-compatible client |
| `upload.ts` | Upload with magic byte validation, size check, path sanitization |
| `signed-url.ts` | Generate read-only signed URLs with 1hr expiry |

### 4.3 PDF Service (`lib/pdf/`)
| File | Purpose |
|------|---------|
| `extractor.ts` | Extract text from PDF buffer using pdfjs |

### 4.4 Validation (`lib/validators/`)
Zod schemas per feature, co-located with API logic:
- `auth.ts` — signup/login schemas
- `profile.ts` — onboarding/update schemas
- `roadmap.ts` — generate schemas
- `resume.ts` — upload schemas
- `interview.ts` — start/answer schemas
- `application.ts` — create/update schemas

### 4.5 Utility (`lib/utils/`)
| File | Purpose |
|------|---------|
| `errors.ts` | `AppError` class, error-to-response mapper |
| `rate-limit.ts` | Generic in-memory rate limiter |
| `formatters.ts` | Date/number formatting helpers |

---

## 5. Implementation Order

### Phase 1: Foundation (this sprint)
1. Database migrations (SQL files in `supabase/`)
2. RLS policies
3. Supabase admin client
4. Error handling utilities
5. Auth API routes
6. User profile API routes

### Phase 2: Core Features (this sprint)
7. Roadmap API routes
8. Resume API routes (upload + analyze)
9. Interview API routes
10. Applications API routes
11. Dashboard API route

### Phase 3: AI Integration (next sprint)
12. AI service layer (Gemini + OpenAI clients)
13. AI router with provider fallback
14. Prompt templates
15. Rate limiter service
16. R2 file service

### Phase 4: Polish (next sprint)
17. Frontend-backend integration
18. Error boundaries and fallbacks
19. Performance optimization
20. Testing
