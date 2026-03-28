import { db } from "./db";

export type MediaResourceType = "image" | "video";

export const UPLOAD_SESSION_TTL_SECONDS = 2 * 60 * 60;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB

export interface MediaRecord {
  id: number;
  article_id: number;
  resource_type: MediaResourceType;
  public_id: string | null;
  url: string;
  alt_text: string;
  format: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  created_at: string;
}

export interface UploadSessionRecord {
  id: string;
  user_id: number;
  created_at: string;
  expires_at: string;
  consumed_at: string | null;
}

export interface SessionMediaRecord {
  id: number;
  upload_session_id: string;
  resource_type: MediaResourceType;
  public_id: string | null;
  url: string;
  alt_text: string;
  format: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  created_at: string;
}

export const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export const VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
]);

const MEDIA_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY,
    article_id INTEGER NOT NULL,
    resource_type TEXT NOT NULL,
    public_id TEXT,
    url TEXT NOT NULL,
    alt_text TEXT NOT NULL,
    format TEXT,
    width INTEGER,
    height INTEGER,
    duration REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE
  )
`;

const MEDIA_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_media_article_id
  ON media(article_id)
`;

const UPLOAD_SESSIONS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS upload_sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    consumed_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`;

const UPLOAD_SESSIONS_EXPIRES_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_upload_sessions_expires_at
  ON upload_sessions(expires_at)
`;

const UPLOAD_SESSION_MEDIA_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS upload_session_media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    upload_session_id TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    public_id TEXT,
    url TEXT NOT NULL,
    alt_text TEXT NOT NULL,
    format TEXT,
    width INTEGER,
    height INTEGER,
    duration REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(upload_session_id) REFERENCES upload_sessions(id) ON DELETE CASCADE
  )
`;

const UPLOAD_SESSION_MEDIA_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_upload_session_media_session_id
  ON upload_session_media(upload_session_id)
`;

let mediaSchemaReady = false;
let uploadSessionSchemaReady = false;

export function getResourceTypeFromMimeType(
  mimeType: string,
): MediaResourceType | null {
  if (IMAGE_MIME_TYPES.has(mimeType)) return "image";
  if (VIDEO_MIME_TYPES.has(mimeType)) return "video";
  return null;
}

function mapMediaRow(row: Record<string, unknown>): MediaRecord {
  return {
    id: Number(row.id),
    article_id: Number(row.article_id),
    resource_type: row.resource_type === "video" ? "video" : "image",
    public_id: row.public_id ? String(row.public_id) : null,
    url: String(row.url),
    alt_text: String(row.alt_text),
    format: row.format ? String(row.format) : null,
    width: row.width == null ? null : Number(row.width),
    height: row.height == null ? null : Number(row.height),
    duration: row.duration == null ? null : Number(row.duration),
    created_at: String(row.created_at),
  };
}

function mapUploadSessionRow(
  row: Record<string, unknown>,
): UploadSessionRecord {
  return {
    id: String(row.id),
    user_id: Number(row.user_id),
    created_at: String(row.created_at),
    expires_at: String(row.expires_at),
    consumed_at: row.consumed_at == null ? null : String(row.consumed_at),
  };
}

function mapSessionMediaRow(row: Record<string, unknown>): SessionMediaRecord {
  return {
    id: Number(row.id),
    upload_session_id: String(row.upload_session_id),
    resource_type: row.resource_type === "video" ? "video" : "image",
    public_id: row.public_id ? String(row.public_id) : null,
    url: String(row.url),
    alt_text: String(row.alt_text),
    format: row.format ? String(row.format) : null,
    width: row.width == null ? null : Number(row.width),
    height: row.height == null ? null : Number(row.height),
    duration: row.duration == null ? null : Number(row.duration),
    created_at: String(row.created_at),
  };
}

export async function ensureMediaTable(): Promise<void> {
  if (mediaSchemaReady) return;

  await db.execute(MEDIA_TABLE_SQL);
  await db.execute(MEDIA_INDEX_SQL);
  await db.execute(
    `INSERT OR IGNORE INTO media (
        id,
        article_id,
        resource_type,
        url,
        alt_text,
        created_at
      )
      SELECT id, article_id, 'image', url, alt_text, created_at
      FROM images`,
  );

  mediaSchemaReady = true;
}

export async function ensureUploadSessionSchema(): Promise<void> {
  if (uploadSessionSchemaReady) return;

  await db.execute(UPLOAD_SESSIONS_TABLE_SQL);
  await db.execute(UPLOAD_SESSIONS_EXPIRES_INDEX_SQL);
  await db.execute(UPLOAD_SESSION_MEDIA_TABLE_SQL);
  await db.execute(UPLOAD_SESSION_MEDIA_INDEX_SQL);

  uploadSessionSchemaReady = true;
}

export async function getMediaByArticle(
  articleId: number,
): Promise<MediaRecord[]> {
  await ensureMediaTable();

  const result = await db.execute(
    `SELECT id, article_id, resource_type, public_id, url, alt_text,
            format, width, height, duration, created_at
     FROM media
     WHERE article_id = ?
     ORDER BY id ASC`,
    [articleId],
  );

  return result.rows.map((row: Record<string, unknown>) => mapMediaRow(row));
}

export async function deleteMediaByArticle(articleId: number): Promise<void> {
  await ensureMediaTable();
  await db.execute("DELETE FROM media WHERE article_id = ?", [articleId]);
}

