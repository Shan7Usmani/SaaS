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
