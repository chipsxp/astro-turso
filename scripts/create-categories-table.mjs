/**
 * One-time migration: create the `categories` table, add the
 * `articles.category_id` column and seed the default categories.
 *
 * DDL moved verbatim from the removed ensureCategorySchema() in
 * src/lib/categories.ts.
 *
 * Usage:
 *   node --env-file=.env scripts/create-categories-table.mjs
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

const DEFAULT_CATEGORY_NAMES = [
  "For Artists",
  "For Illustrators",
  "Comic Creators",
];

function toSlug(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

try {
  const db1 = getDb();
  await db1.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  console.log("Table `categories` ready.");
} catch (err) {
  console.error("CREATE TABLE categories failed:", err.message);
  process.exit(1);
}

try {
  const db2 = getDb();
  await db2.execute(
    "CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug)",
  );
  console.log("Index ready: idx_categories_slug");
} catch (err) {
  console.error("CREATE INDEX idx_categories_slug failed:", err.message);
  process.exit(1);
}

try {
  const db3 = getDb();
  await db3.execute(
    "ALTER TABLE articles ADD COLUMN category_id INTEGER REFERENCES categories(id)",
  );
  console.log("Column ready: articles.category_id");
} catch (err) {
  if (err.message && err.message.includes("duplicate column name")) {
    console.log("Column 'category_id' already exists. Skipping.");
  } else {
    console.error("ALTER TABLE articles failed:", err.message);
    process.exit(1);
  }
}

try {
  const db4 = getDb();
  await db4.execute(
    "CREATE INDEX IF NOT EXISTS idx_articles_category_id ON articles(category_id)",
  );
  console.log("Index ready: idx_articles_category_id");
} catch (err) {
  console.error("CREATE INDEX idx_articles_category_id failed:", err.message);
  process.exit(1);
}

for (const name of DEFAULT_CATEGORY_NAMES) {
  try {
    const db5 = getDb();
    await db5.execute(
      "INSERT OR IGNORE INTO categories (name, slug) VALUES (?, ?)",
      [name, toSlug(name)],
    );
    console.log(`Category ready: ${name}`);
  } catch (err) {
    console.error(`INSERT category "${name}" failed:`, err.message);
    process.exit(1);
  }
}

console.log("Migration complete.");
