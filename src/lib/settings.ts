import { db } from "./db";

/**
 * Get a site setting by key.
 */
export async function getSetting(key: string): Promise<string | null> {
  const rs = await db.execute<{ value: string }>(
    "SELECT value FROM site_settings WHERE key = ?",
    [key],
  );
  if (rs.rows.length === 0) return null;
  return String(rs.rows[0].value);
}

/**
 * Set a site setting by key.
 */
export async function setSetting(key: string, value: string): Promise<void> {
  await db.execute(
    `INSERT INTO site_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = unixepoch()`,
    [key, value],
  );
}
