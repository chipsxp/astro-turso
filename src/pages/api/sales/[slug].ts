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

// ── GET /api/sales/[slug] — public single posting detail ─────────────────────
export const GET: APIRoute = async ({ params, request }) => {
  const { slug } = params;

  const ip = getClientIp(request);
  if (isReadRateLimited(ip)) return json({ error: "Too many requests" }, 429);
  recordReadAttempt(ip);

  try {
    const result = await db.execute(
      `SELECT sp.*
       FROM sales_postings sp
       WHERE sp.slug = ? AND sp.status = 'published'`,
      [slug],
    );
    if (!result.rows.length) return json({ error: "Not found" }, 404);
    const posting = result.rows[0] as any;

    const [imagesRes, testimonialsRes, reviewsRes] = await Promise.all([
      db.execute(
        "SELECT * FROM sales_images WHERE posting_id = ? ORDER BY sort_order ASC",
        [Number(posting.id)],
      ),
      db.execute(
        "SELECT * FROM sales_testimonials WHERE posting_id = ? ORDER BY sort_order ASC",
        [Number(posting.id)],
      ),
      db.execute(
        "SELECT * FROM sales_reviews WHERE posting_id = ? ORDER BY sort_order ASC",
        [Number(posting.id)],
      ),
    ]);

    // Compute average rating
    const reviews = reviewsRes.rows as any[];
    const ratingsWithValue = reviews.filter((r) => r.rating != null);
    const avg_rating =
      ratingsWithValue.length > 0
        ? ratingsWithValue.reduce((sum, r) => sum + Number(r.rating), 0) /
          ratingsWithValue.length
        : null;

    return json(
      {
        posting: {
          ...posting,
          sale_price: calcSalePrice(posting),
        },
        images: imagesRes.rows,
        testimonials: testimonialsRes.rows,
        reviews,
        avg_rating:
          avg_rating != null ? parseFloat(avg_rating.toFixed(1)) : null,
      },
      200,
    );
  } catch {
    return json({ error: "Database error" }, 500);
  }
};
