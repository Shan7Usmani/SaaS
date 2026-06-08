# PlacementOS — API Specification

## 1. Base Conventions

- **Base URL**: `/api` (Next.js Route Handlers)
- **Format**: JSON request/response bodies
- **Auth**: Bearer token (Supabase JWT) in `Authorization` header
- **Errors**: Consistent `{ error: string, code: string }` shape
- **Success**: Consistent `{ data: T }` shape
- **Pagination**: `{ data: T[], total: number, page: number, limit: number }`

### Common Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization: Bearer <token>` | Yes (except auth) | Supabase JWT |
| `Content-Type: application/json` | Yes (POST/PATCH) | |
| `X-Request-ID` | No | For tracing |

### Standard Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Valid token, insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Invalid input |
| `RATE_LIMITED` | 429 | Too many requests |
| `UPSTREAM_ERROR` | 502 | AI provider failure |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## 2. Auth Endpoints

### `POST /api/auth/signup`

Create a new account with email + password.

**Request:**
```json
{
  "email": "student@college.edu",
  "password": "securePass123!",
  "full_name": "Arjun Sharma"
}
```

**Response `201`:**
```json
{
  "data": {
    "user": { "id": "uuid", "email": "student@college.edu" },
    "session": { "access_token": "...", "refresh_token": "..." }
  }
}
```

**Errors:** `409` email exists, `422` weak password

---

### `POST /api/auth/login`

Authenticate with email + password.

**Request:**
```json
{
  "email": "student@college.edu",
  "password": "securePass123!"
}
```

**Response `200`:**
```json
{
  "data": {
    "user": { "id": "uuid", "email": "..." },
    "session": { "access_token": "...", "refresh_token": "..." }
  }
}
```

**Errors:** `401` invalid credentials

---

### `POST /api/auth/google`

Authenticate or register via Google OAuth.

**Request:**
```json
{
  "id_token": "google-id-token"
}
```

**Response `200`:** Same as login

---

### `POST /api/auth/logout`

Invalidate current session.

**Response `200`:**
```json
{ "data": { "message": "Logged out" } }
```

---

### `POST /api/auth/reset-password`

Send password reset email.

**Request:**
```json
{
  "email": "student@college.edu"
}
```

**Response `200`:**
```json
{ "data": { "message": "Reset email sent" } }
```

---

## 3. User Profile Endpoints

### `GET /api/user/profile`

Get the authenticated user's profile.

**Response `200`:**
```json
{
  "data": {
    "id": "uuid",
    "email": "student@college.edu",
    "full_name": "Arjun Sharma",
    "avatar_url": null,
    "college": "MIT Pune",
    "branch": "Computer Science",
    "current_year": 3,
    "cgpa": 8.5,
    "target_companies": ["Amazon", "Google"],
    "dsa_level": "intermediate",
    "preferred_role": "swe",
    "onboarding_completed": false,
    "tier": "free",
    "created_at": "2026-06-08T12:00:00Z"
  }
}
```

**Errors:** `401` unauthenticated

---

### `PUT /api/user/profile`

Update profile fields (partial update).

**Request:**
```json
{
  "college": "MIT Pune",
  "branch": "Computer Science",
  "current_year": 3,
  "cgpa": 8.5,
  "target_companies": ["Amazon", "Google"],
  "dsa_level": "intermediate",
  "preferred_role": "swe"
}
```

**Response `200`:**
```json
{
  "data": {
    "id": "uuid",
    "college": "MIT Pune",
    "onboarding_completed": true,
    "...": "..."
  }
}
```

**Errors:** `422` validation error

---

## 4. Roadmap Endpoints

### `POST /api/roadmap/generate`

Generate a personalized roadmap.

**Request:**
```json
{
  "target_company": "Amazon",
  "regenerate": false
}
```

**Response `201`:**
```json
{
  "data": {
    "id": "uuid",
    "target_company": "Amazon",
    "generated_via": "ai",
    "completion_pct": 0,
    "months": [
      {
        "month": 1,
        "label": "Month 1",
        "topics": [
          { "id": "uuid", "name": "Arrays", "is_completed": false },
          { "id": "uuid", "name": "Strings", "is_completed": false },
          { "id": "uuid", "name": "Linked Lists", "is_completed": false }
        ]
      }
    ],
    "created_at": "2026-06-08T12:00:00Z"
  }
}
```

**Errors:** `429` rate limit exceeded (3/day free), `502` AI unavailable

