-- Add auth_provider and auth_id columns to profiles
ALTER TABLE profiles
  ADD COLUMN auth_provider TEXT DEFAULT 'email',
  ADD COLUMN auth_id TEXT;