export async function createUploadSession(
  userId: number,
): Promise<UploadSessionRecord> {
  await ensureUploadSessionSchema();

  const sessionId = crypto.randomUUID();
  await db.execute(
    `INSERT INTO upload_sessions (id, user_id, expires_at)
     VALUES (?, ?, datetime('now', '+${UPLOAD_SESSION_TTL_SECONDS} seconds'))`,
    [sessionId, userId],
  );

  const session = await getUploadSessionForUser(sessionId, userId);
  if (!session) {
    throw new Error("Failed to create upload session");
  }

  return session;
}

export async function getUploadSessionForUser(
  sessionId: string,
  userId: number,
): Promise<UploadSessionRecord | null> {
  await ensureUploadSessionSchema();

  const result = await db.execute(
    `SELECT id, user_id, created_at, expires_at, consumed_at
     FROM upload_sessions
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [sessionId, userId],
  );

  const row = result.rows[0] as Record<string, unknown> | undefined;
  return row ? mapUploadSessionRow(row) : null;
}

export async function getActiveUploadSessionForUser(
  sessionId: string,
  userId: number,
): Promise<UploadSessionRecord | null> {
  await ensureUploadSessionSchema();

  const result = await db.execute(
    `SELECT id, user_id, created_at, expires_at, consumed_at
     FROM upload_sessions
     WHERE id = ?
       AND user_id = ?
       AND consumed_at IS NULL
       AND datetime(expires_at) >= datetime('now')
     LIMIT 1`,
    [sessionId, userId],
  );

  const row = result.rows[0] as Record<string, unknown> | undefined;
  return row ? mapUploadSessionRow(row) : null;
}

export async function addUploadSessionMedia(input: {
  upload_session_id: string;
  resource_type: MediaResourceType;
  public_id: string | null;
  url: string;
  alt_text: string;
  format?: string | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
}): Promise<SessionMediaRecord> {
  await ensureUploadSessionSchema();

  const result = await db.execute(
    `INSERT INTO upload_session_media (
       upload_session_id, resource_type, public_id, url, alt_text,
       format, width, height, duration
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.upload_session_id,
      input.resource_type,
      input.public_id,
      input.url,
      input.alt_text,
      input.format ?? null,
      input.width ?? null,
      input.height ?? null,
      input.duration ?? null,
    ],
  );

  const mediaId = Number(result.lastInsertRowid);
  const mediaResult = await db.execute(
    `SELECT id, upload_session_id, resource_type, public_id, url, alt_text,
            format, width, height, duration, created_at
     FROM upload_session_media
     WHERE id = ?
     LIMIT 1`,
    [mediaId],
  );

  const row = mediaResult.rows[0] as Record<string, unknown> | undefined;
  if (!row) {
    throw new Error("Failed to read uploaded session media");
  }

  return mapSessionMediaRow(row);
}

export async function listUploadSessionMedia(
  sessionId: string,
): Promise<SessionMediaRecord[]> {
  await ensureUploadSessionSchema();

  const result = await db.execute(
    `SELECT id, upload_session_id, resource_type, public_id, url, alt_text,
            format, width, height, duration, created_at
     FROM upload_session_media
     WHERE upload_session_id = ?
     ORDER BY id ASC`,
    [sessionId],
  );

  return result.rows.map((row: Record<string, unknown>) =>
    mapSessionMediaRow(row),
  );
}

export async function attachUploadSessionMediaToArticle(
  sessionId: string,
  articleId: number,
): Promise<number> {
  await ensureMediaTable();
  await ensureUploadSessionSchema();

  const mediaRows = await listUploadSessionMedia(sessionId);
  if (!mediaRows.length) return 0;

  for (const item of mediaRows) {
    await db.execute(
      `INSERT INTO media (
         article_id, resource_type, public_id, url, alt_text,
         format, width, height, duration
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        articleId,
        item.resource_type,
        item.public_id,
        item.url,
        item.alt_text,
        item.format,
        item.width,
        item.height,
        item.duration,
      ],
    );
  }

  await db.execute(
    "DELETE FROM upload_session_media WHERE upload_session_id = ?",
    [sessionId],
  );

  return mediaRows.length;
}

export async function markUploadSessionConsumed(
  sessionId: string,
): Promise<void> {
  await ensureUploadSessionSchema();
  await db.execute(
    `UPDATE upload_sessions
     SET consumed_at = datetime('now')
     WHERE id = ? AND consumed_at IS NULL`,
    [sessionId],
  );
}

export async function listExpiredUnconsumedUploadSessions(): Promise<
  UploadSessionRecord[]
> {
  await ensureUploadSessionSchema();

  const result = await db.execute(
    `SELECT id, user_id, created_at, expires_at, consumed_at
     FROM upload_sessions
     WHERE consumed_at IS NULL
       AND datetime(expires_at) < datetime('now')
     ORDER BY expires_at ASC`,
  );

  return result.rows.map((row: Record<string, unknown>) =>
    mapUploadSessionRow(row),
  );
}

export async function listUnconsumedUploadSessions(): Promise<
  UploadSessionRecord[]
> {
  await ensureUploadSessionSchema();

  const result = await db.execute(
    `SELECT id, user_id, created_at, expires_at, consumed_at
     FROM upload_sessions
     WHERE consumed_at IS NULL
     ORDER BY created_at ASC`,
  );

  return result.rows.map((row: Record<string, unknown>) =>
    mapUploadSessionRow(row),
  );
}

export async function deleteUploadSession(sessionId: string): Promise<void> {
  await ensureUploadSessionSchema();
  await db.execute("DELETE FROM upload_sessions WHERE id = ?", [sessionId]);
}
