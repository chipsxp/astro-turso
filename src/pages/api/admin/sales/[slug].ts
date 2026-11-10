import type { APIRoute } from "astro";
import { db } from "../../../../lib/db";
import {
  isValidPaymentLink,
  isValidQrUrl,
  MAX_BODY_BYTES,
  normalizePaymentLink,
  slugify,
} from "../../../../lib/sales";
import { sanitizeArticleBodyServer } from "../../../../lib/sanitize-server";
import { json } from "../../../../lib/api-response";

// ── GET /api/admin/sales/[slug] — single posting with related data ────────────
export const GET: APIRoute = async ({ params, locals }) => {
  const user = locals.user!;
  const { slug } = params;

  try {
    const result = await db.execute(
      `SELECT sp.id, sp.slug, sp.author_id, sp.title, sp.body, sp.status,
              sp.tags, sp.promo_label, sp.promo_discount_pct, sp.promo_start,
              sp.promo_end, sp.paypal_button_html, sp.linked_article_slug,
              sp.created_at, sp.updated_at, sp.price, sp.qr_code_url,
              sp.paypal_link, sp.venmo_link, sp.cashapp_link,
              u.email AS author_email
       FROM sales_postings sp
       LEFT JOIN users u ON u.id = sp.author_id
       WHERE sp.slug = ?`,
      [slug],
    );
    if (!result.rows.length) return json({ error: "Not found" }, 404);

    const posting = result.rows[0];

    // Authors can only view their own postings
    if (
      user.role !== "admin" &&
      Number(posting.author_id) !== Number(user.id)
    ) {
      return json({ error: "Forbidden" }, 403);
    }

    const [imagesRes, testimonialsRes, reviewsRes] = await Promise.all([
      db.execute(
        `SELECT id, posting_id, url, alt_text, source, sort_order, created_at,
                public_id, transforms
         FROM sales_images WHERE posting_id = ? ORDER BY sort_order ASC`,
        [Number(posting.id)],
      ),
      db.execute(
        `SELECT id, posting_id, author_name, quote, rating, sort_order, created_at
         FROM sales_testimonials WHERE posting_id = ? ORDER BY sort_order ASC`,
        [Number(posting.id)],
      ),
      db.execute(
        `SELECT id, posting_id, reviewer_name, review_text, rating, is_verified,
                review_date, sort_order, created_at
         FROM sales_reviews WHERE posting_id = ? ORDER BY sort_order ASC`,
        [Number(posting.id)],
      ),
    ]);

    return json(
      {
        posting,
        images: imagesRes.rows,
        testimonials: testimonialsRes.rows,
        reviews: reviewsRes.rows,
      },
      200,
    );
  } catch {
    return json({ error: "Database error" }, 500);
  }
};

// ── PUT /api/admin/sales/[slug] — update a posting ────────────────────────────
export const PUT: APIRoute = async ({ params, locals, request }) => {
  const user = locals.user!;
  const { slug } = params;

  // Verify posting exists and enforce ownership
  let existing: { rows: Record<string, unknown>[] };
  try {
    existing = await db.execute(
      "SELECT id, author_id FROM sales_postings WHERE slug = ?",
      [slug],
    );
  } catch {
    return json({ error: "Database error" }, 500);
  }
  if (!existing.rows.length) return json({ error: "Not found" }, 404);
  const row = existing.rows[0];
  if (user.role !== "admin" && Number(row.author_id) !== Number(user.id)) {
    return json({ error: "Forbidden" }, 403);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const postingId = Number(row.id);

  // Build update fields
  const fields: string[] = [];
  const values: unknown[] = [];

  const setField = (col: string, val: unknown) => {
    fields.push(`${col} = ?`);
    values.push(val);
  };

  if (body.title !== undefined) setField("title", String(body.title).trim());
  if (body.slug !== undefined) {
    const newSlug = slugify(String(body.slug));
    setField("slug", newSlug);
  }
  if (body.status !== undefined) {
    setField("status", body.status === "published" ? "published" : "draft");
  }
  if (body.body !== undefined) {
    const rawBody = String(body.body);
    if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
      return json({ error: "Body content is too large (max 1.75 MB)" }, 400);
    }
    setField("body", sanitizeArticleBodyServer(rawBody));
  }
  if (body.price !== undefined)
    setField("price", body.price != null ? Number(body.price) : null);
  if (body.tags !== undefined)
    setField(
      "tags",
      Array.isArray(body.tags) ? JSON.stringify(body.tags) : "[]",
    );
  if (body.promo_label !== undefined)
    setField("promo_label", body.promo_label || null);
  if (body.promo_discount_pct !== undefined)
    setField("promo_discount_pct", body.promo_discount_pct ?? null);
  if (body.promo_start !== undefined)
    setField("promo_start", body.promo_start || null);
  if (body.promo_end !== undefined)
    setField("promo_end", body.promo_end || null);
  if (body.paypal_button_html !== undefined)
    setField("paypal_button_html", body.paypal_button_html || null);
  const paymentLinkFields = [
    ["paypal_link", "paypal_link"],
    ["venmo_link", "venmo_link"],
    ["cashapp_link", "cashapp_link"],
  ] as const;
  for (const [key, column] of paymentLinkFields) {
    if (body[key] === undefined) continue;
    const value = body[key] ?? "";
    if (!isValidPaymentLink(value)) {
      return json(
        {
          error:
            "Payment links must be valid HTTPS URLs no longer than 2048 characters.",
        },
        400,
      );
    }
    setField(column, normalizePaymentLink(value));
  }
  if (body.qr_code_url && !isValidQrUrl(body.qr_code_url)) {
    return json({ error: "Invalid QR code URL" }, 400);
  }
  if (body.qr_code_url !== undefined)
    setField("qr_code_url", body.qr_code_url || null);
  if (body.linked_article_slug !== undefined)
    setField("linked_article_slug", body.linked_article_slug || null);

  if (!fields.length) return json({ error: "No fields to update" }, 400);

  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(postingId);

  try {
    await db.execute(
      `UPDATE sales_postings SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
    return json({ updated: true }, 200);
  } catch (err: unknown) {
    if (String((err as Error)?.message).includes("UNIQUE constraint")) {
      return json({ error: "Slug already in use." }, 409);
    }
    return json({ error: "Database error" }, 500);
  }
};

// ── DELETE /api/admin/sales/[slug] — delete a posting ────────────────────────
export const DELETE: APIRoute = async ({ params, locals }) => {
  const user = locals.user!;
  const { slug } = params;

  try {
    const existing = await db.execute(
      "SELECT id, author_id FROM sales_postings WHERE slug = ?",
      [slug],
    );
    if (!existing.rows.length) return json({ error: "Not found" }, 404);
    const row = existing.rows[0];
    if (user.role !== "admin" && Number(row.author_id) !== Number(user.id)) {
      return json({ error: "Forbidden" }, 403);
    }

    await db.execute("DELETE FROM sales_postings WHERE id = ?", [
      Number(row.id),
    ]);
    return json({ deleted: true }, 200);
  } catch {
    return json({ error: "Database error" }, 500);
  }
};
