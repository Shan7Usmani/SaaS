ALTER TABLE interviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

DROP INDEX IF EXISTS interviews_created_at_idx;
CREATE INDEX interviews_created_at_idx ON interviews (user_id, created_at);
