-- Lab 5 Part 9: run this once in the Neon SQL Editor
CREATE TABLE issues (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(100) NOT NULL,
  description VARCHAR(500) NOT NULL,
  priority    TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High')),
  status      TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Resolved')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optional: one starting issue so GET /api/issues is not empty
-- INSERT INTO issues (title, description, priority)
-- VALUES ('Unable to access Wi-Fi', 'Connection fails in the teaching lab.', 'High');
