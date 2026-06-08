-- Pre-built roadmap templates (fallback when AI is unavailable)
INSERT INTO feature_flags (flag_name, is_enabled) VALUES
  ('pre_built_roadmaps', true)
ON CONFLICT (flag_name) DO NOTHING;

-- Pre-built roadmap data can be stored as JSON in the application code.
-- These are company-specific topic structures used when AI generation fails.
