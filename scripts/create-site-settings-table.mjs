/**
 * One-time migration: create the `site_settings` table.
 *
 * Usage:
 *   node --env-file=.env scripts/create-site-settings-table.mjs
 *
 * Safe to re-run — CREATE TABLE IF NOT EXISTS is idempotent.
 */

import { createClient as connect } from "@tursodatabase/serverless/compat";

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

try {
  const db = getDb();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);
  console.log("✓ Table `site_settings` ready.");

  // Insert default values if they don't exist
  await db.execute(`
    INSERT OR IGNORE INTO site_settings (key, value) VALUES
    ('donation_placement', 'footer')
  `);
  console.log("✓ Default site settings initialized.");
} catch (err) {
  console.error("✗ Migration failed:", err.message);
  process.exit(1);
}

console.log("");
console.log("Migration complete.");
