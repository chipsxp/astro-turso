import type { APIRoute } from "astro";
import { cloudinary } from "../../../../lib/cloudinary-server";
import { db } from "../../../../lib/db";
import { IMAGE_MIME_TYPES, MAX_IMAGE_BYTES } from "../../../../lib/media";
import { ensurePanelSchema } from "../../../../lib/panels";

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// --- POST /api/admin/panels/upload ---
// Uploads an image to Cloudinary (folder: scriptorium/panels/) and inserts
// a row into panel_media. Returns the new PanelMedia record.
// Auth: JWT cookie required. Admin role required.
// Accepts JSON body: { file_data, mime_type, file_size }
// file_data must be a base64 data URI: "data:image/jpeg;base64,..."

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user!;
  if (user.role !== "admin") {
    return json({ error: "Forbidden" }, 403);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Expected JSON body" }, 400);
  }

  const fileData = body.file_data as string | null;
  const mimeType = String(body.mime_type ?? "").trim();
  const fileSize = Number(body.file_size ?? 0);
  const altText = String(body.alt_text ?? "")
    .trim()
    .slice(0, 160);

  if (
    !fileData ||
    !fileData.startsWith("data:") ||
    !fileData.includes(";base64,")
  ) {
    return json({ error: "file_data must be a valid base64 data URI" }, 400);
  }

  if (!IMAGE_MIME_TYPES.has(mimeType)) {
    return json(
      { error: "Unsupported image type. Allowed: jpeg, png, webp, gif, avif" },
      415,
    );
  }

  if (fileSize > MAX_IMAGE_BYTES) {
    return json(
      {
        error:
          "Image is too large (max 10 MB). Please optimize it before uploading.",
      },
      413,
    );
  }

  await ensurePanelSchema();

  let uploadResult: {
    secure_url: string;
    public_id: string;
    format?: string;
    width?: number;
    height?: number;
  };

  try {
    uploadResult = await cloudinary.uploader.upload(fileData, {
      folder: "scriptorium/panels",
      resource_type: "image",
      allowed_formats: ["jpg", "png", "webp", "gif", "avif"],
    });
  } catch (err) {
    console.error("[panels/upload] Cloudinary error:", err);
    return json({ error: "CDN upload failed" }, 502);
  }

  try {
    const inserted = await db.execute(
      `INSERT INTO panel_media (public_id, url, alt_text, width, height, format)
       VALUES (?, ?, ?, ?, ?, ?)
       RETURNING id, public_id, url, alt_text, width, height, format, created_at`,
      [
        uploadResult.public_id,
        uploadResult.secure_url,
        altText,
        uploadResult.width ?? null,
        uploadResult.height ?? null,
        uploadResult.format ?? null,
      ],
    );

    const row = inserted.rows[0];
    if (!row) {
      return json({ error: "Insert failed" }, 500);
    }

    return json(
      {
        media: {
          id: Number(row.id),
          public_id: String(row.public_id),
          url: String(row.url),
          alt_text: String(row.alt_text),
          width: row.width == null ? null : Number(row.width),
          height: row.height == null ? null : Number(row.height),
          format: row.format == null ? null : String(row.format),
          created_at: String(row.created_at),
        },
      },
      201,
    );
  } catch (err) {
    console.error("[panels/upload] DB error:", err);
    try {
      await cloudinary.uploader.destroy(uploadResult.public_id, {
        resource_type: "image",
      });
    } catch (destroyErr) {
      console.error("[panels/upload] Cloudinary rollback failed:", destroyErr);
    }
    return json({ error: "Database error" }, 500);
  }
};

export const GET: APIRoute = () => json({ error: "Method not allowed" }, 405);
