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

// ── GET /api/admin/sales/[slug]/testimonials ──────────────────────────────────
export const GET: APIRoute = async ({ params, locals }) => {
  const user = locals.user!;
  const pid = await getPostingId(params.slug!, user.id, user.role);
  if (pid === "error") return json({ error: "Database error" }, 500);
  if (pid === null) return json({ error: "Not found" }, 404);
  if (pid === "forbidden") return json({ error: "Forbidden" }, 403);

  try {
    const result = await db.execute(
      "SELECT * FROM sales_testimonials WHERE posting_id = ? ORDER BY sort_order ASC",
      [pid],
    );
    return json({ testimonials: result.rows }, 200);
  } catch {
    return json({ error: "Database error" }, 500);
  }
};

// ── POST /api/admin/sales/[slug]/testimonials — add new testimonial ────────────
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

  const author_name = String(body.author_name ?? "").trim();
  const quote = String(body.quote ?? "").trim();
  if (!author_name || !quote) {
    return json({ error: "author_name and quote are required" }, 400);
  }
  const rating =
    typeof body.rating === "number" && body.rating >= 1 && body.rating <= 5
      ? body.rating
      : null;
  const sort_order = typeof body.sort_order === "number" ? body.sort_order : 0;

  try {
    const result = await db.execute(
      `INSERT INTO sales_testimonials (posting_id, author_name, quote, rating, sort_order)
       VALUES (?, ?, ?, ?, ?)`,
      [pid, author_name, quote, rating, sort_order],
    );
    return json({ id: Number(result.lastInsertRowid) }, 201);
  } catch {
    return json({ error: "Database error" }, 500);
  }
};
