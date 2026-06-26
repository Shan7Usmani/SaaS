CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT,
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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX profiles_email_idx ON profiles (email);
CREATE INDEX profiles_tier_idx ON profiles (tier);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sync from auth.users trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();


CREATE TABLE roadmaps (
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

CREATE INDEX roadmaps_user_id_idx ON roadmaps (user_id);
CREATE INDEX roadmaps_created_at_idx ON roadmaps (user_id, created_at);

CREATE TRIGGER set_roadmaps_updated_at
  BEFORE UPDATE ON roadmaps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE roadmap_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  month_number SMALLINT NOT NULL CHECK (month_number BETWEEN 1 AND 12),
  topic_name TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  sort_order SMALLINT DEFAULT 0
);

CREATE INDEX roadmap_topics_roadmap_id_idx ON roadmap_topics (roadmap_id);


CREATE TABLE resumes (
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

CREATE INDEX resumes_user_id_idx ON resumes (user_id);
CREATE INDEX resumes_created_at_idx ON resumes (user_id, created_at);


CREATE TABLE interviews (
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
  completed_at TIMESTAMPTZ
);

CREATE INDEX interviews_user_id_idx ON interviews (user_id);


CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'applied' CHECK (stage IN ('applied', 'oa', 'interview', 'offer', 'rejected')),
  notes TEXT,
  applied_at DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ DEFAULT now(),
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX applications_user_id_idx ON applications (user_id);
CREATE INDEX applications_stage_idx ON applications (user_id, stage);

CREATE TRIGGER set_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name TEXT UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  user_percentage SMALLINT DEFAULT 0 CHECK (user_percentage BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed MVP feature flags
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


CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  count SMALLINT DEFAULT 0,
  reset_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, feature, reset_at)
);

CREATE INDEX usage_tracking_user_idx ON usage_tracking (user_id, feature, reset_at);


-- Fix schema mismatches:
-- 1. Rename profiles.name -> profiles.full_name
-- 2. Update applications stage 'oa' -> 'oa_received'

-- Rename column
ALTER TABLE profiles RENAME COLUMN name TO full_name;

-- Update trigger to use new column name
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update applications stage check constraint
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_stage_check;
ALTER TABLE applications ADD CONSTRAINT applications_stage_check
  CHECK (stage IN ('applied', 'oa_received', 'interview', 'offer', 'rejected'));

-- Update existing data
UPDATE applications SET stage = 'oa_received' WHERE stage = 'oa';


-- Add auth_provider and auth_id columns to profiles
ALTER TABLE profiles
  ADD COLUMN auth_provider TEXT DEFAULT 'email',
  ADD COLUMN auth_id TEXT;


ALTER TABLE interviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

DROP INDEX IF EXISTS interviews_created_at_idx;
CREATE INDEX interviews_created_at_idx ON interviews (user_id, created_at);


-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY profiles_own ON profiles
  FOR ALL USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Roadmaps: users can CRUD their own
CREATE POLICY roadmaps_own ON roadmaps
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Roadmap topics: users can CRUD their own (via roadmap ownership)
CREATE POLICY roadmap_topics_own ON roadmap_topics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM roadmaps WHERE roadmaps.id = roadmap_topics.roadmap_id AND roadmaps.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM roadmaps WHERE roadmaps.id = roadmap_topics.roadmap_id AND roadmaps.user_id = auth.uid())
  );

-- Resumes: users can CRUD their own
CREATE POLICY resumes_own ON resumes
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Interviews: users can CRUD their own
CREATE POLICY interviews_own ON interviews
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Applications: users can CRUD their own
CREATE POLICY applications_own ON applications
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Usage tracking: users can read their own, service role can write
CREATE POLICY usage_tracking_own ON usage_tracking
  FOR SELECT USING (user_id = auth.uid());


-- Backfill profiles for existing auth users who don't have one
INSERT INTO profiles (id, email, full_name, auth_provider, auth_id)
SELECT
  au.id,
  au.email,
  au.raw_user_meta_data->>'name',
  COALESCE(au.raw_app_meta_data->>'provider', 'email'),
  au.id
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL;

