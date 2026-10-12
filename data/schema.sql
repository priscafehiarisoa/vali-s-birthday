-- Executed automatically on startup (lib/db.ts). Safe to run multiple times.
CREATE TABLE IF NOT EXISTS guests (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  allergies  TEXT,
  created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- Stores the /guest page password (scrypt hash, "salt:hash").
-- Seeded from GUEST_PAGE_PASSWORD on first launch.
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- People shown in the "Contacts" section of /info. Managed from the /guest page.
CREATE TABLE IF NOT EXISTS contacts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  role       TEXT,
  phone      TEXT    NOT NULL,
  whatsapp   TEXT,
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
