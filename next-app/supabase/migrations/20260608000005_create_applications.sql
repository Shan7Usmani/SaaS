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
