import type { APIRoute } from "astro";
import {
  CategoryInputError,
  ensureCategorySchema,
  resolveCategoryId,
} from "../../../lib/categories";
import { db } from "../../../lib/db";
import { deleteMediaByArticle, getMediaByArticle } from "../../../lib/media";

// --- Helpers ---

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// --- GET /api/articles/[slug] — public, published articles only ---
// Sequence diagram Flow 4: article → media → tags, assembled server-side

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;
  if (!slug) return json({ error: "Missing slug" }, 400);

  try {
    await ensureCategorySchema();

    const articleResult = await db.execute(
      `SELECT a.id, a.title, a.slug, a.body, a.description,
              a.status, a.created_at, a.updated_at,
              u.email AS author_email,
              c.id AS category_id,
              c.name AS category_name,
              c.slug AS category_slug
       FROM articles a
       LEFT JOIN users u ON u.id = a.author_id
       LEFT JOIN categories c ON c.id = a.category_id
       WHERE a.slug = ? AND a.status = 'published'`,
      [slug],
    );

    const article = articleResult.rows[0];
    if (!article) return json({ error: "Article not found" }, 404);

    const articleId = article.id;

    // Fetch media and tags in parallel
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
  } catch {
    return json({ error: "Database error" }, 500);
  }
};

// --- PUT /api/articles/[slug] — update article (JWT protected) ---

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const user = locals.user!;
  const { slug } = params;
  if (!slug) return json({ error: "Missing slug" }, 400);

  let data: Record<string, any>;
  try {
    await ensureCategorySchema();
    data = await request.json();
  } catch (err) {
    if (err instanceof CategoryInputError) {
      return json({ error: err.message }, err.status);
    }
    return json({ error: "Invalid JSON body" }, 400);
  }

  try {
    const existing = await db.execute(
      user.role === "admin"
        ? "SELECT id FROM articles WHERE slug = ?"
        : "SELECT id FROM articles WHERE slug = ? AND author_id = ?",
      user.role === "admin" ? [slug] : [slug, Number(user.id)],
    );
    if (!existing.rows[0]) return json({ error: "Article not found" }, 404);

    const articleId = Number(existing.rows[0].id);

    // Build SET clause from only the fields that were provided
    const fields: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      fields.push("title = ?");
      values.push(String(data.title).trim());
    }
    if (data.slug !== undefined) {
      fields.push("slug = ?");
      values.push(String(data.slug).trim());
    }
    if (data.body !== undefined) {
      fields.push("body = ?");
      values.push(String(data.body).trim());
    }
    if (data.description !== undefined) {
      fields.push("description = ?");
      values.push(data.description ?? null);
    }

    if (data.status !== undefined) {
      if (!["draft", "published"].includes(data.status)) {
        return json({ error: "status must be 'draft' or 'published'" }, 400);
      }
      fields.push("status = ?");
      values.push(data.status);
    }

    try {
      const categoryId = await resolveCategoryId(data, user.role === "admin");
      if (categoryId !== undefined) {
        fields.push("category_id = ?");
        values.push(categoryId);
      }
    } catch (err) {
      if (err instanceof CategoryInputError) {
        return json({ error: err.message }, err.status);
      }
      throw err;
    }

    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      values.push(articleId);
      await db.execute(
        `UPDATE articles SET ${fields.join(", ")} WHERE id = ?`,
        values,
      );
    }

    // Re-link tags when provided — wipe existing links and rebuild
    if (Array.isArray(data.tags)) {
      await db.execute("DELETE FROM article_tags WHERE article_id = ?", [
        articleId,
      ]);

      for (const tagName of data.tags) {
        const name = String(tagName).trim();
        if (!name) continue;

        const tagSlug = toSlug(name);

        await db.execute(
          "INSERT OR IGNORE INTO tags (name, slug) VALUES (?, ?)",
          [name, tagSlug],
        );

        const tagResult = await db.execute(
          "SELECT id FROM tags WHERE name = ?",
          [name],
        );

        const tagId = tagResult.rows[0]?.id;
        if (tagId != null) {
          await db.execute(
            "INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)",
            [articleId, tagId],
          );
        }
      }
    }

    return json({ updated: true }, 200);
  } catch (err: any) {
    if (err?.message?.includes("UNIQUE constraint failed")) {
      return json({ error: "An article with that slug already exists" }, 409);
    }
    return json({ error: "Database error" }, 500);
  }
};

// --- DELETE /api/articles/[slug] — delete article (JWT protected) ---

export const DELETE: APIRoute = async ({ params, locals }) => {
  const user = locals.user!;
  const { slug } = params;
  if (!slug) return json({ error: "Missing slug" }, 400);

  try {
    const existing = await db.execute(
      user.role === "admin"
        ? "SELECT id FROM articles WHERE slug = ?"
        : "SELECT id FROM articles WHERE slug = ? AND author_id = ?",
      user.role === "admin" ? [slug] : [slug, Number(user.id)],
    );
    if (!existing.rows[0]) return json({ error: "Article not found" }, 404);

    const articleId = Number(existing.rows[0].id);

    // Delete in FK-safe order: junction table → media → legacy images → article.
    // Turso Cloud enforces FKs by default; article_tags has no ON DELETE CASCADE
    // so we must remove those rows before deleting the parent article row.
    await db.execute("DELETE FROM article_tags WHERE article_id = ?", [
      articleId,
    ]);
    await deleteMediaByArticle(articleId);
    await db.execute("DELETE FROM images WHERE article_id = ?", [articleId]);
    await db.execute("DELETE FROM articles WHERE id = ?", [articleId]);

    return json({ deleted: true }, 200);
  } catch (err) {
    console.error("[DELETE /api/articles/:slug] failed:", err);
    return json({ error: "Database error" }, 500);
  }
};
