/**
 * One-time migration: add `status` column to the `users` table.
 *
 * Usage:
 *   node --env-file=.env scripts/migrate-users-status.mjs
 *
 * Safe to re-run — the ALTER TABLE will be skipped if the column already exists.
 */

import { connect } from "@tursodatabase/serverless";

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error(
    "Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN — make sure .env is loaded.",
  );
  process.exit(1);
}

// Create a fresh connection per execute call (single-use HTTP session pattern).
function getDb() {
  return connect({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

// --- 1. Check if column already exists ---
const infoDb = getDb();
const tableInfo = await infoDb.execute("PRAGMA table_info(users)");
const hasStatus = tableInfo.rows.some((row) => {
  // rows may be positional objects depending on driver version
  const values = Object.values(row);
  return values.includes("status");
});

if (hasStatus) {
  console.log("✓ Column `status` already exists on `users` — nothing to do.");
  process.exit(0);
}

// --- 2. Add `status` column (existing rows default to 'active') ---
try {
  const db1 = getDb();
  await db1.execute(
    "ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active'",
  );
  console.log("✓ Added column: users.status (default 'active')");
} catch (err) {
  // SQLite reports "duplicate column name" if run twice without the PRAGMA check catching it
  if (err.message?.toLowerCase().includes("duplicate column")) {
    console.log("✓ Column `status` already exists — continuing.");
  } else {
    console.error("✗ ALTER TABLE failed:", err.message);
    process.exit(1);
  }
}

// --- 3. Add index for fast pending-user queries ---
try {
  const db2 = getDb();
  await db2.execute(
    "CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)",
  );
  console.log("✓ Index created: idx_users_status");
} catch (err) {
  console.error("✗ CREATE INDEX failed:", err.message);
  process.exit(1);
}

console.log("");
console.log("Migration complete.");
console.log(
  "  All existing users retain status='active' (column default applies).",
);
console.log(
  "  New author self-registrations will be inserted with status='pending'.",
);
