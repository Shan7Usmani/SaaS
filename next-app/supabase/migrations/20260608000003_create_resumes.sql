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
