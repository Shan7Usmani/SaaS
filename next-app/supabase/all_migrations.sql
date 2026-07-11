-- PlacementOS — Full Database Schema
-- Run this ONCE in Supabase SQL Editor to bring the DB to the correct state.
-- Uses IF EXISTS / IF NOT EXISTS so it's safe to re-run.

-- ============================================================
-- 1. PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  college TEXT,
  branch TEXT,
  current_year SMALLINT CHECK (current_year BETWEEN 1 AND 5),
  cgpa NUMERIC(4,2) CHECK (cgpa BETWEEN 0 AND 10),
  target_companies TEXT[] DEFAULT '{}',
  dsa_level TEXT CHECK (dsa_level IN ('beginner', 'intermediate', 'advanced')),
  preferred_role TEXT CHECK (preferred_role IN ('swe', 'data_analyst', 'ai_engineer', 'web_dev')),
  onboarding_completed BOOLEAN DEFAULT false,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'premium')),
  auth_provider TEXT DEFAULT 'email',
  auth_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_id TEXT;

CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles (email);
CREATE INDEX IF NOT EXISTS profiles_tier_idx ON profiles (tier);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 2. ROADMAPS
-- ============================================================
CREATE TABLE IF NOT EXISTS roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_company TEXT NOT NULL,
  target_role TEXT,
  generated_via TEXT DEFAULT 'ai' CHECK (generated_via IN ('ai', 'template')),
  months JSONB NOT NULL,
  completion_pct NUMERIC(5,2) DEFAULT 0,
  regeneration_count SMALLINT DEFAULT 0,
  last_regenerated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS roadmaps_user_id_idx ON roadmaps (user_id);
CREATE INDEX IF NOT EXISTS roadmaps_created_at_idx ON roadmaps (user_id, created_at);

DROP TRIGGER IF EXISTS set_roadmaps_updated_at ON roadmaps;
CREATE TRIGGER set_roadmaps_updated_at
  BEFORE UPDATE ON roadmaps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS roadmap_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  month_number SMALLINT NOT NULL CHECK (month_number BETWEEN 1 AND 12),
  topic_name TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  sort_order SMALLINT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS roadmap_topics_roadmap_id_idx ON roadmap_topics (roadmap_id);

-- ============================================================
-- 3. RESUMES
-- ============================================================
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'analyzing', 'completed', 'failed')),
  pdf_url TEXT NOT NULL,
  pdf_storage_path TEXT NOT NULL,
  extracted_text TEXT,
  word_count INTEGER,
  score JSONB,
  suggestions JSONB,
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON resumes (user_id);
CREATE INDEX IF NOT EXISTS resumes_created_at_idx ON resumes (user_id, created_at);

-- ============================================================
-- 4. INTERVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('technical', 'hr')),
  question_count SMALLINT DEFAULT 5,
  timer_per_question SMALLINT DEFAULT 60,
  questions JSONB NOT NULL,
  answers JSONB,
  scores JSONB,
  total_score SMALLINT CHECK (total_score BETWEEN 0 AND 100),
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  current_question SMALLINT DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS interviews_user_id_idx ON interviews (user_id);
CREATE INDEX IF NOT EXISTS interviews_created_at_idx ON interviews (user_id, created_at);

-- ============================================================
-- 5. APPLICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'applied' CHECK (stage IN ('applied', 'oa_received', 'interview', 'offer', 'rejected')),
  notes TEXT,
  applied_at DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ DEFAULT now(),
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS applications_user_id_idx ON applications (user_id);
CREATE INDEX IF NOT EXISTS applications_stage_idx ON applications (user_id, stage);

DROP TRIGGER IF EXISTS set_applications_updated_at ON applications;
CREATE TRIGGER set_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 6. FEATURE FLAGS
-- ============================================================
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name TEXT UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  user_percentage SMALLINT DEFAULT 0 CHECK (user_percentage BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS set_feature_flags_updated_at ON feature_flags;
CREATE TRIGGER set_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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
  ('analytics', false)
ON CONFLICT (flag_name) DO NOTHING;

-- ============================================================
-- 7. USAGE TRACKING
-- ============================================================
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  count SMALLINT DEFAULT 0,
  reset_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, feature, reset_at)
);

CREATE INDEX IF NOT EXISTS usage_tracking_user_idx ON usage_tracking (user_id, feature, reset_at);

-- ============================================================
-- 8. RLS POLICIES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid duplicates
DROP POLICY IF EXISTS profiles_own ON profiles;
DROP POLICY IF EXISTS roadmaps_own ON roadmaps;
DROP POLICY IF EXISTS roadmap_topics_own ON roadmap_topics;
DROP POLICY IF EXISTS resumes_own ON resumes;
DROP POLICY IF EXISTS interviews_own ON interviews;
DROP POLICY IF EXISTS applications_own ON applications;
DROP POLICY IF EXISTS usage_tracking_own ON usage_tracking;

CREATE POLICY profiles_own ON profiles
  FOR ALL USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY roadmaps_own ON roadmaps
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY roadmap_topics_own ON roadmap_topics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM roadmaps WHERE roadmaps.id = roadmap_topics.roadmap_id AND roadmaps.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM roadmaps WHERE roadmaps.id = roadmap_topics.roadmap_id AND roadmaps.user_id = auth.uid())
  );

CREATE POLICY resumes_own ON resumes
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY interviews_own ON interviews
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY applications_own ON applications
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY usage_tracking_own ON usage_tracking
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- 9. BACKFILL
-- ============================================================
INSERT INTO profiles (id, email, full_name, auth_provider, auth_id)
SELECT
  au.id,
  au.email,
  au.raw_user_meta_data->>'name',
  COALESCE(au.raw_app_meta_data->>'provider', 'email'),
  au.id
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
