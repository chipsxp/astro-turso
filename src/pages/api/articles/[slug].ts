import type { APIRoute } from "astro";
import {
  CategoryInputError,
  ensureCategorySchema,
  resolveCategoryId,
} from "../../../lib/categories";
import { db, type BatchStatement } from "../../../lib/db";
import {
  cleanupUnusedInlineImages,
  deleteInlineImagesByIds,
  persistInlineImagesInBody,
} from "../../../lib/inline-images";
import { deleteMediaByArticle, getMediaByArticle } from "../../../lib/media";
import { destroyCloudinaryAsset } from "../../../lib/cloudinary-server";
import type { ArticleUpdatePayload } from "../../../lib/article-editor.types";
import { json } from "../../../lib/api-response";
import { createRateLimiter, getClientIp } from "../../../lib/rate-limit";
import { validateArticleBody } from "../../../lib/article-validation";

// --- Helpers ---

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// --- In-memory rate limiter: 120 requests per IP per minute (public read) ---
const readLimiter = createRateLimiter({ limit: 120, windowMs: 60 * 1000 });

// --- GET /api/articles/[slug] — public, published articles only ---
// Sequence diagram Flow 4: article → media → tags, assembled server-side

export const GET: APIRoute = async ({ params, request }) => {
  const { slug } = params;
  if (!slug) return json({ error: "Missing slug" }, 400);

  const ip = getClientIp(request);
  if (readLimiter.limited(ip)) return json({ error: "Too many requests" }, 429);
  readLimiter.record(ip);

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

  let createdInlineImageIdsForRollback: number[] = [];

  let data: Partial<ArticleUpdatePayload>;
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
    let rewrittenBodyForCleanup: string | null = null;

    // Build SET clause from only the fields that were provided
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.title !== undefined) {
      fields.push("title = ?");
      values.push(String(data.title).trim());
    }
    if (data.slug !== undefined) {
      fields.push("slug = ?");
      values.push(String(data.slug).trim());
    }
    if (data.body !== undefined) {
      const normalizedBody = String(data.body).trim();
      const bodyValidationError = validateArticleBody(normalizedBody);
      if (bodyValidationError) {
        return json({ error: bodyValidationError }, 400);
      }

      const inlinePersistResult = await persistInlineImagesInBody(
        articleId,
        normalizedBody,
      );
      rewrittenBodyForCleanup = inlinePersistResult.body;
      createdInlineImageIdsForRollback =
        inlinePersistResult.createdInlineImageIds;
      fields.push("body = ?");
      values.push(inlinePersistResult.body);
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

    if (rewrittenBodyForCleanup !== null) {
      await cleanupUnusedInlineImages(articleId, rewrittenBodyForCleanup);
    }

    // Re-link tags when provided — wipe existing links and rebuild.
    // The wipe folds into the first batch, so a full re-link costs two
    // round trips instead of a wipe plus three awaits per tag.
    if (Array.isArray(data.tags)) {
      const tagNames = [
        ...new Set(
          data.tags.map((tagName) => String(tagName).trim()).filter(Boolean),
        ),
      ];

      if (tagNames.length === 0) {
        await db.execute("DELETE FROM article_tags WHERE article_id = ?", [
          articleId,
        ]);
      } else {
        const wipeAndUpsertResults = await db.batch(
          [
            {
              sql: "DELETE FROM article_tags WHERE article_id = ?",
              args: [articleId],
            },
            ...tagNames.map((name) => ({
              sql: "INSERT OR IGNORE INTO tags (name, slug) VALUES (?, ?)",
              args: [name, toSlug(name)],
            })),
            {
              sql: `SELECT id, name FROM tags WHERE name IN (${tagNames
                .map(() => "?")
                .join(", ")})`,
              args: tagNames,
            },
          ],
          "write",
        );

        const tagIdByName = new Map<string, number>();
        for (const row of wipeAndUpsertResults[
          wipeAndUpsertResults.length - 1
        ].rows) {
          tagIdByName.set(String(row.name), Number(row.id));
        }

        const linkStmts: BatchStatement[] = tagNames
          .map((name) => ({
            sql: "INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)",
            args: [articleId, tagIdByName.get(name)],
          }))
          .filter((stmt) => stmt.args?.[1] != null);
        await db.batch(linkStmts, "write");
      }
    }

    return json({ updated: true }, 200);
  } catch (err) {
    if (createdInlineImageIdsForRollback.length > 0) {
      try {
        await deleteInlineImagesByIds(createdInlineImageIdsForRollback);
      } catch {
        // Best-effort rollback for inline image rows.
      }
    }

    if (
      err instanceof Error &&
      err.message.includes("UNIQUE constraint failed")
    ) {
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

    // Remove CDN assets before deleting their database records. Already-missing
    // assets are treated as deleted so a retry can finish after a partial failure.
    const mediaToDelete = await getMediaByArticle(articleId);
    for (const media of mediaToDelete) {
      if (!media.public_id) continue;
      try {
        await destroyCloudinaryAsset(media.public_id, media.resource_type);
      } catch (err) {
        console.error(
          `[DELETE /api/articles/:slug] CDN delete failed for media ${media.id}:`,
          err,
        );
        return json({ error: "CDN delete failed" }, 502);
      }
    }

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
