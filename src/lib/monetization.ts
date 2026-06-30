import { db } from "./db";

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
export async function getActiveAdsForSlot(slotType: string): Promise<Advertisement[]> {
  const rs = await db.execute<{ id: number; business_name: string; description: string | null; image_url: string | null; target_url: string | null; coupon_code: string | null; slot_type: string; is_active: number; created_at: number }>(
    "SELECT * FROM advertisements WHERE slot_type = ? AND is_active = 1",
    [slotType]
  );
  
  if (rs.rows.length === 0) return [];
  
  return rs.rows.map(row => ({
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
  userId: number | null
): Promise<void> {
  await db.execute(
    `INSERT INTO analytics_events 
          (event_type, target_type, target_id, page_path, user_id) 
          VALUES (?, ?, ?, ?, ?)`,
    [eventType, targetType, targetId, pagePath, userId]
  );
}

/**
 * Calculates the gamification points/stats for a given user based on their shares and subsequent clicks.
 */
export async function getUserGamificationStats(userId: number): Promise<{ totalShares: number; totalClicksGenerated: number }> {
  // 1. Get total shares by this user
  const sharesRs = await db.execute<{ count: number }>(
    "SELECT COUNT(*) as count FROM shares WHERE user_id = ?",
    [userId]
  );
  const totalShares = Number(sharesRs.rows[0]?.count || 0);

  // 2. We can estimate clicks generated. For now, we'll return 0 until we wire up link tracking to shares
  // If we track a share ID in the URL (e.g. ?ref=shareId), we could count it.
  const totalClicksGenerated = 0; 

  return { totalShares, totalClicksGenerated };
}
