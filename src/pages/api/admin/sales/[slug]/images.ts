import type { APIRoute } from "astro";
import { cloudinary } from "../../../../../lib/cloudinary-server";
import { db } from "../../../../../lib/db";
import { IMAGE_MIME_TYPES, MAX_IMAGE_BYTES } from "../../../../../lib/media";
import { MAX_SALES_IMAGES } from "../../../../../lib/sales";

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
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

// ── POST /api/admin/sales/[slug]/images — upload a new sales image ────────────
export const POST: APIRoute = async ({ params, locals, request }) => {
  const user = locals.user!;
  const { slug } = params;

  // Resolve posting and enforce ownership
  let postingId: number;
  let authorId: number;
  try {
    const res = await db.execute(
      "SELECT id, author_id FROM sales_postings WHERE slug = ?",
      [slug],
    );
    if (!res.rows.length) return json({ error: "Posting not found" }, 404);
    postingId = Number(res.rows[0].id);
    authorId = Number(res.rows[0].author_id);
  } catch {
    return json({ error: "Database error" }, 500);
  }

  if (user.role !== "admin" && Number(user.id) !== authorId) {
    return json({ error: "Forbidden" }, 403);
  }

  // Enforce 4-image limit
  try {
    const countRes = await db.execute(
      "SELECT COUNT(*) AS cnt FROM sales_images WHERE posting_id = ?",
      [postingId],
    );
    const cnt = Number(countRes.rows[0].cnt ?? 0);
    if (cnt >= MAX_SALES_IMAGES) {
      return json(
        { error: `Maximum of ${MAX_SALES_IMAGES} images per posting reached` },
        400,
      );
    }
  } catch {
    return json({ error: "Database error" }, 500);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const fileData = String(body.file_data ?? "");
  const altText = String(body.alt_text ?? "").trim();
  const transformsJson = body.transforms
    ? JSON.stringify(body.transforms)
    : "{}";

  const parsed = parseDataUri(fileData);
  if (!parsed) return json({ error: "Invalid data URI" }, 400);

  const { mimeType, base64Payload } = parsed;
  if (!IMAGE_MIME_TYPES.has(mimeType)) {
    return json(
      { error: "Unsupported image type. Allowed: jpeg, png, webp, gif, avif" },
      400,
    );
  }

  const byteSize = Math.floor(
    (base64Payload.replace(/=+$/, "").length * 3) / 4,
  );
  if (byteSize > MAX_IMAGE_BYTES) {
    return json({ error: "Image exceeds 10 MB limit" }, 400);
  }

  // Upload to Cloudinary
  let uploadPublicId = "";
  let uploadUrl = "";
  try {
    const folder = `blog/sales/${user.id}`;
    const result = await cloudinary.uploader.upload(fileData, {
      folder,
      resource_type: "image",
      invalidate: true,
    });
    uploadPublicId = result.public_id;
    uploadUrl = result.secure_url;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[POST sales/images] Cloudinary upload error:", msg);
    return json({ error: "Upload failed", detail: msg }, 502);
  }

  // Determine next sort_order
  let sortOrder = 0;
  try {
    const maxRes = await db.execute(
      "SELECT MAX(sort_order) AS mx FROM sales_images WHERE posting_id = ?",
      [postingId],
    );
    sortOrder = Number(maxRes.rows[0].mx ?? -1) + 1;
  } catch {
    /* use 0 */
  }

  // Insert into sales_images
  let newId: number;
  try {
    const ins = await db.execute(
      `INSERT INTO sales_images (posting_id, url, public_id, alt_text, transforms, source, sort_order)
       VALUES (?, ?, ?, ?, ?, 'cloudinary', ?)`,
      [postingId, uploadUrl, uploadPublicId, altText, transformsJson, sortOrder],
    );
    newId = Number(ins.lastInsertRowid);
  } catch (err: unknown) {
    // Rollback Cloudinary upload
    try {
      await cloudinary.uploader.destroy(uploadPublicId, { invalidate: true });
    } catch {
      /* ignore rollback failure */
    }
    const msg = err instanceof Error ? err.message : String(err);
    return json({ error: "Database error", detail: msg }, 500);
  }

  return json(
    {
      id: newId,
      public_id: uploadPublicId,
      url: uploadUrl,
      alt_text: altText,
      transforms: transformsJson,
      sort_order: sortOrder,
    },
    201,
  );
};

// ── DELETE /api/admin/sales/[slug]/images — remove an image ──────────────────
export const DELETE: APIRoute = async ({ params, locals, request }) => {
  const user = locals.user!;
  const { slug } = params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const imageId = Number(body.image_id);
  if (!imageId) return json({ error: "image_id required" }, 400);

  // Resolve posting for ownership check
  try {
    const postingRes = await db.execute(
      "SELECT id, author_id FROM sales_postings WHERE slug = ?",
      [slug],
    );
    if (!postingRes.rows.length)
      return json({ error: "Posting not found" }, 404);
    const authorId = Number(postingRes.rows[0].author_id);
    if (user.role !== "admin" && Number(user.id) !== authorId) {
      return json({ error: "Forbidden" }, 403);
    }
  } catch {
    return json({ error: "Database error" }, 500);
  }

  // Fetch image record
  let publicId: string | null = null;
  try {
    const imgRes = await db.execute(
      "SELECT public_id FROM sales_images WHERE id = ?",
      [imageId],
    );
    if (!imgRes.rows.length) return json({ error: "Image not found" }, 404);
    publicId = String(imgRes.rows[0].public_id ?? "");
  } catch {
    return json({ error: "Database error" }, 500);
  }

  // Delete from Cloudinary
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId, { invalidate: true });
    } catch (err: unknown) {
      console.error("[DELETE sales/images] Cloudinary destroy error:", err);
    }
  }

  // Delete from DB
  try {
    await db.execute("DELETE FROM sales_images WHERE id = ?", [imageId]);
  } catch {
    return json({ error: "Database error" }, 500);
  }

  return json({ deleted: true }, 200);
};

// ── PATCH /api/admin/sales/[slug]/images — reorder or update transforms ───────
export const PATCH: APIRoute = async ({ params, locals, request }) => {
  const user = locals.user!;
  const { slug } = params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  // Ownership check
  try {
    const postingRes = await db.execute(
      "SELECT author_id FROM sales_postings WHERE slug = ?",
      [slug],
    );
    if (!postingRes.rows.length)
      return json({ error: "Posting not found" }, 404);
    const authorId = Number(postingRes.rows[0].author_id);
    if (user.role !== "admin" && Number(user.id) !== authorId) {
      return json({ error: "Forbidden" }, 403);
    }
  } catch {
    return json({ error: "Database error" }, 500);
  }

  // Reorder: expects { order: [{ id, sort_order }] }
  if (Array.isArray(body.order)) {
    const order = body.order as Array<{ id: number; sort_order: number }>;
    for (const item of order) {
      await db.execute("UPDATE sales_images SET sort_order = ? WHERE id = ?", [
        Number(item.sort_order),
        Number(item.id),
      ]);
    }
    return json({ reordered: true }, 200);
  }

  // Update transforms: expects { image_id, transforms }
  if (body.image_id && body.transforms !== undefined) {
    const imageId = Number(body.image_id);
    const transformsJson = JSON.stringify(body.transforms);
    await db.execute("UPDATE sales_images SET transforms = ? WHERE id = ?", [
      transformsJson,
      imageId,
    ]);
    return json({ updated: true }, 200);
  }

  return json({ error: "Provide order array or image_id + transforms" }, 400);
};
