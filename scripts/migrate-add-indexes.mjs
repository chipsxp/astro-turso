import { createClient as connect } from "@tursodatabase/serverless/compat";

// Add the two indexes confirmed missing against production via
// PRAGMA index_list / table_info (2026-11-08):
//   - article_tags: only the composite PK (article_id, tag_id) exists.
//     article_id lookups ride its leftmost prefix, but tag_id lookups
//     (articles-for-a-tag) scan the whole table.
//   - articles: idx_articles_category_id + a UNIQUE autoindex exist;
//     author_id lookups (author article lists) scan.
// Deliberately NOT created (already covered, verified live):
//   - tags.name / tags.slug — UNIQUE autoindexes exist (sqlite_autoindex_tags_1/_2),
//     which is what makes INSERT OR IGNORE INTO tags work.
//   - article_tags(article_id) — covered by the composite PK prefix.
const db = connect({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const STATEMENTS = [
  "CREATE INDEX IF NOT EXISTS idx_article_tags_tag_id ON article_tags(tag_id);",
  "CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);",
];

async function run() {
  console.log("Starting migration: add missing indexes...");
  try {
    for (const sql of STATEMENTS) {
      const res = await db.execute(sql);
      console.log("OK:", sql, "(rows affected:", res.rowsAffected ?? 0, ")");
    }
    console.log("Migration successful.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

run();
