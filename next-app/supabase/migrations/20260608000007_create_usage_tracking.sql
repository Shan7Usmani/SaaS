CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  count SMALLINT DEFAULT 0,
  reset_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, feature, reset_at)
);

CREATE INDEX usage_tracking_user_idx ON usage_tracking (user_id, feature, reset_at);
