/**
 * Backfill legacy inline data:image payloads into `images` table records.
 *
 * Usage:
 *   node --env-file=.env scripts/backfill-inline-images.mjs
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

async function execute(sql, args) {
  const db = getDb();
  if (args !== undefined) return db.execute(sql, args);
  return db.execute(sql);
}

async function ensureInlineSchema() {
  await execute(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      alt_text TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  const columns = [
    "mime_type TEXT",
    "data_base64 TEXT",
    "size_bytes INTEGER",
    "source_type TEXT NOT NULL DEFAULT 'legacy'",
    "updated_at TEXT",
  ];

  for (const columnSql of columns) {
    try {
      await execute(`ALTER TABLE images ADD COLUMN ${columnSql}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err ?? "");
      if (
        !message.includes("duplicate column name") &&
        !message.includes("already exists")
      ) {
        throw err;
      }
    }
  }

  await execute(
    "CREATE INDEX IF NOT EXISTS idx_images_article_id ON images(article_id)",
  );
  await execute(
    "CREATE INDEX IF NOT EXISTS idx_images_source_article ON images(source_type, article_id)",
  );
}

function estimateBase64DecodedBytes(base64Data) {
  const normalized = String(base64Data ?? "").replace(/\s+/g, "");
  const padding = normalized.endsWith("==")
    ? 2
    : normalized.endsWith("=")
      ? 1
      : 0;

  return Math.max(0, Math.floor((normalized.length * 3) / 4) - padding);
}

const IMG_TAG_REGEX = /<img\b[^>]*>/gi;
const DATA_URI_SRC_REGEX =
  /\bsrc\s*=\s*(["'])(data:image\/[a-z0-9.+-]+;base64,([A-Za-z0-9+/=\r\n]+))\1/i;

function extractInlineMatches(body) {
  const matches = [];
  const tags = String(body ?? "").match(IMG_TAG_REGEX) ?? [];

  for (const imgTag of tags) {
    const srcMatch = imgTag.match(DATA_URI_SRC_REGEX);
    if (!srcMatch) continue;

    const srcDataUri = srcMatch[2] ?? "";
    const base64Data = srcMatch[3] ?? "";
    const mimeMatch = srcDataUri.match(/^data:([^;]+);base64,/i);
    const mimeType = mimeMatch?.[1]?.toLowerCase() ?? "image/png";
    const altMatch = imgTag.match(/\balt\s*=\s*(["'])(.*?)\1/i);
    const altText = (altMatch?.[2] ?? "").trim();

    matches.push({
      srcDataUri,
      base64Data,
      mimeType,
      altText,
      decodedBytes: estimateBase64DecodedBytes(base64Data),
    });
  }

  return matches;
}

function rewriteBodyWithUrls(body, urls) {
  let index = 0;

  return String(body ?? "").replace(IMG_TAG_REGEX, (imgTag) => {
    const srcMatch = imgTag.match(DATA_URI_SRC_REGEX);
    if (!srcMatch) return imgTag;

    const replacement = urls[index++];
    if (!replacement) return imgTag;

    return imgTag.replace(srcMatch[2], replacement);
  });
}

async function convertArticleInlineImages(articleId, body) {
  const matches = extractInlineMatches(body);
  if (matches.length === 0) {
    return { updatedBody: String(body ?? ""), converted: 0 };
  }

  const urls = [];
  for (const match of matches) {
    const insertResult = await execute(
      `INSERT INTO images (
         article_id,
         url,
         alt_text,
         mime_type,
         data_base64,
         size_bytes,
         source_type,
         created_at,
         updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, 'inline', datetime('now'), datetime('now'))`,
      [
        articleId,
        "pending-inline-url",
        match.altText,
        match.mimeType,
        match.base64Data,
        match.decodedBytes,
      ],
    );

    const imageId = Number(insertResult.lastInsertRowid);
    const inlineUrl = `/api/inline-images/${imageId}`;

    await execute(
      "UPDATE images SET url = ?, updated_at = datetime('now') WHERE id = ?",
      [inlineUrl, imageId],
    );
    urls.push(inlineUrl);
  }

  return {
    updatedBody: rewriteBodyWithUrls(body, urls),
    converted: matches.length,
  };
}

async function main() {
  await ensureInlineSchema();

  const articlesResult = await execute(
    `SELECT id, slug, body
     FROM articles
     WHERE body LIKE '%data:image/%'
     ORDER BY id ASC`,
  );

  const rows = Array.isArray(articlesResult.rows) ? articlesResult.rows : [];

  let convertedArticles = 0;
  let convertedImages = 0;

  for (const row of rows) {
    const articleId = Number(row.id);
    const slug = String(row.slug ?? "");
    const body = String(row.body ?? "");

    const conversion = await convertArticleInlineImages(articleId, body);
    if (conversion.converted === 0) continue;

    await execute(
      "UPDATE articles SET body = ?, updated_at = datetime('now') WHERE id = ?",
      [conversion.updatedBody, articleId],
    );

    convertedArticles += 1;
    convertedImages += conversion.converted;
    console.log(
      `Converted article #${articleId}${slug ? ` (${slug})` : ""}: ${conversion.converted} inline image(s).`,
    );
  }

  console.log("");
  console.log(`Done. Articles converted: ${convertedArticles}`);
  console.log(`Done. Inline images converted: ${convertedImages}`);
}

main().catch((err) => {
  console.error("Backfill failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
