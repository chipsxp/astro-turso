import type { APIRoute } from "astro";
import { cloudinary } from "../../lib/cloudinary-server";
import { db } from "../../lib/db";
import {
  addUploadSessionMedia,
  ensureMediaTable,
  ensureUploadSessionSchema,
  getActiveUploadSessionForUser,
  getResourceTypeFromMimeType,
  IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  VIDEO_MIME_TYPES,
} from "../../lib/media";

// --- Helper ---

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function getFileSizeLimit(resourceType: "image" | "video"): number {
  return resourceType === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
}

function getAllowedTypesMessage(resourceType: "image" | "video"): string {
  if (resourceType === "video") {
    return "Unsupported video type. Allowed: mp4, webm, ogg, mov";
  }
  return "Unsupported image type. Allowed: jpeg, png, webp, gif, avif";
}

function parseDataUri(
  dataUri: string,
): { mimeType: string; base64Payload: string } | null {
  const commaIdx = dataUri.indexOf(",");
  if (!dataUri.startsWith("data:") || commaIdx === -1) return null;
  const header = dataUri.slice(5, commaIdx);
  const parts = header.split(";");
  const mimeType = parts[0].trim();
  if (!mimeType || !parts.includes("base64")) return null;
  const base64Payload = dataUri.slice(commaIdx + 1);
  return base64Payload ? { mimeType, base64Payload } : null;
}

function estimateBase64DecodedBytes(base64: string): number {
  const withoutPadding = base64.replace(/=+$/, "");
  return Math.floor((withoutPadding.length * 3) / 4);
}

