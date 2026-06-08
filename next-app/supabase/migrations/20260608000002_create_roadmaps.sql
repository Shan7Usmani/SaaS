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
