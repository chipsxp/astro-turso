/**
 * One-time migration: create the `panel_media` and `panel_assignments` tables.
 *
 * Usage:
 *   node --env-file=.env scripts/create-panel-tables.mjs
 *
 * Safe to re-run — CREATE TABLE IF NOT EXISTS is idempotent.
 * The seed INSERT OR IGNORE is also safe to re-run.
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

// --- 1. panel_media table ---
try {
  const db1 = getDb();
  await db1.execute(`
    CREATE TABLE IF NOT EXISTS panel_media (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      public_id  TEXT    NOT NULL,
      url        TEXT    NOT NULL,
      alt_text   TEXT    NOT NULL DEFAULT '',
      width      INTEGER,
      height     INTEGER,
      format     TEXT,
      created_at TEXT    DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("\u2713 Table `panel_media` ready.");
} catch (err) {
  console.error("\u2717 CREATE TABLE panel_media failed:", err.message);
  process.exit(1);
}

// --- 2. panel_assignments table ---
try {
  const db2 = getDb();
  await db2.execute(`
    CREATE TABLE IF NOT EXISTS panel_assignments (
      slot       TEXT    PRIMARY KEY,
      label      TEXT    NOT NULL,
      media_id   INTEGER REFERENCES panel_media(id) ON DELETE SET NULL,
      updated_at TEXT    DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("\u2713 Table `panel_assignments` ready.");
} catch (err) {
  console.error("\u2717 CREATE TABLE panel_assignments failed:", err.message);
  process.exit(1);
}

// --- 3. Index on panel_media(created_at) for the 7-day gallery filter ---
try {
  const db3 = getDb();
  await db3.execute(
    "CREATE INDEX IF NOT EXISTS idx_panel_media_created_at ON panel_media(created_at)",
  );
  console.log("\u2713 Index created: idx_panel_media_created_at");
} catch (err) {
  console.error("\u2717 CREATE INDEX failed:", err.message);
  process.exit(1);
}

// --- 4. Seed the four fixed slot rows ---
try {
  const db4 = getDb();
  await db4.execute(`
    INSERT OR IGNORE INTO panel_assignments (slot, label) VALUES
      ('panel-01', 'Panel 01'),
      ('panel-02', 'Panel 02'),
      ('panel-03', 'Panel 03'),
      ('panel-04', 'Panel 04')
  `);
  console.log("\u2713 Panel assignment slots seeded (4 rows).");
} catch (err) {
  console.error("\u2717 Seed INSERT failed:", err.message);
  process.exit(1);
}

console.log("");
console.log(
  "Migration complete. Next: build src/lib/panels.ts and the API routes.",
);
