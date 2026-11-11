import { db } from "./db";

interface CacheEntry {
  value: string | null;
  expiresAt: number;
}

const SETTING_TTL_MS = 30_000; // 30 seconds
const settingCache = new Map<string, CacheEntry>();

/**
 * Invalidate a cached setting or all settings if no key provided.
 */
export function invalidateSettingCache(key?: string): void {
  if (key) {
    settingCache.delete(key);
  } else {
    settingCache.clear();
  }
}

/**
 * Get a site setting by key with a 30s module-level cache.
 */
export async function getSetting(key: string): Promise<string | null> {
  const now = Date.now();
  const cached = settingCache.get(key);
  if (cached && now < cached.expiresAt) {
    return cached.value;
  }

  const rs = await db.execute<{ value: string }>(
    "SELECT value FROM site_settings WHERE key = ?",
    [key],
  );
  const value = rs.rows.length === 0 ? null : String(rs.rows[0].value);
  settingCache.set(key, { value, expiresAt: now + SETTING_TTL_MS });
  return value;
}

/**
 * Fetch multiple settings in a single query, reusing cached values when valid.
 */
export async function getSettings(
  keys: string[],
): Promise<Record<string, string | null>> {
  const now = Date.now();
  const result: Record<string, string | null> = {};
  const missingKeys: string[] = [];

  for (const key of keys) {
    const cached = settingCache.get(key);
    if (cached && now < cached.expiresAt) {
      result[key] = cached.value;
    } else {
      missingKeys.push(key);
    }
  }

  if (missingKeys.length > 0) {
    const placeholders = missingKeys.map(() => "?").join(", ");
    const rs = await db.execute<{ key: string; value: string }>(
      `SELECT key, value FROM site_settings WHERE key IN (${placeholders})`,
      missingKeys,
    );
    const found = new Map<string, string>();
    for (const row of rs.rows) {
      found.set(String(row.key), String(row.value));
    }
    for (const key of missingKeys) {
      const value = found.has(key) ? found.get(key)! : null;
      settingCache.set(key, { value, expiresAt: now + SETTING_TTL_MS });
      result[key] = value;
    }
  }

  return result;
}

/**
 * Donation placements are stored comma-separated in `donation_placement`.
 * A legacy single value still parses correctly.
 */
export async function getDonationPlacements(): Promise<string[]> {
  const raw = (await getSetting("donation_placement")) || "footer";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const DONATION_DEFAULTS = {
  title: "Support the Scriptorium",
  text: "If you enjoy our work, please consider supporting us!",
  button: "Donate via PayPal",
};

export async function getDonationConfig() {
  const settings = await getSettings([
    "donation_link",
    "donation_title",
    "donation_text",
    "donation_button_label",
  ]);
  const link = settings["donation_link"];
  const title = settings["donation_title"];
  const text = settings["donation_text"];
  const button = settings["donation_button_label"];

  return {
    link:
      link || process.env.PAYPAL_DONATION_LINK || "https://www.paypal.com/donate",
    title: title || DONATION_DEFAULTS.title,
    text: text || DONATION_DEFAULTS.text,
    button: button || DONATION_DEFAULTS.button,
  };
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
  invalidateSettingCache(key);
}
