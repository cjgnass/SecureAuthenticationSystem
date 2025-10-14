-- Seed a development user (username: user1, password: pass1)
-- Note: replace the hash if you change the password or rounds

INSERT INTO users (username, password_hash)
VALUES (
  'user1',
  '$2b$10$nq.pmDhWQXSrgTa/YbsMHeetJNz/itONvK2TOjp.5LUxOp1efmp66'
)
ON CONFLICT (username) DO NOTHING;


