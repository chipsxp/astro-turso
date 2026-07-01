/**
 * Migration: Add `shop_qr_code_url` column to `users` table.
 *
 * Usage:
 *   node --env-file=.env scripts/migrate-users-shop-qr.mjs
 */

import { connect } from "@tursodatabase/serverless";

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
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

  // We use a try-catch for the ALTER TABLE in case it already exists
  try {
    await db.execute(
      "ALTER TABLE users ADD COLUMN shop_qr_code_url TEXT DEFAULT NULL"
    );
    console.log("✓ Added shop_qr_code_url to users table.");
  } catch (err) {
    if (err.message.includes("duplicate column name")) {
      console.log("Column shop_qr_code_url already exists.");
    } else {
      throw err;
    }
  }

  console.log("Migration complete.");
} catch (err) {
  console.error("✗ Migration failed:", err.message);
  process.exit(1);
}
