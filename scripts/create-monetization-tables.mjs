/**
 * One-time migration: create the `advertisements` and `analytics_events` tables for the Monetization and Gamification ecosystem.
 *
 * Usage:
 *   node --env-file=.env scripts/create-monetization-tables.mjs
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

// --- 1. Create advertisements table ---
try {
  const db1 = getDb();
  await db1.execute(`
    CREATE TABLE IF NOT EXISTS advertisements (
      id            INTEGER PRIMARY KEY,
      business_name TEXT NOT NULL,
      description   TEXT,
      image_url     TEXT,
      target_url    TEXT,
      coupon_code   TEXT,
      slot_type     TEXT NOT NULL,
      is_active     INTEGER NOT NULL DEFAULT 1,
      created_at    INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);
  console.log("✓ Table `advertisements` ready.");
} catch (err) {
  console.error("✗ CREATE TABLE advertisements failed:", err.message);
  process.exit(1);
}

// --- 2. Create analytics_events table ---
try {
  const db2 = getDb();
  await db2.execute(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id          INTEGER PRIMARY KEY,
      event_type  TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id   INTEGER,
      page_path   TEXT NOT NULL,
      user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at  INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);
  console.log("✓ Table `analytics_events` ready.");
} catch (err) {
  console.error("✗ CREATE TABLE analytics_events failed:", err.message);
  process.exit(1);
}

// --- 3. Create indexes for reporting ---
try {
  const db3 = getDb();
  await db3.execute(
    "CREATE INDEX IF NOT EXISTS idx_analytics_target ON analytics_events(target_type, target_id)",
  );
  await db3.execute(
    "CREATE INDEX IF NOT EXISTS idx_ads_slot ON advertisements(slot_type, is_active)",
  );
  console.log("✓ Indexes created.");
} catch (err) {
  console.error("✗ CREATE INDEX failed:", err.message);
  process.exit(1);
}

console.log("");
console.log("Migration complete.");
