import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import {
  calcSalePrice,
  type SalesPosting,
  type SalesImage,
  type SalesTestimonial,
  type SalesReview,
} from "../../../lib/sales";
import { json } from "../../../lib/api-response";
import { createRateLimiter, getClientIp } from "../../../lib/rate-limit";

// --- In-memory rate limiter: 120 requests per IP per minute (public read) ---
const readLimiter = createRateLimiter({ limit: 120, windowMs: 60 * 1000 });

// ── GET /api/sales/[slug] — public single posting detail ─────────────────────
export const GET: APIRoute = async ({ params, request }) => {
  const { slug } = params;

  const ip = getClientIp(request);
  if (readLimiter.limited(ip)) return json({ error: "Too many requests" }, 429);
  readLimiter.record(ip);

  try {
    const result = await db.execute<SalesPosting>(
      `SELECT sp.id, sp.slug, sp.author_id, sp.title, sp.body, sp.status,
              sp.tags, sp.promo_label, sp.promo_discount_pct, sp.promo_start,
              sp.promo_end, sp.paypal_button_html, sp.linked_article_slug,
              sp.created_at, sp.updated_at, sp.price, sp.qr_code_url,
              sp.paypal_link, sp.venmo_link, sp.cashapp_link
       FROM sales_postings sp
       WHERE sp.slug = ? AND sp.status = 'published'`,
      [slug],
    );
    if (!result.rows.length) return json({ error: "Not found" }, 404);
    const posting = result.rows[0];

    const [imagesRes, testimonialsRes, reviewsRes] = await Promise.all([
      db.execute<SalesImage>(
        `SELECT id, posting_id, url, alt_text, source, sort_order, created_at,
                public_id, transforms
         FROM sales_images WHERE posting_id = ? ORDER BY sort_order ASC`,
        [Number(posting.id)],
      ),
      db.execute<SalesTestimonial>(
        `SELECT id, posting_id, author_name, quote, rating, sort_order, created_at
         FROM sales_testimonials WHERE posting_id = ? ORDER BY sort_order ASC`,
        [Number(posting.id)],
      ),
      db.execute<SalesReview>(
        `SELECT id, posting_id, reviewer_name, review_text, rating, is_verified,
                review_date, sort_order, created_at
         FROM sales_reviews WHERE posting_id = ? ORDER BY sort_order ASC`,
        [Number(posting.id)],
      ),
    ]);

    // Compute average rating
    const reviews = reviewsRes.rows;
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
