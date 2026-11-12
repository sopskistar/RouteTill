ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_role_check;
ALTER TABLE sessions ADD CONSTRAINT sessions_role_check CHECK (role IN ('merchant','judge','agent','guest'));
CREATE TABLE IF NOT EXISTS demo_guest_limits (
 session_hash text PRIMARY KEY REFERENCES sessions(token_hash) ON DELETE CASCADE,
 active_order_id text REFERENCES orders(id),
 order_count integer NOT NULL DEFAULT 0 CHECK (order_count BETWEEN 0 AND 3),
 challenge_count integer NOT NULL DEFAULT 0 CHECK (challenge_count BETWEEN 0 AND 15)
);
