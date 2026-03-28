import type { APIRoute } from "astro";
import { ensureCategorySchema } from "../../../../lib/categories";
import { db } from "../../../../lib/db";

// --- Helpers ---

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// --- GET /api/admin/articles — return articles (JWT protected via middleware) ---
// Admin role: all articles. Author role: own articles only.

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user!;

  try {
    await ensureCategorySchema();

    const isAdmin = user.role === "admin";
    const result = await db.execute(
      isAdmin
        ? `SELECT a.id, a.title, a.slug, a.status, a.description,
                  a.created_at, a.updated_at,
        u.email AS author_email,
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug
           FROM articles a
           LEFT JOIN users u ON u.id = a.author_id
      LEFT JOIN categories c ON c.id = a.category_id
           ORDER BY a.created_at DESC`
        : `SELECT a.id, a.title, a.slug, a.status, a.description,
                  a.created_at, a.updated_at,
        u.email AS author_email,
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug
           FROM articles a
           LEFT JOIN users u ON u.id = a.author_id
      LEFT JOIN categories c ON c.id = a.category_id
           WHERE a.author_id = ?
           ORDER BY a.created_at DESC`,
      isAdmin ? [] : [Number(user.id)],
    );

    // Fetch tags for all articles in one query, then group by article_id
    const tagsResult = await db.execute(
      `SELECT at.article_id, t.name
       FROM article_tags at
       JOIN tags t ON t.id = at.tag_id`,
    );

    // Build tag map
    const tagMap: Record<number, string[]> = {};
    for (const row of tagsResult.rows) {
      const aid = Number(row.article_id);
      if (!tagMap[aid]) tagMap[aid] = [];
      tagMap[aid].push(String(row.name));
    }

    const articles = result.rows.map((row: Record<string, unknown>) => ({
      ...row,
      tags: tagMap[Number(row.id)] ?? [],
      category:
        row.category_id == null
          ? null
          : {
              id: Number(row.category_id),
              name: String(row.category_name),
              slug: String(row.category_slug),
            },
    }));

    return json({ articles }, 200);
  } catch {
    return json({ error: "Database error" }, 500);
  }
};
