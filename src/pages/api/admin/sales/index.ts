import type { APIRoute } from "astro";
import { db } from "../../../../lib/db";
import { MAX_BODY_BYTES, slugify } from "../../../../lib/sales";
import { sanitizeArticleBodyServer } from "../../../../lib/sanitize-server";

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ── GET /api/admin/sales — list postings (admin: all, author: own) ────────────
export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user!;
  const isAdmin = user.role === "admin";

  try {
    const result = await db.execute(
      isAdmin
        ? `SELECT sp.*, u.email AS author_email
           FROM sales_postings sp
           LEFT JOIN users u ON u.id = sp.author_id
           ORDER BY sp.created_at DESC`
        : `SELECT sp.*, u.email AS author_email
           FROM sales_postings sp
           LEFT JOIN users u ON u.id = sp.author_id
           WHERE sp.author_id = ?
           ORDER BY sp.created_at DESC`,
      isAdmin ? [] : [Number(user.id)],
    );
    return json({ postings: result.rows }, 200);
  } catch {
    return json({ error: "Database error" }, 500);
  }
};

// ── POST /api/admin/sales — create a new sales posting ───────────────────────
export const POST: APIRoute = async ({ locals, request }) => {
  const user = locals.user!;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const title = String(body.title ?? "").trim();
  if (!title) return json({ error: "Title is required" }, 400);

  const rawBody = String(body.body ?? "");
  if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
    return json({ error: "Body content is too large (max 1.75 MB)" }, 400);
  }
  const sanitizedBody = sanitizeArticleBodyServer(rawBody);

  // Slug: use provided or derive from title
  let slug = body.slug ? String(body.slug).trim() : slugify(title);
  if (!slug) slug = slugify(title);

  const status = body.status === "published" ? "published" : "draft";
  const etsy_listing_id = body.etsy_listing_id
    ? String(body.etsy_listing_id)
    : null;
  const etsy_listing_url = body.etsy_listing_url
    ? String(body.etsy_listing_url)
    : null;
  const etsy_price_amount =
    typeof body.etsy_price_amount === "number" ? body.etsy_price_amount : null;
  const etsy_price_divisor =
    typeof body.etsy_price_divisor === "number" ? body.etsy_price_divisor : 100;
  const etsy_price_currency = body.etsy_price_currency
    ? String(body.etsy_price_currency)
    : "USD";
  const etsy_quantity =
    typeof body.etsy_quantity === "number" ? body.etsy_quantity : null;
  const tags = Array.isArray(body.tags) ? JSON.stringify(body.tags) : "[]";
  const promo_label = body.promo_label ? String(body.promo_label) : null;
  const promo_discount_pct =
    typeof body.promo_discount_pct === "number"
      ? body.promo_discount_pct
      : null;
  const promo_start = body.promo_start ? String(body.promo_start) : null;
  const promo_end = body.promo_end ? String(body.promo_end) : null;
  const paypal_button_html = body.paypal_button_html
    ? String(body.paypal_button_html)
    : null;
  const linked_article_slug = body.linked_article_slug
    ? String(body.linked_article_slug)
    : null;

  try {
    // Check slug uniqueness
    const existing = await db.execute(
      "SELECT id FROM sales_postings WHERE slug = ?",
      [slug],
    );
    if (existing.rows.length > 0) {
      return json(
        { error: "A sales posting with this slug already exists." },
        409,
      );
    }

    const result = await db.execute(
      `INSERT INTO sales_postings
        (slug, author_id, title, body, status,
         etsy_listing_id, etsy_listing_url,
         etsy_price_amount, etsy_price_divisor, etsy_price_currency, etsy_quantity,
         tags, promo_label, promo_discount_pct, promo_start, promo_end,
         paypal_button_html, linked_article_slug)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug,
        Number(user.id),
        title,
        sanitizedBody,
        status,
        etsy_listing_id,
        etsy_listing_url,
        etsy_price_amount,
        etsy_price_divisor,
        etsy_price_currency,
        etsy_quantity,
        tags,
        promo_label,
        promo_discount_pct,
        promo_start,
        promo_end,
        paypal_button_html,
        linked_article_slug,
      ],
    );

    const newId = Number(result.lastInsertRowid);

    // Insert images if provided
    const images: Array<{
      url: string;
      alt_text?: string;
      source?: string;
      sort_order?: number;
    }> = Array.isArray(body.images) ? body.images : [];
    for (const img of images) {
      if (!img.url) continue;
      await db.execute(
        `INSERT INTO sales_images (posting_id, url, alt_text, source, sort_order)
         VALUES (?, ?, ?, ?, ?)`,
        [
          newId,
          String(img.url),
          String(img.alt_text ?? ""),
          String(img.source ?? "etsy"),
          Number(img.sort_order ?? 0),
        ],
      );
    }

    return json({ slug, id: newId }, 201);
  } catch (err: any) {
    if (String(err?.message).includes("UNIQUE constraint")) {
      return json({ error: "Slug already exists." }, 409);
    }
    return json({ error: "Database error" }, 500);
  }
};
