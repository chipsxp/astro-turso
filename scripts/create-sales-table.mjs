/**
 * One-time migration: create the 4 sales module tables.
 *
 * Usage:
 *   node --env-file=.env scripts/create-sales-table.mjs
 *
 * Safe to re-run: all statements are idempotent (IF NOT EXISTS).
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

// ── Table 1: sales_postings ───────────────────────────────────────────────────
try {
  const db1 = getDb();
  await db1.execute(`
    CREATE TABLE IF NOT EXISTS sales_postings (
      id                    INTEGER PRIMARY KEY AUTOINCREMENT,
      slug                  TEXT NOT NULL UNIQUE,
      author_id             INTEGER NOT NULL REFERENCES users(id),
      title                 TEXT NOT NULL,
      body                  TEXT NOT NULL DEFAULT '',
      status                TEXT NOT NULL DEFAULT 'draft',

      etsy_listing_id       TEXT,
      etsy_listing_url      TEXT,
      etsy_price_amount     INTEGER,
      etsy_price_divisor    INTEGER DEFAULT 100,
      etsy_price_currency   TEXT DEFAULT 'USD',
      etsy_quantity         INTEGER,
      tags                  TEXT DEFAULT '[]',

      promo_label           TEXT,
      promo_discount_pct    REAL,
      promo_start           DATETIME,
      promo_end             DATETIME,

      paypal_button_html    TEXT,
      linked_article_slug   TEXT,

      created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("Table `sales_postings` ready.");
} catch (err) {
  console.error("CREATE TABLE sales_postings failed:", err.message);
  process.exit(1);
}

// ── Table 2: sales_images ─────────────────────────────────────────────────────
try {
  const db2 = getDb();
  await db2.execute(`
    CREATE TABLE IF NOT EXISTS sales_images (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      posting_id      INTEGER NOT NULL REFERENCES sales_postings(id) ON DELETE CASCADE,
      url             TEXT NOT NULL,
      alt_text        TEXT DEFAULT '',
      source          TEXT DEFAULT 'etsy',
      sort_order      INTEGER DEFAULT 0,
      created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("Table `sales_images` ready.");
} catch (err) {
  console.error("CREATE TABLE sales_images failed:", err.message);
  process.exit(1);
}

// ── Table 3: sales_testimonials ───────────────────────────────────────────────
try {
  const db3 = getDb();
  await db3.execute(`
    CREATE TABLE IF NOT EXISTS sales_testimonials (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      posting_id      INTEGER NOT NULL REFERENCES sales_postings(id) ON DELETE CASCADE,
      author_name     TEXT NOT NULL,
      quote           TEXT NOT NULL,
      rating          INTEGER CHECK(rating BETWEEN 1 AND 5),
      sort_order      INTEGER DEFAULT 0,
      created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("Table `sales_testimonials` ready.");
} catch (err) {
  console.error("CREATE TABLE sales_testimonials failed:", err.message);
  process.exit(1);
}

// ── Table 4: sales_reviews ────────────────────────────────────────────────────
try {
  const db4 = getDb();
  await db4.execute(`
    CREATE TABLE IF NOT EXISTS sales_reviews (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      posting_id      INTEGER NOT NULL REFERENCES sales_postings(id) ON DELETE CASCADE,
      reviewer_name   TEXT NOT NULL,
      review_text     TEXT NOT NULL,
      rating          INTEGER CHECK(rating BETWEEN 1 AND 5),
      is_verified     INTEGER DEFAULT 0,
      review_date     TEXT,
      sort_order      INTEGER DEFAULT 0,
      created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("Table `sales_reviews` ready.");
} catch (err) {
  console.error("CREATE TABLE sales_reviews failed:", err.message);
  process.exit(1);
}

// ── Indexes ───────────────────────────────────────────────────────────────────
try {
  const db5 = getDb();
  await db5.execute(
    "CREATE INDEX IF NOT EXISTS idx_sales_postings_author_id ON sales_postings(author_id)",
  );
  console.log("Index ready: idx_sales_postings_author_id");
} catch (err) {
  console.error(
    "CREATE INDEX idx_sales_postings_author_id failed:",
    err.message,
  );
  process.exit(1);
}

try {
  const db6 = getDb();
  await db6.execute(
    "CREATE INDEX IF NOT EXISTS idx_sales_postings_status ON sales_postings(status)",
  );
  console.log("Index ready: idx_sales_postings_status");
} catch (err) {
  console.error("CREATE INDEX idx_sales_postings_status failed:", err.message);
  process.exit(1);
}

try {
  const db7 = getDb();
  await db7.execute(
    "CREATE INDEX IF NOT EXISTS idx_sales_images_posting_id ON sales_images(posting_id)",
  );
  console.log("Index ready: idx_sales_images_posting_id");
} catch (err) {
  console.error(
    "CREATE INDEX idx_sales_images_posting_id failed:",
    err.message,
  );
  process.exit(1);
}

try {
  const db8 = getDb();
  await db8.execute(
    "CREATE INDEX IF NOT EXISTS idx_sales_testimonials_posting_id ON sales_testimonials(posting_id)",
  );
  console.log("Index ready: idx_sales_testimonials_posting_id");
} catch (err) {
  console.error(
    "CREATE INDEX idx_sales_testimonials_posting_id failed:",
    err.message,
  );
  process.exit(1);
}

try {
  const db9 = getDb();
  await db9.execute(
    "CREATE INDEX IF NOT EXISTS idx_sales_reviews_posting_id ON sales_reviews(posting_id)",
  );
  console.log("Index ready: idx_sales_reviews_posting_id");
} catch (err) {
  console.error(
    "CREATE INDEX idx_sales_reviews_posting_id failed:",
    err.message,
  );
  process.exit(1);
}

console.log("Migration complete — all sales tables and indexes are ready.");
