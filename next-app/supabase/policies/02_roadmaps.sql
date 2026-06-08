ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_roadmaps"
  ON roadmaps FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_manage_own_roadmap_topics"
  ON roadmap_topics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM roadmaps
      WHERE roadmaps.id = roadmap_topics.roadmap_id
      AND roadmaps.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM roadmaps
      WHERE roadmaps.id = roadmap_topics.roadmap_id
      AND roadmaps.user_id = auth.uid()
    )
  );
