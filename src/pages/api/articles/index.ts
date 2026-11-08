import type { APIRoute } from "astro";
import {
  CategoryInputError,
  ensureCategorySchema,
  resolveCategoryId,
} from "../../../lib/categories";
import { db } from "../../../lib/db";
import {
  deleteInlineImagesByIds,
  persistInlineImagesInBody,
} from "../../../lib/inline-images";
import {
  attachUploadSessionMediaToArticle,
  ensureUploadSessionSchema,
  getActiveUploadSessionForUser,
  markUploadSessionConsumed,
} from "../../../lib/media";
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

// --- GET /api/articles — public list of published articles ---

export const GET: APIRoute = async ({ request }) => {
  const ip = getClientIp(request);
  if (readLimiter.limited(ip)) return json({ error: "Too many requests" }, 429);
  readLimiter.record(ip);

  try {
    await ensureCategorySchema();

    const result = await db.execute(
      `SELECT a.id, a.title, a.slug, a.description, a.created_at,
              u.email AS author_email,
              c.id AS category_id,
              c.name AS category_name,
              c.slug AS category_slug
       FROM articles a
       LEFT JOIN users u ON u.id = a.author_id
       LEFT JOIN categories c ON c.id = a.category_id
       WHERE a.status = 'published'
       ORDER BY a.created_at DESC`,
    );

    const articles = result.rows.map((row: Record<string, unknown>) => ({
      ...row,
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

// --- POST /api/articles — create article (JWT protected via middleware) ---

export const POST: APIRoute = async ({ request, locals }) => {
  const author = locals.user!;
  let data: Record<string, unknown>;


  try {
    await ensureCategorySchema();
  } catch {
    return json({ error: "Database error" }, 500);
  }

  try {
    data = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const title = String(data.title ?? "").trim();
  let body = String(data.body ?? "").trim();
  const slug = String(data.slug ?? "").trim() || toSlug(title ?? "");
  const description =
    typeof data.description === "string" && data.description.trim().length > 0
      ? data.description.trim()
      : undefined;
  const status =
    typeof data.status === "string" &&
    ["draft", "published"].includes(data.status)
      ? data.status
      : "draft";
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const uploadSessionId =
    typeof data.upload_session_id === "string" &&
    data.upload_session_id.trim().length > 0
      ? data.upload_session_id.trim()
      : undefined;

  let categoryId: number | null | undefined;
  try {
    categoryId = await resolveCategoryId(data, author.role === "admin");
  } catch (err) {
    if (err instanceof CategoryInputError) {
      return json({ error: err.message }, err.status);
    }
    return json({ error: "Database error" }, 500);
  }

  if (!title || !body) {
    return json({ error: "title and body are required" }, 400);
  }

  const bodyValidationError = validateArticleBody(body);
  if (bodyValidationError) {
    return json({ error: bodyValidationError }, 400);
  }

  if (!slug) {
    return json({ error: "Could not derive a slug from the given title" }, 400);
  }

  if (uploadSessionId) {
    try {
      await ensureUploadSessionSchema();
      const activeSession = await getActiveUploadSessionForUser(
        uploadSessionId,
        Number(author.id),
      );
      if (!activeSession) {
        return json({ error: "upload_session_id is invalid or expired" }, 400);
      }
    } catch {
      return json({ error: "Database error" }, 500);
    }
  }

  let createdInlineImageIds: number[] = [];

  try {
    // 1. INSERT article
    const articleResult = await db.execute(
      `INSERT INTO articles (title, slug, body, description, author_id, status, category_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        body,
        description ?? null,
        author.id,
        status,
        categoryId ?? null,
      ],
    );

    const articleId = Number(articleResult.lastInsertRowid);

    // Convert inline data:image payloads into images table records and
    // rewrite the body to stable inline-image URLs.
    const inlinePersistResult = await persistInlineImagesInBody(
      articleId,
      body,
    );
    createdInlineImageIds = inlinePersistResult.createdInlineImageIds;
    if (inlinePersistResult.body !== body) {
      await db.execute(
        "UPDATE articles SET body = ?, updated_at = datetime('now') WHERE id = ?",
        [inlinePersistResult.body, articleId],
      );
      body = inlinePersistResult.body;
    }

    // 2. Upsert tags + link to article (sequence diagram Flow 2, step 3)
    for (const tagName of tags) {
      const name = String(tagName).trim();
      if (!name) continue;

      const tagSlug = toSlug(name);

      await db.execute(
        "INSERT OR IGNORE INTO tags (name, slug) VALUES (?, ?)",
        [name, tagSlug],
      );

      const tagResult = await db.execute("SELECT id FROM tags WHERE name = ?", [
        name,
      ]);

      const tagId = tagResult.rows[0]?.id;
      if (tagId != null) {
        await db.execute(
          "INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)",
          [articleId, tagId],
        );
      }
    }

    // 3. Attach staged session uploads when provided
    if (uploadSessionId) {
      await attachUploadSessionMediaToArticle(uploadSessionId, articleId);
      await markUploadSessionConsumed(uploadSessionId);
    }

    // 4. Return 201
    return json(
      { article_id: articleId, slug, preview_url: `/blog/${slug}` },
      201,
    );
  } catch (err) {
    if (createdInlineImageIds.length > 0) {
      try {
        await deleteInlineImagesByIds(createdInlineImageIds);
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
