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

export const DONATION_DEFAULTS = {
  title: "Support the Scriptorium",
  text: "If you enjoy our work, please consider supporting us!",
  button: "Donate via PayPal",
};

export async function getDonationConfig() {
  const [link, title, text, button] = await Promise.all([
    getSetting("donation_link"),
    getSetting("donation_title"),
    getSetting("donation_text"),
    getSetting("donation_button_label"),
  ]);
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
}
