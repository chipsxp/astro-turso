import type { APIRoute } from "astro";
import { ensureCategorySchema } from "../../../../lib/categories";
import { db } from "../../../../lib/db";
import { getMediaByArticle } from "../../../../lib/media";

// --- Helpers ---

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// --- GET /api/admin/articles/[slug] — single article any status, JWT protected via middleware ---
// Admin role: any article. Author role: own articles only.

export const GET: APIRoute = async ({ params, locals }) => {
  const user = locals.user!;
  const { slug } = params;
  if (!slug) return json({ error: "Missing slug" }, 400);

  try {
    await ensureCategorySchema();

    const isAdmin = user.role === "admin";
    const articleResult = await db.execute(
      isAdmin
        ? `SELECT a.id, a.title, a.slug, a.body, a.description,
                  a.status, a.created_at, a.updated_at,
                  u.email AS author_email,
                  c.id AS category_id,
                  c.name AS category_name,
                  c.slug AS category_slug
           FROM articles a
           LEFT JOIN users u ON u.id = a.author_id
           LEFT JOIN categories c ON c.id = a.category_id
           WHERE a.slug = ?`
        : `SELECT a.id, a.title, a.slug, a.body, a.description,
                  a.status, a.created_at, a.updated_at,
                  u.email AS author_email,
                  c.id AS category_id,
                  c.name AS category_name,
                  c.slug AS category_slug
           FROM articles a
           LEFT JOIN users u ON u.id = a.author_id
           LEFT JOIN categories c ON c.id = a.category_id
           WHERE a.slug = ? AND a.author_id = ?`,
      isAdmin ? [slug] : [slug, Number(user.id)],
    );

    const article = articleResult.rows[0];
    if (!article) return json({ error: "Article not found" }, 404);

    const articleId = article.id;

    const [media, tagsResult] = await Promise.all([
      getMediaByArticle(Number(articleId)),
      db.execute(
        `SELECT t.id, t.name, t.slug
         FROM tags t
         JOIN article_tags ON article_tags.tag_id = t.id
         WHERE article_tags.article_id = ?`,
        [articleId],
      ),
    ]);

    return json(
      {
        ...article,
        category:
          article.category_id == null
            ? null
            : {
                id: Number(article.category_id),
                name: String(article.category_name),
                slug: String(article.category_slug),
              },
        media,
        images: media.filter((item) => item.resource_type === "image"),
        tags: tagsResult.rows,
      },
      200,
    );
  } catch (err) {
    console.error("[GET /api/admin/articles/[slug]]", err);
    return json({ error: "Database error" }, 500);
  }
};
