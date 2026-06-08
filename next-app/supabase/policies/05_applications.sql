ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_applications"
  ON applications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
