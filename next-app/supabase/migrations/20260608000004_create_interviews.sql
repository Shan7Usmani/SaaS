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
CREATE INDEX interviews_created_at_idx ON interviews (user_id, created_at);