// --- POST /api/upload — upload media to Cloudinary and record in DB (JWT protected) ---
// Sequence diagram Flow 3:
//   JWT verified by middleware →
//   Upload to Cloudinary → secure_url →
//   INSERT media metadata →
//   200 { media_url, media_id }
//
// Accepts JSON body: { file_data, mime_type, file_size, (article_id | upload_session_id), alt_text }
// file_data must be a base64 data URI: "data:image/jpeg;base64,..."

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user!;

  // --- Parse JSON body ---
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Expected JSON body" }, 400);
  }

  const fileData = body.file_data as string | null;
  const declaredMimeType = String(body.mime_type ?? "").trim();
  const articleIdRaw = body.article_id;
  const uploadSessionIdRaw = body.upload_session_id;
  const altText = String(body.alt_text ?? "").trim();

  if (!fileData || !altText) {
    return json({ error: "file_data and alt_text are required" }, 400);
  }

  // --- Parse data URI server-side to derive actual MIME type and byte count ---
  const parsedUri = parseDataUri(fileData);
  if (!parsedUri) {
    return json({ error: "file_data must be a valid base64 data URI" }, 400);
  }
  const actualMimeType = parsedUri.mimeType;
  const actualBytes = estimateBase64DecodedBytes(parsedUri.base64Payload);

  if (declaredMimeType && declaredMimeType !== actualMimeType) {
    return json(
      { error: "mime_type does not match the data URI content type" },
      400,
    );
  }

  const articleIdText = String(articleIdRaw ?? "").trim();
  const uploadSessionId = String(uploadSessionIdRaw ?? "").trim();
  const hasArticleId = articleIdText.length > 0;
  const hasUploadSessionId = uploadSessionId.length > 0;

  if (
    (hasArticleId && hasUploadSessionId) ||
    (!hasArticleId && !hasUploadSessionId)
  ) {
    return json(
      {
        error: "Provide exactly one of article_id or upload_session_id",
      },
      400,
    );
  }

  // --- Validate file type and size ---
  const resourceType = getResourceTypeFromMimeType(actualMimeType);
  if (!resourceType) {
    return json(
      {
        error:
          "Unsupported file type. Allowed images: jpeg, png, webp, gif, avif. Allowed videos: mp4, webm, ogg, mov",
      },
      415,
    );
  }

  const allowedTypes =
    resourceType === "video" ? VIDEO_MIME_TYPES : IMAGE_MIME_TYPES;
  if (!allowedTypes.has(actualMimeType)) {
    return json({ error: getAllowedTypesMessage(resourceType) }, 415);
  }

  const maxBytes = getFileSizeLimit(resourceType);
  if (actualBytes > maxBytes) {
    if (resourceType === "image") {
      return json(
        {
          error:
            "Image is too large (max 10 MB). Please optimize it to 5–10 MB before uploading.",
        },
        413,
      );
    }
    const maxSizeMb = Math.floor(maxBytes / (1024 * 1024));
    return json({ error: `File exceeds ${maxSizeMb} MB limit` }, 413);
  }

  const actorUserId = Number(user.id);
  let targetAuthorId = actorUserId;
  let articleId: number | null = null;

  if (hasArticleId) {
    articleId = Number(articleIdText);
    if (!Number.isInteger(articleId) || articleId < 1) {
      return json({ error: "article_id must be a positive integer" }, 400);
    }

    try {
      const articleCheck = await db.execute(
        "SELECT id, author_id FROM articles WHERE id = ?",
        [articleId],
      );
      const article = articleCheck.rows[0];
      if (!article) {
        return json({ error: "Article not found" }, 404);
      }

      targetAuthorId = Number(article.author_id);
      if (user.role !== "admin" && targetAuthorId !== actorUserId) {
        return json({ error: "Forbidden" }, 403);
      }
    } catch {
      return json({ error: "Database error" }, 500);
    }
  } else {
    try {
      await ensureUploadSessionSchema();
    } catch {
      return json({ error: "Database error" }, 500);
    }

    try {
      const session = await getActiveUploadSessionForUser(
        uploadSessionId,
        actorUserId,
      );
      if (!session) {
        return json({ error: "Upload session is invalid or expired" }, 400);
      }
      targetAuthorId = session.user_id;
    } catch {
      return json({ error: "Database error" }, 500);
    }
  }

  if (hasArticleId) {
    try {
      await ensureMediaTable();
    } catch {
      return json({ error: "Database error" }, 500);
    }
  }

  // --- Upload to Cloudinary via base64 data URI ---
  let uploadResult: {
    secure_url: string;
    public_id: string;
    format?: string;
    width?: number;
    height?: number;
    duration?: number;
  };

  try {
    const folder = `blog/users/${targetAuthorId}/${resourceType === "video" ? "videos" : "images"}`;
    const result = await cloudinary.uploader.upload(fileData, {
      folder,
      resource_type: resourceType,
      allowed_formats:
        resourceType === "video"
          ? ["mp4", "webm", "ogv", "mov"]
          : ["jpg", "png", "webp", "gif", "avif"],
    });
    uploadResult = {
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      duration:
        typeof result.duration === "number" ? result.duration : undefined,
    };
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return json({ error: "CDN upload failed" }, 502);
  }

  // --- INSERT into media or upload_session_media ---
  // If the DB write fails after a successful Cloudinary upload, destroy the
  // orphaned asset so storage and DB stay in sync.
  async function rollbackCloudinaryUpload(): Promise<void> {
    try {
      await cloudinary.uploader.destroy(uploadResult.public_id, {
        resource_type: resourceType ?? "image",
      });
    } catch (destroyErr) {
      console.error("Cloudinary rollback destroy failed:", destroyErr);
    }
  }

  try {
    if (articleId != null) {
      const result = await db.execute(
        `INSERT INTO media (
           article_id, resource_type, public_id, url, alt_text,
           format, width, height, duration
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          articleId,
          resourceType,
          uploadResult.public_id,
          uploadResult.secure_url,
          altText,
          uploadResult.format ?? null,
          uploadResult.width ?? null,
          uploadResult.height ?? null,
          uploadResult.duration ?? null,
        ],
      );

      const mediaId = Number(result.lastInsertRowid);
      const media = {
        id: mediaId,
        article_id: articleId,
        resource_type: resourceType,
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
        alt_text: altText,
        format: uploadResult.format ?? null,
        width: uploadResult.width ?? null,
        height: uploadResult.height ?? null,
        duration: uploadResult.duration ?? null,
      };

      return json(
        {
          media,
          media_id: mediaId,
          media_url: uploadResult.secure_url,
          resource_type: resourceType,
          ...(resourceType === "image"
            ? { image_id: mediaId, image_url: uploadResult.secure_url }
            : {}),
        },
        200,
      );
    }

    const stagedMedia = await addUploadSessionMedia({
      upload_session_id: uploadSessionId,
      resource_type: resourceType,
      public_id: uploadResult.public_id,
      url: uploadResult.secure_url,
      alt_text: altText,
      format: uploadResult.format ?? null,
      width: uploadResult.width ?? null,
      height: uploadResult.height ?? null,
      duration: uploadResult.duration ?? null,
    });

    return json(
      {
        media: stagedMedia,
        media_id: stagedMedia.id,
        media_url: stagedMedia.url,
        resource_type: stagedMedia.resource_type,
        ...(stagedMedia.resource_type === "image"
          ? { image_id: stagedMedia.id, image_url: stagedMedia.url }
          : {}),
      },
      200,
    );
  } catch {
    await rollbackCloudinaryUpload();
    return json({ error: "Database error" }, 500);
  }
};

// --- DELETE /api/upload — delete one media row + Cloudinary asset (JWT protected) ---
// Expects JSON body: { media_id }

export const DELETE: APIRoute = async ({ request, locals }) => {
  const user = locals.user!;

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Expected JSON body" }, 400);
  }

  const mediaId = Number(payload.media_id);
  if (!Number.isInteger(mediaId) || mediaId < 1) {
    return json({ error: "media_id must be a positive integer" }, 400);
  }

  try {
    await ensureMediaTable();
  } catch {
    return json({ error: "Database error" }, 500);
  }

  let mediaRow: Record<string, unknown> | undefined;
  try {
    const mediaResult = await db.execute(
      `SELECT m.id, m.public_id, m.resource_type, a.author_id
       FROM media m
       JOIN articles a ON a.id = m.article_id
       WHERE m.id = ?`,
      [mediaId],
    );

    mediaRow = mediaResult.rows[0] as Record<string, unknown> | undefined;
    if (!mediaRow) {
      return json({ error: "Media not found" }, 404);
    }

    const authorId = Number(mediaRow.author_id);
    if (user.role !== "admin" && authorId !== Number(user.id)) {
      return json({ error: "Forbidden" }, 403);
    }
  } catch {
    return json({ error: "Database error" }, 500);
  }

  const publicId = mediaRow.public_id ? String(mediaRow.public_id) : "";
  const resourceType = mediaRow.resource_type === "video" ? "video" : "image";

  if (publicId) {
    try {
      const destroyResult = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        invalidate: true,
      });

      const result = String(destroyResult?.result ?? "").toLowerCase();
      if (
        result &&
        result !== "ok" &&
        result !== "not found" &&
        result !== "not_found"
      ) {
        return json({ error: "CDN delete failed" }, 502);
      }
    } catch (err: any) {
      const message = String(err?.message ?? "").toLowerCase();
      if (!message.includes("not found")) {
        return json({ error: "CDN delete failed" }, 502);
      }
    }
  }

  try {
    await db.execute("DELETE FROM media WHERE id = ?", [mediaId]);
    return json({ deleted: true, media_id: mediaId }, 200);
  } catch {
    return json({ error: "Database error" }, 500);
  }
};
