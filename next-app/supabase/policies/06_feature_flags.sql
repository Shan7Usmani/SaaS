ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_read_feature_flags"
  ON feature_flags FOR SELECT
  USING (true);
