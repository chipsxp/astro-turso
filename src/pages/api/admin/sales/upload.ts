import type { APIRoute } from "astro";
import { cloudinary } from "../../../../lib/cloudinary-server";
import {
  IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
  estimateBase64DecodedBytes,
  parseDataUri,
} from "../../../../lib/media";
import { json } from "../../../../lib/api-response";
import { createRateLimiter } from "../../../../lib/rate-limit";

// Per-user rate limit: 20 uploads / 15 min
const uploadLimiter = createRateLimiter({
  limit: 20,
  windowMs: 15 * 60 * 1000,
});

// ── POST /api/admin/sales/upload — upload a payment QR code image ─────────────
// Open to admin and author roles. Returns { qr_code_url }; the URL is persisted
// via POST/PUT /api/admin/sales, which enforces posting ownership.
export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user!;
  if (user.role !== "admin" && user.role !== "author") {
    return json({ error: "Forbidden" }, 403);
  }
  const userId = String(user.id);
  if (uploadLimiter.limited(userId)) {
    return json({ error: "Too many uploads. Try again later." }, 429);
  }
  uploadLimiter.record(userId);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Expected JSON body" }, 400);
  }

  const fileData = typeof body.file_data === "string" ? body.file_data : "";
  const parsed = parseDataUri(fileData);
  if (!parsed) {
    return json({ error: "file_data must be a valid base64 data URI" }, 400);
  }
  if (!IMAGE_MIME_TYPES.has(parsed.mimeType)) {
    return json(
      { error: "Unsupported image type. Allowed: jpeg, png, webp, gif, avif" },
      415,
    );
  }
  if (estimateBase64DecodedBytes(parsed.base64Payload) > MAX_IMAGE_BYTES) {
    return json({ error: "QR Code image is too large (max 10 MB)." }, 413);
  }

  try {
    const result = await cloudinary.uploader.upload(fileData, {
      folder: `blog/users/${Number(user.id)}/qr`,
      resource_type: "image",
      allowed_formats: ["jpg", "png", "webp", "gif", "avif"],
    });
    return json({ qr_code_url: result.secure_url }, 200);
  } catch (err) {
    console.error("QR code Cloudinary upload error:", err);
    return json({ error: "CDN upload failed" }, 502);
  }
};
