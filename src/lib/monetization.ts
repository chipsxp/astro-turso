import { db } from "./db";
import {
  IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
  estimateBase64DecodedBytes,
  parseDataUri,
} from "./media";

export interface Advertisement {
  id: number;
  business_name: string;
  description: string | null;
  image_url: string | null;
  target_url: string | null;
  coupon_code: string | null;
  slot_type: string;
  is_active: number; // 0 or 1
  created_at: number;
}

// ── Advertisement validation ────────────────────────────────────────────────

export const AD_SLOT_TYPES = new Set([
  "dashboard_sidebar",
  "article_index_top",
  "shop_index_top",
  "footer",
  "homepage_grid",
  "event_index_top",
  "hidden",
]);

export const MAX_AD_TARGET_URL_LENGTH = 2_048;
export const AD_TEXT_LIMITS = {
  business_name: 120,
  description: 500,
  coupon_code: 64,
} as const;

export interface AdValidationError {
  error: string;
  status: number;
}

// Ads render target_url as a public href, so only HTTPS URLs are acceptable.
export function isValidAdTargetUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const link = value.trim();
  if (!link || link.length > MAX_AD_TARGET_URL_LENGTH) return false;
  try {
    return new URL(link).protocol === "https:";
  } catch {
    return false;
  }
}

// Shared field validation for POST /api/admin/ads and PUT /api/admin/ads/[id].
// Required-field presence stays in the routes; this checks values and lengths.
export function validateAdFields(payload: {
  business_name?: unknown;
  description?: unknown;
  target_url?: unknown;
  coupon_code?: unknown;
  slot_type?: unknown;
}): AdValidationError | null {
  if (
    typeof payload.business_name !== "string" ||
    payload.business_name.trim().length > AD_TEXT_LIMITS.business_name
  ) {
    return {
      error: "business_name must be a string of 120 characters or fewer",
      status: 400,
    };
  }
  if (
    payload.description != null &&
    (typeof payload.description !== "string" ||
      payload.description.length > AD_TEXT_LIMITS.description)
  ) {
    return {
      error: "description must be a string of 500 characters or fewer",
      status: 400,
    };
  }
  if (
    payload.coupon_code != null &&
    (typeof payload.coupon_code !== "string" ||
      payload.coupon_code.length > AD_TEXT_LIMITS.coupon_code)
  ) {
    return {
      error: "coupon_code must be a string of 64 characters or fewer",
      status: 400,
    };
  }
  if (!isValidAdTargetUrl(payload.target_url)) {
    return {
      error: "target_url must be a valid HTTPS URL (max 2048 characters)",
      status: 400,
    };
  }
  if (
    typeof payload.slot_type !== "string" ||
    !AD_SLOT_TYPES.has(payload.slot_type)
  ) {
    return { error: "Invalid slot type", status: 400 };
  }
  return null;
}

// Ad images arrive as base64 data URIs; enforce the same limits as other uploads.
export function validateAdImageData(
  imageData: unknown,
): AdValidationError | null {
  const parsed = typeof imageData === "string" ? parseDataUri(imageData) : null;
  if (!parsed) {
    return { error: "image_data must be a valid base64 data URI", status: 400 };
  }
  if (!IMAGE_MIME_TYPES.has(parsed.mimeType)) {
    return {
      error: "Unsupported image type. Allowed: jpeg, png, webp, gif, avif",
      status: 415,
    };
  }
  if (estimateBase64DecodedBytes(parsed.base64Payload) > MAX_IMAGE_BYTES) {
    return { error: "Ad image is too large (max 10 MB).", status: 413 };
  }
  return null;
}

export interface AnalyticsEvent {
  id: number;
  event_type: string;
  target_type: string;
  target_id: number | null;
  page_path: string;
  user_id: number | null;
  created_at: number;
}

/**
 * Gets all active ads for a specific slot.
 */
export async function getActiveAdsForSlot(
  slotType: string,
): Promise<Advertisement[]> {
  const rs = await db.execute<{
    id: number;
    business_name: string;
    description: string | null;
    image_url: string | null;
    target_url: string | null;
    coupon_code: string | null;
    slot_type: string;
    is_active: number;
    created_at: number;
  }>("SELECT * FROM advertisements WHERE slot_type = ? AND is_active = 1", [
    slotType,
  ]);

  if (rs.rows.length === 0) return [];

  return rs.rows.map((row) => ({
    id: Number(row.id),
    business_name: String(row.business_name),
    description: row.description ? String(row.description) : null,
    image_url: row.image_url ? String(row.image_url) : null,
    target_url: row.target_url ? String(row.target_url) : null,
    coupon_code: row.coupon_code ? String(row.coupon_code) : null,
    slot_type: String(row.slot_type),
    is_active: Number(row.is_active),
    created_at: Number(row.created_at),
  }));
}

/**
 * Logs an analytics event.
 */
export async function logAnalyticsEvent(
  eventType: string,
  targetType: string,
  targetId: number | null,
  pagePath: string,
  userId: number | null,
): Promise<void> {
  await db.execute(
    `INSERT INTO analytics_events 
          (event_type, target_type, target_id, page_path, user_id) 
          VALUES (?, ?, ?, ?, ?)`,
    [eventType, targetType, targetId, pagePath, userId],
  );
}

/**
 * Calculates the gamification points/stats for a given user based on their shares and subsequent clicks.
 */
export async function getUserGamificationStats(
  userId: number,
): Promise<{ totalShares: number; totalClicksGenerated: number }> {
  // 1. Get total shares by this user
  const sharesRs = await db.execute<{ count: number }>(
    "SELECT COUNT(*) as count FROM shares WHERE user_id = ?",
    [userId],
  );
  const totalShares = Number(sharesRs.rows[0]?.count || 0);

  // 2. We can estimate clicks generated. For now, we'll return 0 until we wire up link tracking to shares
  // If we track a share ID in the URL (e.g. ?ref=shareId), we could count it.
  const totalClicksGenerated = 0;

  return { totalShares, totalClicksGenerated };
}

export interface TopSharer {
  id: number;
  email: string;
  shareCount: number;
}

/**
 * Gets the user who generated the most shares in the current month.
 */
export async function getTopSharerOfMonth(): Promise<TopSharer | null> {
  const rs = await db.execute<{
    id: number;
    email: string;
    share_count: number;
  }>(
    `SELECT u.id, u.email, COUNT(s.id) as share_count 
     FROM shares s 
     JOIN users u ON s.user_id = u.id 
     WHERE datetime(s.shared_at, 'unixepoch') >= datetime('now', 'start of month') 
     GROUP BY u.id 
     ORDER BY share_count DESC 
     LIMIT 1`,
  );

  if (rs.rows.length === 0) return null;

  const row = rs.rows[0];
  return {
    id: Number(row.id),
    email: String(row.email),
    shareCount: Number(row.share_count),
  };
}

/**
 * Checks if a given user is the current top sharer of the month.
 */
export async function isTopSharerOfMonth(userId: number): Promise<boolean> {
  const topSharer = await getTopSharerOfMonth();
  if (!topSharer) return false;
  return topSharer.id === userId;
}
