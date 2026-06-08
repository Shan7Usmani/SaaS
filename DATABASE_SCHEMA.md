# PlacementOS — Database Schema

## 1. Conventions

- **Naming**: `snake_case`, plural table names, singular column names
- **Primary keys**: `uuid` type, generated via `gen_random_uuid()`
- **Timestamps**: `timestamptz`, default `now()`
- **Soft delete**: `deleted_at timestamptz` nullable (no hard deletes)
- **Indexes**: Created on all `user_id`, `foreign_key`, and frequently queried columns
- **RLS**: Row Level Security enabled on all tables

## 2. Entity Relationship Diagram (Text)

```
users
  │
  ├──< roadmaps          (user_id)
  │      └──< roadmap_topics  (roadmap_id)
  │
  ├──< resumes           (user_id)
  │
  ├──< interviews        (user_id)
  │
  ├──< applications      (user_id)
  │
  ├──< dsa_accounts      (user_id)       [P1]
  │      └──< synced_questions  (user_id) [P1]
  │
  ├──< code_reviews      (user_id)       [P1]
  │
  ├──< study_sessions    (user_id)       [P3]
  │
  ├──< group_members     (user_id)       [P3]
  │      └──< study_groups (group_id)    [P3]
  │
  └──< subscriptions     (user_id)       [P3]
```

## 3. Tables — MVP (Sprint 1-4)

### 3.1 `users`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | `uuid` | PK, default `gen_random_uuid()` | |
| email | `text` | UNIQUE, NOT NULL | |
| auth_provider | `text` | NOT NULL, default `'email'` | `'email'` or `'google'` |
| auth_id | `text` | UNIQUE | Supabase Auth user ID |
| full_name | `text` | | |
| avatar_url | `text` | | |
| college | `text` | | |
| branch | `text` | | |
| current_year | `int2` | CHECK (1-5) | |
| cgpa | `numeric(4,2)` | CHECK (0-10) | |
| target_companies | `text[]` | | Array of company names |
| dsa_level | `text` | CHECK (in `['beginner', 'intermediate', 'advanced']`) | |
| preferred_role | `text` | CHECK (in `['swe', 'data_analyst', 'ai_engineer', 'web_dev']`) | |
| onboarding_completed | `boolean` | DEFAULT false | |
| tier | `text` | DEFAULT `'free'` | `'free'`, `'pro'`, `'premium'` |
| created_at | `timestamptz` | DEFAULT `now()` | |
| updated_at | `timestamptz` | DEFAULT `now()` | Auto-updated via trigger |

**Indexes:**
- `users_email_idx` ON `email`
- `users_auth_id_idx` ON `auth_id`

**RLS:**
- Users can read/update only their own row
- `auth.uid() = id` for all operations

---

### 3.2 `roadmaps`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | `uuid` | PK | |
| user_id | `uuid` | FK → users(id), NOT NULL | |
| target_company | `text` | NOT NULL | |
| generated_via | `text` | DEFAULT `'ai'` | `'ai'` or `'template'` |
| months | `jsonb` | NOT NULL | Array of month objects with topics |
| completion_pct | `numeric(5,2)` | DEFAULT 0 | Calculated from topics |
| regeneration_count | `int2` | DEFAULT 0 | Resets daily |
| last_regenerated_at | `timestamptz` | | |
| created_at | `timestamptz` | DEFAULT `now()` | |
| updated_at | `timestamptz` | DEFAULT `now()` | |

**Indexes:**
- `roadmaps_user_id_idx` ON `user_id`

**RLS:**
- Users can CRUD only their own roadmaps
- `auth.uid() = user_id`

---

### 3.3 `roadmap_topics`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | `uuid` | PK | |
| roadmap_id | `uuid` | FK → roadmaps(id), NOT NULL, ON DELETE CASCADE | |
| month_number | `int2` | NOT NULL, CHECK (1-12) | |
| topic_name | `text` | NOT NULL | |
| is_completed | `boolean` | DEFAULT false | |
| completed_at | `timestamptz` | | |
| sort_order | `int2` | DEFAULT 0 | For manual reordering |

**Indexes:**
- `roadmap_topics_roadmap_id_idx` ON `roadmap_id`

**RLS:**
- Via roadmap ownership (join check)

---

