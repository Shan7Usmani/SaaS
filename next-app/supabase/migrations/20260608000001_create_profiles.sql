CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  college TEXT,
  branch TEXT,
  current_year SMALLINT CHECK (current_year BETWEEN 1 AND 5),
  cgpa NUMERIC(4,2) CHECK (cgpa BETWEEN 0 AND 10),
  target_companies TEXT[] DEFAULT '{}',
  dsa_level TEXT CHECK (dsa_level IN ('beginner', 'intermediate', 'advanced')),
  preferred_role TEXT CHECK (preferred_role IN ('swe', 'data_analyst', 'ai_engineer', 'web_dev')),
  onboarding_completed BOOLEAN DEFAULT false,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'premium')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX profiles_email_idx ON profiles (email);
CREATE INDEX profiles_tier_idx ON profiles (tier);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sync from auth.users trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
