ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_resumes"
  ON resumes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
