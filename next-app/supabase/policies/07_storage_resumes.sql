-- Storage RLS for resumes bucket
-- Users can only access files in their own folder: {userId}/*

CREATE POLICY "users_read_own_resume_files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "users_insert_own_resume_files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "users_delete_own_resume_files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Also ensure bucket is private (no public access)
UPDATE storage.buckets
SET public = false
WHERE name = 'resumes';
