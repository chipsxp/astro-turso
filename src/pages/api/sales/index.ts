import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { calcSalePrice } from "../../../lib/sales";
import { json } from "../../../lib/api-response";
import { createRateLimiter, getClientIp } from "../../../lib/rate-limit";

// --- In-memory rate limiter: 120 requests per IP per minute (public read) ---
const readLimiter = createRateLimiter({ limit: 120, windowMs: 60 * 1000 });

// ── GET /api/sales — public list of published postings ────────────────────────
export const GET: APIRoute = async ({ request }) => {
  const ip = getClientIp(request);
  if (readLimiter.limited(ip)) return json({ error: "Too many requests" }, 429);
  readLimiter.record(ip);

  interface SalesPostingRow {
    id: number | string;
    slug: string;
    title: string;
    status: string;
    price: number | null;
    promo_discount_pct: number | null;
    promo_start: string | null;
    promo_end: string | null;
    promo_label: string | null;
    tags: string;
    created_at: string;
    updated_at: string;
  }

  try {
    const result = await db.execute<SalesPostingRow>(
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

    const ids = postings.map((p: SalesPostingRow) => Number(p.id));
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
          alt_text: String(img.alt_text || ""),
        };
    }

    const enriched = postings.map((p: SalesPostingRow) => ({
      ...p,
      cover_image: coverMap[Number(p.id)] || null,
      sale_price: calcSalePrice(p as import("../../../lib/sales").SalesPosting),
    }));

    return json({ postings: enriched }, 200);
  } catch {
    return json({ error: "Database error" }, 500);
  }
};
