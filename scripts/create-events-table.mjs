/**
 * One-time migration: create the `events` table for upcoming event content.
 *
 * Usage:
 *   node --env-file=.env scripts/create-events-table.mjs
 *
 * Safe to re-run: all statements are idempotent.
 */

import { connect } from "@tursodatabase/serverless";

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error(
    "Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN; make sure .env is loaded.",
  );
  process.exit(1);
}

function getDb() {
  return connect({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

try {
  const db1 = getDb();
  await db1.execute(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      body TEXT NOT NULL,
      owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled')),
      start_date TEXT NOT NULL,
      start_time TEXT,
      end_date TEXT,
      end_time TEXT,
      is_all_day INTEGER NOT NULL DEFAULT 0 CHECK (is_all_day IN (0, 1)),
      venue_name TEXT,
      venue_address TEXT,
      city TEXT,
      region TEXT,
      postal_code TEXT,
      event_url TEXT,
      featured_media_id INTEGER REFERENCES media(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("Table `events` ready.");
} catch (err) {
  console.error("CREATE TABLE failed:", err.message);
  process.exit(1);
}

try {
  const db2 = getDb();
  await db2.execute(
    "CREATE INDEX IF NOT EXISTS idx_events_owner_id ON events(owner_id)",
  );
  console.log("Index ready: idx_events_owner_id");
} catch (err) {
  console.error("CREATE INDEX idx_events_owner_id failed:", err.message);
  process.exit(1);
}

try {
  const db3 = getDb();
  await db3.execute(
    "CREATE INDEX IF NOT EXISTS idx_events_status ON events(status)",
  );
  console.log("Index ready: idx_events_status");
} catch (err) {
  console.error("CREATE INDEX idx_events_status failed:", err.message);
  process.exit(1);
}

try {
  const db4 = getDb();
  await db4.execute(
    "CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date)",
  );
  console.log("Index ready: idx_events_start_date");
} catch (err) {
  console.error("CREATE INDEX idx_events_start_date failed:", err.message);
  process.exit(1);
}

try {
  const db5 = getDb();
  await db5.execute(
    "CREATE INDEX IF NOT EXISTS idx_events_featured_media_id ON events(featured_media_id)",
  );
  console.log("Index ready: idx_events_featured_media_id");
} catch (err) {
  console.error(
    "CREATE INDEX idx_events_featured_media_id failed:",
    err.message,
  );
  process.exit(1);
}

console.log("Migration complete.");
