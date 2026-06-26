-- Fix schema mismatches:
-- 1. Rename profiles.name -> profiles.full_name
-- 2. Update applications stage 'oa' -> 'oa_received'

-- Rename column
ALTER TABLE profiles RENAME COLUMN name TO full_name;

-- Update trigger to use new column name
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update applications stage check constraint
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_stage_check;
ALTER TABLE applications ADD CONSTRAINT applications_stage_check
  CHECK (stage IN ('applied', 'oa_received', 'interview', 'offer', 'rejected'));

-- Update existing data
UPDATE applications SET stage = 'oa_received' WHERE stage = 'oa';
