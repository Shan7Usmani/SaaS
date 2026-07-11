-- Simulate what Supabase signUp does
-- Replace the UUID with an actual auth user that's failing, or test with this:

-- First, check if there are orphaned profiles blocking inserts
SELECT p.id, p.email FROM profiles p 
WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = p.id);

-- Check for duplicate key issues
SELECT id, email, count(*) FROM profiles GROUP BY id, email HAVING count(*) > 1;

-- Check all constraints on profiles
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint WHERE conrelid = 'profiles'::regclass;

-- Most likely fix: the auth.users insert itself is failing
-- Check Supabase auth config
SELECT 
  au.id, au.email, au.raw_user_meta_data, au.created_at
FROM auth.users au
ORDER BY au.created_at DESC
LIMIT 5;
