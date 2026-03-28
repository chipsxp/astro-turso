/**
 * One-time migration: create the `shares` table for social share analytics.
 *
 * Usage:
 *   node --env-file=.env scripts/create-shares-table.mjs
 *
 * Safe to re-run — CREATE TABLE IF NOT EXISTS is idempotent.
 */

import { connect } from "@tursodatabase/serverless";

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error(
    "Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN — make sure .env is loaded.",
  );
  process.exit(1);
}

function getDb() {
  return connect({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

// --- 1. Create shares table ---
try {
  const db1 = getDb();
  await db1.execute(`
    CREATE TABLE IF NOT EXISTS shares (
      id          INTEGER PRIMARY KEY,
      article_id  INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      user_id     INTEGER NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
      platform    TEXT    NOT NULL,
      shared_at   INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);
  console.log("✓ Table `shares` ready.");
} catch (err) {
  console.error("✗ CREATE TABLE failed:", err.message);
  process.exit(1);
}

// --- 2. Index for author dashboard queries (shares by user) ---
try {
  const db2 = getDb();
  await db2.execute(
    "CREATE INDEX IF NOT EXISTS idx_shares_user_id ON shares(user_id)",
  );
  console.log("✓ Index created: idx_shares_user_id");
} catch (err) {
  console.error("✗ CREATE INDEX (user) failed:", err.message);
  process.exit(1);
}

// --- 3. Index for per-article stats ---
try {
  const db3 = getDb();
  await db3.execute(
    "CREATE INDEX IF NOT EXISTS idx_shares_article_id ON shares(article_id)",
  );
  console.log("✓ Index created: idx_shares_article_id");
} catch (err) {
  console.error("✗ CREATE INDEX (article) failed:", err.message);
  process.exit(1);
}

console.log("");
console.log("Migration complete.");
console.log("  Run `POST /api/share` with { article_id, platform } to log shares.");
console.log("  Query example:");
console.log("    SELECT platform, COUNT(*) FROM shares WHERE article_id = ? GROUP BY platform;");
