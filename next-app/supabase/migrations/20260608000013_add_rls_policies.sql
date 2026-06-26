-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY profiles_own ON profiles
  FOR ALL USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Roadmaps: users can CRUD their own
CREATE POLICY roadmaps_own ON roadmaps
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Roadmap topics: users can CRUD their own (via roadmap ownership)
CREATE POLICY roadmap_topics_own ON roadmap_topics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM roadmaps WHERE roadmaps.id = roadmap_topics.roadmap_id AND roadmaps.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM roadmaps WHERE roadmaps.id = roadmap_topics.roadmap_id AND roadmaps.user_id = auth.uid())
  );

-- Resumes: users can CRUD their own
CREATE POLICY resumes_own ON resumes
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Interviews: users can CRUD their own
CREATE POLICY interviews_own ON interviews
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Applications: users can CRUD their own
CREATE POLICY applications_own ON applications
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Usage tracking: users can read their own, service role can write
CREATE POLICY usage_tracking_own ON usage_tracking
  FOR SELECT USING (user_id = auth.uid());