---

### `GET /api/roadmap/:id`

Get roadmap by ID.

**Response `200`:** Same shape as generate response

**Errors:** `404` not found

---

### `PATCH /api/roadmap/:id/topic/:topicId`

Mark topic as complete/incomplete.

**Request:**
```json
{
  "is_completed": true
}
```

**Response `200`:**
```json
{
  "data": {
    "id": "uuid",
    "topic_name": "Arrays",
    "is_completed": true,
    "completed_at": "2026-06-08T12:00:00Z",
    "roadmap_completion_pct": 12.5
  }
}
```

---

## 5. Resume Endpoints

### `POST /api/resume/upload`

Upload PDF resume. Returns immediately with upload status. Analysis runs async.

**Request:** `multipart/form-data`
```
file: <PDF binary>
```

**Response `201`:**
```json
{
  "data": {
    "id": "uuid",
    "status": "uploaded",
    "pdf_url": "https://r2.cloudflare.com/signed-url...",
    "created_at": "2026-06-08T12:00:00Z"
  }
}
```

**Errors:** `422` not a PDF, `422` file >5MB

---

### `POST /api/resume/:id/analyze`

Trigger AI analysis on uploaded resume.

**Response `200`:**
```json
{
  "data": {
    "id": "uuid",
    "status": "analyzing"
  }
}
```

**Note:** Client polls `GET /api/resume/:id` until `status` is `'completed'`.

---

### `GET /api/resume/:id`

Get resume analysis result.

**Response `200`:**
```json
{
  "data": {
    "id": "uuid",
    "status": "completed",
    "pdf_url": "https://...",
    "score": {
      "total": 73,
      "ats": 68,
      "keywords": 80,
      "projects": 65,
      "skills": 78
    },
    "suggestions": [
      { "category": "skills", "text": "Add Git, Docker, SQL" },
      { "category": "projects", "text": "Strengthen project descriptions with metrics" },
      { "category": "ats", "text": "Use standard section headings" }
    ],
    "analyzed_at": "2026-06-08T12:05:00Z"
  }
}
```

**Errors:** `404` not found, `425` still analyzing

---

### `GET /api/resumes`

List all resumes for authenticated user.

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "score": { "total": 73 },
      "created_at": "2026-06-08T12:00:00Z",
      "analyzed_at": "2026-06-08T12:05:00Z"
    }
  ],
  "total": 3
}
```

---

## 6. Interview Endpoints

### `POST /api/interview/start`

Start a new mock interview session.

**Request:**
```json
{
  "type": "technical",
  "question_count": 5,
  "timer_seconds": 60
}
```

**Response `201`:**
```json
{
  "data": {
    "id": "uuid",
    "type": "technical",
    "status": "in_progress",
    "current_question": 1,
    "questions": ["What is the difference between a stack and a queue?"],
    "total_questions": 5,
    "timer_seconds": 60,
    "started_at": "2026-06-08T12:00:00Z"
  }
}
```

---

### `POST /api/interview/:id/answer`

Submit answer for the current question.

**Request:**
```json
{
  "answer": "A stack is LIFO, a queue is FIFO...",
  "question_index": 1
}
```

**Response `200`:**
```json
{
  "data": {
    "question_index": 1,
    "score": 85,
    "feedback": "Good understanding of core concepts. Mention real-world use cases.",
    "suggested_answer": "A stack follows Last-In-First-Out (LIFO)...",
    "is_last": false,
    "next_question": "Explain the difference between an array and a linked list."
  }
}
```

**Errors:** `400` interview already completed

---

### `GET /api/interview/:id`

Get interview session details.

**Response `200`:**
```json
{
  "data": {
    "id": "uuid",
    "type": "technical",
    "status": "completed",
    "questions": ["...", "..."],
    "answers": [
      { "answer": "...", "score": 85, "feedback": "..." }
    ],
    "total_score": 78,
    "started_at": "2026-06-08T12:00:00Z",
    "completed_at": "2026-06-08T12:10:00Z"
  }
}
```

---

### `GET /api/interviews`

List all interview sessions for the user.

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "technical",
      "total_score": 78,
      "status": "completed",
      "started_at": "2026-06-08T12:00:00Z"
    }
  ],
  "total": 5
}
```

---

## 7. Application Tracker Endpoints

### `POST /api/applications`

Add a new job application.

