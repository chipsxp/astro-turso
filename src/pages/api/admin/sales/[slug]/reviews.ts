import type { APIRoute } from "astro";
import { db } from "../../../../../lib/db";

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function getPostingId(
  slug: string,
  userId: string,
  role: string,
): Promise<number | null | "forbidden" | "error"> {
  let result: any;
  try {
    result = await db.execute(
      "SELECT id, author_id FROM sales_postings WHERE slug = ?",
      [slug],
    );
  } catch {
    return "error";
  }
  if (!result.rows.length) return null;
  const row = result.rows[0] as any;
  if (role !== "admin" && Number(row.author_id) !== Number(userId))
    return "forbidden";
  return Number(row.id);
}

// ── GET /api/admin/sales/[slug]/reviews ───────────────────────────────────────
export const GET: APIRoute = async ({ params, locals }) => {
  const user = locals.user!;
  const pid = await getPostingId(params.slug!, user.id, user.role);
  if (pid === "error") return json({ error: "Database error" }, 500);
  if (pid === null) return json({ error: "Not found" }, 404);
  if (pid === "forbidden") return json({ error: "Forbidden" }, 403);

  try {
    const result = await db.execute(
      "SELECT * FROM sales_reviews WHERE posting_id = ? ORDER BY sort_order ASC",
      [pid],
    );
    return json({ reviews: result.rows }, 200);
  } catch {
    return json({ error: "Database error" }, 500);
  }
};

// ── POST /api/admin/sales/[slug]/reviews — add a review ───────────────────────
export const POST: APIRoute = async ({ params, locals, request }) => {
  const user = locals.user!;
  const pid = await getPostingId(params.slug!, user.id, user.role);
  if (pid === "error") return json({ error: "Database error" }, 500);
  if (pid === null) return json({ error: "Not found" }, 404);
  if (pid === "forbidden") return json({ error: "Forbidden" }, 403);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const reviewer_name = String(body.reviewer_name ?? "").trim();
  const review_text = String(body.review_text ?? "").trim();
  if (!reviewer_name || !review_text) {
    return json({ error: "reviewer_name and review_text are required" }, 400);
  }
  const rating =
    typeof body.rating === "number" && body.rating >= 1 && body.rating <= 5
      ? body.rating
      : null;
  const is_verified = body.is_verified ? 1 : 0;
  const review_date = body.review_date ? String(body.review_date) : null;
  const sort_order = typeof body.sort_order === "number" ? body.sort_order : 0;

  try {
    const result = await db.execute(
      `INSERT INTO sales_reviews
        (posting_id, reviewer_name, review_text, rating, is_verified, review_date, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        pid,
        reviewer_name,
        review_text,
        rating,
        is_verified,
        review_date,
        sort_order,
      ],
    );
    return json({ id: Number(result.lastInsertRowid) }, 201);
  } catch {
    return json({ error: "Database error" }, 500);
  }
};
