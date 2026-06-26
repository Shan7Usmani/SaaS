-- Backfill profiles for existing auth users who don't have one
INSERT INTO profiles (id, email, full_name, auth_provider, auth_id)
SELECT
  au.id,
  au.email,
  au.raw_user_meta_data->>'name',
  COALESCE(au.raw_app_meta_data->>'provider', 'email'),
  au.id
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL;