### 3.4 `resumes`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | `uuid` | PK | |
| user_id | `uuid` | FK → users(id), NOT NULL | |
| pdf_url | `text` | NOT NULL | Cloudflare R2 signed URL |
| pdf_storage_path | `text` | NOT NULL | R2 object key |
| extracted_text | `text` | | Raw text from PDF |
| word_count | `int4` | | |
| score | `jsonb` | | `{ats: N, keywords: N, projects: N, skills: N, total: N}` |
| suggestions | `jsonb` | | Array of suggestion objects |
| analyzed_at | `timestamptz` | | |
| created_at | `timestamptz` | DEFAULT `now()` | |

**Indexes:**
- `resumes_user_id_idx` ON `user_id`
- `resumes_created_at_idx` ON `user_id, created_at`

**RLS:**
- Users can CRUD only their own resumes
- `auth.uid() = user_id`

---

### 3.5 `interviews`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | `uuid` | PK | |
| user_id | `uuid` | FK → users(id), NOT NULL | |
| type | `text` | NOT NULL, CHECK (in `['technical', 'hr']`) | MVP: technical only |
| question_count | `int2` | DEFAULT 5 | |
| timer_per_question | `int2` | DEFAULT 60 | Seconds |
| questions | `jsonb` | NOT NULL | Array of question strings |
| answers | `jsonb` | | Array of answer objects `{answer, score, feedback}` |
| scores | `jsonb` | | Per-question scores array |
| total_score | `int2` | | 0-100 |
| status | `text` | DEFAULT `'in_progress'` | `'in_progress'` or `'completed'` |
| current_question | `int2` | DEFAULT 0 | 0-indexed |
| started_at | `timestamptz` | DEFAULT `now()` | |
| completed_at | `timestamptz` | | |

**Indexes:**
- `interviews_user_id_idx` ON `user_id`

**RLS:**
- Users can CRUD only their own interviews
- `auth.uid() = user_id`

---

### 3.6 `applications`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | `uuid` | PK | |
| user_id | `uuid` | FK → users(id), NOT NULL | |
| company | `text` | NOT NULL | |
| role | `text` | NOT NULL | |
| stage | `text` | NOT NULL, DEFAULT `'applied'` | `'applied'`, `'oa_received'`, `'interview'`, `'offer'`, `'rejected'` |
| notes | `text` | | |
| applied_at | `date` | NOT NULL, DEFAULT `CURRENT_DATE` | |
| updated_at | `timestamptz` | DEFAULT `now()` | |
| sort_order | `int4` | DEFAULT 0 | For future kanban ordering |

**Indexes:**
- `applications_user_id_idx` ON `user_id`
- `applications_stage_idx` ON `user_id, stage`

**RLS:**
- Users can CRUD only their own applications
- `auth.uid() = user_id`

---

## 4. Tables — Post-MVP (Sprint 5+)

### 4.1 `dsa_accounts` (P1 — Sprint 5)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | `uuid` | PK | |
| user_id | `uuid` | FK → users(id), NOT NULL | |
| platform | `text` | NOT NULL, CHECK (in `['leetcode', 'geeksforgeeks', 'hackerrank']`) | |
| username | `text` | NOT NULL | |
| is_verified | `boolean` | DEFAULT false | |
| last_synced_at | `timestamptz` | | |
| created_at | `timestamptz` | DEFAULT `now()` | |

**Unique:** `(user_id, platform)` — one connection per platform per user

---

### 4.2 `synced_questions` (P1 — Sprint 5)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | `uuid` | PK | |
| user_id | `uuid` | FK → users(id), NOT NULL | |
| platform | `text` | NOT NULL | |
| platform_question_id | `text` | | ID on external platform |
| title | `text` | NOT NULL | |
| difficulty | `text` | CHECK (in `['easy', 'medium', 'hard']`) | |
| topic | `text` | | |
| topic_slug | `text` | | Normalized topic name |
| solved_at | `date` | NOT NULL | |

**Indexes:**
- `synced_questions_user_id_idx` ON `user_id`
- `synced_questions_topic_idx` ON `user_id, topic`
- UNIQUE on `(user_id, platform, platform_question_id)`

---

### 4.3 `code_reviews` (P1 — Sprint 6)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | `uuid` | PK | |
| user_id | `uuid` | FK → users(id), NOT NULL | |
| code | `text` | NOT NULL | |
| language | `text` | | Auto-detected |
| analysis | `jsonb` | | `{time_complexity, space_complexity, explanation, suggestions, optimized_code}` |
| created_at | `timestamptz` | DEFAULT `now()` | |

---

