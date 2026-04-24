/**
 * One-time migration: remove Etsy dependency, add direct price + Cloudinary transforms.
 *
 * Usage:
 *   node --env-file=.env scripts/migrate-sales-remove-etsy.mjs
 *
 * Safe to re-run: "duplicate column" errors are caught and reported as warnings.
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

// ── 1. Add price column to sales_postings ─────────────────────────────────────
try {
  const db1 = getDb();
  await db1.execute(
    "ALTER TABLE sales_postings ADD COLUMN price REAL DEFAULT 0",
  );
  console.log("Column added: sales_postings.price");
} catch (err) {
  if (err.message?.includes("duplicate column")) {
    console.warn("Column already exists (skipping): sales_postings.price");
  } else {
    console.error("ALTER TABLE sales_postings failed:", err.message);
    process.exit(1);
  }
}

// ── 2. Add public_id column to sales_images ───────────────────────────────────
try {
  const db2 = getDb();
  await db2.execute(
    "ALTER TABLE sales_images ADD COLUMN public_id TEXT DEFAULT ''",
  );
  console.log("Column added: sales_images.public_id");
} catch (err) {
  if (err.message?.includes("duplicate column")) {
    console.warn("Column already exists (skipping): sales_images.public_id");
  } else {
    console.error("ALTER TABLE sales_images (public_id) failed:", err.message);
    process.exit(1);
  }
}

// ── 3. Add transforms column to sales_images ──────────────────────────────────
try {
  const db3 = getDb();
  await db3.execute(
    "ALTER TABLE sales_images ADD COLUMN transforms TEXT DEFAULT ''",
  );
  console.log("Column added: sales_images.transforms");
} catch (err) {
  if (err.message?.includes("duplicate column")) {
    console.warn("Column already exists (skipping): sales_images.transforms");
  } else {
    console.error("ALTER TABLE sales_images (transforms) failed:", err.message);
    process.exit(1);
  }
}

console.log("Migration complete.");
console.log(
  "Note: etsy_* columns remain in the schema but are no longer used by the UI or API.",
);
