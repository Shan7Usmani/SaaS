ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_interviews"
  ON interviews FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
