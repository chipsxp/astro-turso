/**
 * One-time migration: create the `media`, `upload_sessions` and
 * `upload_session_media` tables plus their indexes.
 *
 * DDL moved verbatim from the removed ensureMediaTable() and
 * ensureUploadSessionSchema() in src/lib/media.ts.
 *
 * Usage:
 *   node --env-file=.env scripts/create-media-tables.mjs
 *
 * Safe to re-run: all statements are idempotent.
 */

import { createClient as connect } from "@tursodatabase/serverless/compat";

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
  CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY,
    article_id INTEGER NOT NULL,
    resource_type TEXT NOT NULL,
    public_id TEXT,
    url TEXT NOT NULL,
    alt_text TEXT NOT NULL,
    format TEXT,
    width INTEGER,
    height INTEGER,
    duration REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE
  )
`);
  console.log("Table `media` ready.");
} catch (err) {
  console.error("CREATE TABLE media failed:", err.message);
  process.exit(1);
}

try {
  const db2 = getDb();
  await db2.execute(`
  CREATE INDEX IF NOT EXISTS idx_media_article_id
  ON media(article_id)
`);
  console.log("Index ready: idx_media_article_id");
} catch (err) {
  console.error("CREATE INDEX idx_media_article_id failed:", err.message);
  process.exit(1);
}

try {
  const db3 = getDb();
  await db3.execute(`
  CREATE TABLE IF NOT EXISTS upload_sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    consumed_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);
  console.log("Table `upload_sessions` ready.");
} catch (err) {
  console.error("CREATE TABLE upload_sessions failed:", err.message);
  process.exit(1);
}

try {
  const db4 = getDb();
  await db4.execute(`
  CREATE INDEX IF NOT EXISTS idx_upload_sessions_expires_at
  ON upload_sessions(expires_at)
`);
  console.log("Index ready: idx_upload_sessions_expires_at");
} catch (err) {
  console.error(
    "CREATE INDEX idx_upload_sessions_expires_at failed:",
    err.message,
  );
  process.exit(1);
}

try {
  const db5 = getDb();
  await db5.execute(`
  CREATE TABLE IF NOT EXISTS upload_session_media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    upload_session_id TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    public_id TEXT,
    url TEXT NOT NULL,
    alt_text TEXT NOT NULL,
    format TEXT,
    width INTEGER,
    height INTEGER,
    duration REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(upload_session_id) REFERENCES upload_sessions(id) ON DELETE CASCADE
  )
`);
  console.log("Table `upload_session_media` ready.");
} catch (err) {
  console.error("CREATE TABLE upload_session_media failed:", err.message);
  process.exit(1);
}

try {
  const db6 = getDb();
  await db6.execute(`
  CREATE INDEX IF NOT EXISTS idx_upload_session_media_session_id
  ON upload_session_media(upload_session_id)
`);
  console.log("Index ready: idx_upload_session_media_session_id");
} catch (err) {
  console.error(
    "CREATE INDEX idx_upload_session_media_session_id failed:",
    err.message,
  );
  process.exit(1);
}

console.log("Migration complete.");
