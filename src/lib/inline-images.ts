import { db } from "./db";

const IMG_TAG_REGEX = /<img\b[^>]*>/gi;
const DATA_URI_SRC_REGEX =
  /\bsrc\s*=\s*(["'])(data:image\/[a-z0-9.+-]+;base64,([A-Za-z0-9+/=\r\n]+))\1/i;
const ALT_ATTR_REGEX = /\balt\s*=\s*(["'])(.*?)\1/i;
const INLINE_IMAGE_ID_REGEX = /\/api\/inline-images\/(\d+)/g;

let inlineImagesSchemaReady = false;

interface InlineImageMatch {
  imgTag: string;
  srcDataUri: string;
  mimeType: string;
  base64Data: string;
  altText: string;
  decodedBytes: number;
}

interface StoredInlineImage {
  id: number;
  url: string;
}

function estimateBase64DecodedBytes(base64Data: string): number {
  const normalized = base64Data.replace(/\s+/g, "");
  const padding = normalized.endsWith("==")
    ? 2
    : normalized.endsWith("=")
      ? 1
      : 0;

  return Math.max(0, Math.floor((normalized.length * 3) / 4) - padding);
}

function columnExistsError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err ?? "");
  return (
    message.includes("duplicate column name") ||
    message.includes("already exists")
  );
}

async function ensureColumn(columnSql: string): Promise<void> {
  try {
    await db.execute(`ALTER TABLE images ADD COLUMN ${columnSql}`);
  } catch (err) {
    if (!columnExistsError(err)) {
      throw err;
    }
  }
}

export async function ensureInlineImagesSchema(): Promise<void> {
  if (inlineImagesSchemaReady) return;

  await db.execute(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      alt_text TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await ensureColumn("mime_type TEXT");
  await ensureColumn("data_base64 TEXT");
  await ensureColumn("size_bytes INTEGER");
  await ensureColumn("source_type TEXT NOT NULL DEFAULT 'legacy'");
  await ensureColumn("updated_at TEXT");

  await db.execute(
    "CREATE INDEX IF NOT EXISTS idx_images_article_id ON images(article_id)",
  );
  await db.execute(
    "CREATE INDEX IF NOT EXISTS idx_images_source_article ON images(source_type, article_id)",
  );

  inlineImagesSchemaReady = true;
}

function extractInlineImageMatches(body: string): InlineImageMatch[] {
  const matches: InlineImageMatch[] = [];
  const imgTags = body.match(IMG_TAG_REGEX) ?? [];

  for (const imgTag of imgTags) {
    const srcMatch = imgTag.match(DATA_URI_SRC_REGEX);
    if (!srcMatch) continue;

    const srcDataUri = srcMatch[2] ?? "";
    const mimeTypeMatch = srcDataUri.match(/^data:([^;]+);base64,/i);
    const mimeType = mimeTypeMatch?.[1]?.toLowerCase() ?? "image/png";
    const base64Data = srcMatch[3] ?? "";
    const altTextMatch = imgTag.match(ALT_ATTR_REGEX);
    const altText = (altTextMatch?.[2] ?? "").trim();

    matches.push({
      imgTag,
      srcDataUri,
      mimeType,
      base64Data,
      altText,
      decodedBytes: estimateBase64DecodedBytes(base64Data),
    });
  }

  return matches;
}

function rewriteInlineImageSrcs(
  body: string,
  replacements: StoredInlineImage[],
): string {
  let index = 0;

  return body.replace(IMG_TAG_REGEX, (imgTag) => {
    const srcMatch = imgTag.match(DATA_URI_SRC_REGEX);
    if (!srcMatch) return imgTag;

    const replacement = replacements[index++];
    if (!replacement) return imgTag;

    return imgTag.replace(srcMatch[2], replacement.url);
  });
}

export function extractInlineImageIdsFromBody(body: string): number[] {
  const ids = new Set<number>();

  for (const match of body.matchAll(INLINE_IMAGE_ID_REGEX)) {
    const id = Number(match[1]);
    if (Number.isInteger(id) && id > 0) {
      ids.add(id);
    }
  }

  return [...ids];
}

export async function persistInlineImagesInBody(
  articleId: number,
  body: string,
): Promise<{ body: string; createdInlineImageIds: number[] }> {
  await ensureInlineImagesSchema();

  const inlineMatches = extractInlineImageMatches(body);
  if (inlineMatches.length === 0) {
    return { body, createdInlineImageIds: [] };
  }

  const replacements: StoredInlineImage[] = [];
  const createdInlineImageIds: number[] = [];

  for (const match of inlineMatches) {
    const insertResult = await db.execute(
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

    await db.execute(
      "UPDATE images SET url = ?, updated_at = datetime('now') WHERE id = ?",
      [inlineUrl, imageId],
    );

    replacements.push({ id: imageId, url: inlineUrl });
    createdInlineImageIds.push(imageId);
  }

  return {
    body: rewriteInlineImageSrcs(body, replacements),
    createdInlineImageIds,
  };
}

export async function cleanupUnusedInlineImages(
  articleId: number,
  body: string,
): Promise<void> {
  await ensureInlineImagesSchema();

  const referencedIds = extractInlineImageIdsFromBody(body);

  if (referencedIds.length === 0) {
    await db.execute(
      "DELETE FROM images WHERE article_id = ? AND source_type = 'inline'",
      [articleId],
    );
    return;
  }

  const placeholders = referencedIds.map(() => "?").join(", ");
  await db.execute(
    `DELETE FROM images
     WHERE article_id = ?
       AND source_type = 'inline'
       AND id NOT IN (${placeholders})`,
    [articleId, ...referencedIds],
  );
}

export async function deleteInlineImagesByIds(ids: number[]): Promise<void> {
  if (ids.length === 0) return;

  await ensureInlineImagesSchema();

  const safeIds = ids.filter((id) => Number.isInteger(id) && id > 0);
  if (safeIds.length === 0) return;

  const placeholders = safeIds.map(() => "?").join(", ");
  await db.execute(
    `DELETE FROM images
     WHERE source_type = 'inline'
       AND id IN (${placeholders})`,
    safeIds,
  );
}

export async function getInlineImageById(id: number): Promise<{
  id: number;
  mimeType: string;
  base64Data: string;
  updatedAt: string;
} | null> {
  await ensureInlineImagesSchema();

  const result = await db.execute(
    `SELECT id, mime_type, data_base64,
            COALESCE(updated_at, created_at, datetime('now')) AS updated_at
     FROM images
     WHERE id = ? AND source_type = 'inline'
     LIMIT 1`,
    [id],
  );

  const row = result.rows[0] as Record<string, unknown> | undefined;
  if (!row) return null;

  const mimeType = String(row.mime_type ?? "").trim();
  const base64Data = String(row.data_base64 ?? "").trim();
  if (!mimeType || !base64Data) return null;

  return {
    id: Number(row.id),
    mimeType,
    base64Data,
    updatedAt: String(row.updated_at ?? ""),
  };
}
