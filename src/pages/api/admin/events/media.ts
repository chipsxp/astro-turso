import type { APIRoute } from "astro";
import { db } from "../../../../lib/db";
import { ensureMediaTable } from "../../../../lib/media";

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user) return json({ error: "Unauthorized" }, 401);

  try {
    await ensureMediaTable();

    const isAdmin = user.role === "admin";
    const result = await db.execute(
      isAdmin
        ? `SELECT m.id, m.article_id, m.resource_type, m.public_id, m.url, m.alt_text,
                  m.format, m.width, m.height, m.duration, m.created_at
           FROM media m
           ORDER BY m.id DESC
           LIMIT 200`
        : `SELECT m.id, m.article_id, m.resource_type, m.public_id, m.url, m.alt_text,
                  m.format, m.width, m.height, m.duration, m.created_at
           FROM media m
           JOIN articles a ON a.id = m.article_id
           WHERE a.author_id = ?
           ORDER BY m.id DESC
           LIMIT 200`,
      isAdmin ? [] : [Number(user.id)],
    );

    return json({ media: result.rows }, 200);
  } catch {
    return json({ error: "Database error" }, 500);
  }
};