### 4.4 `subscriptions` (P3 — Sprint 11)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | `uuid` | PK | |
| user_id | `uuid` | FK → users(id), UNIQUE, NOT NULL | |
| tier | `text` | NOT NULL | `'free'`, `'pro'`, `'premium'` |
| payment_provider | `text` | | `'stripe'` or `'razorpay'` |
| payment_customer_id | `text` | | |
| payment_subscription_id | `text` | | |
| status | `text` | DEFAULT `'active'` | `'active'`, `'canceled'`, `'past_due'` |
| current_period_start | `timestamptz` | | |
| current_period_end | `timestamptz` | | |
| created_at | `timestamptz` | DEFAULT `now()` | |

---

### 4.5 `study_groups` (P3 — Sprint 10)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | `uuid` | PK | |
| name | `text` | NOT NULL | |
| target_company | `text` | | Nullable (general group) |
| created_by | `uuid` | FK → users(id) | |
| max_members | `int2` | DEFAULT 30 | |
| is_public | `boolean` | DEFAULT true | |
| created_at | `timestamptz` | DEFAULT `now()` | |

### 4.6 `group_members` (P3 — Sprint 10)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | `uuid` | PK | |
| group_id | `uuid` | FK → study_groups(id), ON DELETE CASCADE | |
| user_id | `uuid` | FK → users(id) | |
| role | `text` | DEFAULT `'member'` | `'admin'` or `'member'` |
| joined_at | `timestamptz` | DEFAULT `now()` | |

**Unique:** `(group_id, user_id)`

---

### 4.7 `study_sessions` (P3 — Sprint 10)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | `uuid` | PK | |
| user_id | `uuid` | FK → users(id), NOT NULL | |
| duration_minutes | `int2` | NOT NULL | |
| date | `date` | NOT NULL, DEFAULT `CURRENT_DATE` | |
| notes | `text` | | |

---

## 5. Feature Flag Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | `uuid` | PK | |
| flag_name | `text` | UNIQUE, NOT NULL | |
| is_enabled | `boolean` | DEFAULT false | |
| user_percentage | `int2` | DEFAULT 0 | Gradual rollout (0-100) |
| created_at | `timestamptz` | DEFAULT `now()` | |
| updated_at | `timestamptz` | DEFAULT `now()` | |

**Seed data for MVP:**
```sql
INSERT INTO feature_flags (flag_name, is_enabled) VALUES
('onboarding', true),
('roadmap_generator', true),
('resume_analyzer', true),
('mock_interview', true),
('app_tracker', true),
('dashboard', true),
('dsa_tracker', false),
('coding_mentor', false),
('project_builder', false),
('company_prep', false),
('aptitude', false),
('behavioral_coach', false),
('job_finder', false),
('study_groups', false),
('analytics', false);
```

## 6. Usage Tracking Table (Rate Limits)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | `uuid` | PK | |
| user_id | `uuid` | FK → users(id), NOT NULL | |
| feature | `text` | NOT NULL | e.g. `'roadmap_generate'`, `'resume_analyze'`, `'ai_chat'` |
| count | `int2` | DEFAULT 0 | |
| reset_at | `timestamptz` | NOT NULL | Daily reset timestamp |

**Unique:** `(user_id, feature, reset_at)` — one counter per feature per day

## 7. Supabase Storage Buckets

| Bucket Name | Visibility | File Types | Max Size | RLS |
|-------------|-----------|------------|----------|-----|
| `resumes` | Private | `application/pdf` | 5MB | User can read/upload own files only |

## 8. Row Level Security — Policy Summary

| Table | Operation | Policy |
|-------|-----------|--------|
| All tables | SELECT | `auth.uid() = user_id` |
| All tables | INSERT | `auth.uid() = user_id` |
| All tables | UPDATE | `auth.uid() = user_id` |
| All tables | DELETE | `auth.uid() = user_id` |
| `roadmap_topics` | SELECT | Via JOIN to roadmaps where `roadmaps.user_id = auth.uid()` |
| Storage `resumes/` | SELECT | `(storage.foldername())[1] = auth.uid()::text` |
| Storage `resumes/` | INSERT | `(storage.foldername())[1] = auth.uid()::text` |

## 9. Migrations Strategy

- **Tool**: Supabase CLI `supabase migration`
- **Naming**: `YYYYMMDD_description.sql`
- **Branching**: One migration per sprint
- **Rollback**: Each migration must have a matching `down` migration

```
supabase/
  migrations/
    20260608000001_create_users.sql
    20260608000002_create_roadmaps.sql
    20260608000003_create_resumes.sql
    20260608000004_create_interviews.sql
    20260608000005_create_applications.sql
    20260608000006_create_feature_flags.sql
    20260608000007_create_usage_tracking.sql
    20260608000008_enable_rls_all_tables.sql
```
