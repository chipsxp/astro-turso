import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { calcSalePrice } from "../../../lib/sales";

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// --- In-memory rate limiter: 120 requests per IP per minute (public read) ---
const readAttempts = new Map<string, { count: number; resetAt: number }>();
const READ_MAX = 120;
const READ_WINDOW_MS = 60 * 1000;

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isReadRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = readAttempts.get(ip);
  if (!entry || now > entry.resetAt) return false;
  return entry.count >= READ_MAX;
}

function recordReadAttempt(ip: string): void {
  const now = Date.now();
  const entry = readAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    readAttempts.set(ip, { count: 1, resetAt: now + READ_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

// ── GET /api/sales — public list of published postings ────────────────────────
export const GET: APIRoute = async ({ request }) => {
  const ip = getClientIp(request);
  if (isReadRateLimited(ip)) return json({ error: "Too many requests" }, 429);
  recordReadAttempt(ip);

  try {
    const result = await db.execute(
      `SELECT id, slug, title, status, price,
              promo_discount_pct, promo_start, promo_end,
              promo_label, tags, created_at, updated_at
       FROM sales_postings
       WHERE status = 'published'
       ORDER BY created_at DESC`,
    );

    // Attach cover image (first image by sort_order) for each posting
    const postings = result.rows;
    if (postings.length === 0) return json({ postings: [] }, 200);

    const ids = postings.map((p) => Number(p.id));
    const placeholders = ids.map(() => "?").join(", ");
    const imagesRes = await db.execute(
      `SELECT posting_id, url, alt_text
       FROM sales_images
       WHERE posting_id IN (${placeholders})
       ORDER BY sort_order ASC`,
      ids,
    );

    // Group cover images by posting_id (first image only)
    const coverMap: Record<number, { url: string; alt_text: string }> = {};
    for (const img of imagesRes.rows) {
      const pid = Number(img.posting_id);
      if (!coverMap[pid])
        coverMap[pid] = {
          url: String(img.url),
          alt_text: String(img.alt_text ?? ""),
        };
    }

    const enriched = postings.map((p) => ({
      ...p,
      cover_image: coverMap[Number(p.id)] ?? null,
      sale_price: calcSalePrice(p as any),
    }));

    return json({ postings: enriched }, 200);
  } catch {
    return json({ error: "Database error" }, 500);
  }
};