**Request:**
```json
{
  "company": "Amazon",
  "role": "SDE-1",
  "stage": "applied",
  "notes": "Applied through campus portal"
}
```

**Response `201`:**
```json
{
  "data": {
    "id": "uuid",
    "company": "Amazon",
    "role": "SDE-1",
    "stage": "applied",
    "notes": "Applied through campus portal",
    "applied_at": "2026-06-08",
    "created_at": "2026-06-08T12:00:00Z"
  }
}
```

---

### `GET /api/applications`

List applications. Optional stage filter.

**Query:**
```
?stage=interview&page=1&limit=20
```

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "company": "Amazon",
      "role": "SDE-1",
      "stage": "interview",
      "notes": "...",
      "applied_at": "2026-06-01",
      "updated_at": "2026-06-08T12:00:00Z"
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 20
}
```

---

### `PATCH /api/applications/:id`

Update stage or notes.

**Request:**
```json
{
  "stage": "oa_received",
  "notes": "OA link received, due in 7 days"
}
```

**Response `200`:** Updated application object

---

### `DELETE /api/applications/:id`

Delete an application entry.

**Response `200`:**
```json
{ "data": { "message": "Deleted" } }
```

---

## 8. Dashboard Endpoint

### `GET /api/dashboard`

Aggregate all scores and stats for the dashboard.

**Response `200`:**
```json
{
  "data": {
    "placement_score": {
      "total": 68,
      "breakdown": {
        "dsa": { "score": 75, "status": "assessed" },
        "resume": { "score": 80, "status": "assessed" },
        "interview": { "score": 55, "status": "assessed" },
        "aptitude": { "score": null, "status": "not_assessed" },
        "communication": { "score": null, "status": "not_assessed" }
      }
    },
    "target": {
      "score": 85,
      "gap": 17,
      "estimated_weeks": 8
    },
    "roadmap": {
      "completion_pct": 45,
      "topics_completed": 18,
      "topics_total": 40
    },
    "applications": {
      "total": 12,
      "stages": {
        "applied": 8,
        "oa_received": 2,
        "interview": 1,
        "offer": 1,
        "rejected": 0
      }
    },
    "interviews": {
      "total": 5,
      "average_score": 72,
      "best_score": 88
    },
    "daily_tip": "Focus on understanding time complexity — 80% of Amazon SDE-1 interviews test it."
  }
}
```

---

## 9. Post-MVP Endpoints (Summary)

### DSA Tracker (P1 — Sprint 5)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/dsa/connect` | Connect coding platform account |
| `DELETE` | `/api/dsa/connect/:id` | Disconnect platform |
| `POST` | `/api/dsa/sync` | Trigger sync from all platforms |
| `GET` | `/api/dsa/analytics` | Get topic breakdown, recommendations |

### Code Review (P1 — Sprint 6)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/code/review` | Paste code for AI analysis |
| `POST` | `/api/code/:id/follow-up` | Follow-up question on review |
| `GET` | `/api/code/reviews` | Review history |

### Project Builder (P2 — Sprint 7)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/projects/generate` | Generate project idea + architecture |
| `POST` | `/api/projects/:id/export` | Export as PDF/Markdown |

### Company Prep (P2 — Sprint 7)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/companies` | List all companies |
| `GET` | `/api/companies/:slug` | Company prep data |
| `POST` | `/api/companies/:slug/experiences` | Submit interview experience |

### Aptitude (P2 — Sprint 8)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/aptitude/generate` | Generate practice set |
| `POST` | `/api/aptitude/submit` | Submit answers |
| `GET` | `/api/aptitude/mistakes` | Mistake bank |

### Job Finder (P3 — Sprint 9)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/jobs` | List aggregated jobs |
| `POST` | `/api/jobs/match` | Get matched jobs for profile |

### Subscription (P3 — Sprint 11)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/subscriptions/create` | Create Stripe/Razorpay session |
| `POST` | `/api/subscriptions/webhook` | Payment provider webhook |
| `GET` | `/api/subscriptions/current` | Get current plan + usage |
| `PATCH` | `/api/subscriptions/cancel` | Cancel subscription |

---

## 10. Rate Limiting

| Tier | AI Endpoints | Non-AI Endpoints |
|------|-------------|-------------------|
| Free | 20 requests/day | 100 requests/min |
| Pro | Unlimited | 300 requests/min |
| Premium | Unlimited | 500 requests/min |

Headers returned on all responses:
```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1623168000
```
