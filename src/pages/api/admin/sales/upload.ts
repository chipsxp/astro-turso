import type { APIRoute } from "astro";
import { cloudinary } from "../../../../lib/cloudinary-server";
import { IMAGE_MIME_TYPES, MAX_IMAGE_BYTES } from "../../../../lib/media";

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Per-user rate limit: 20 uploads / 15 min
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const uploadAttempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = uploadAttempts.get(userId);
  if (!entry || entry.resetAt <= now) {
    uploadAttempts.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

function parseDataUri(
  dataUri: string,
): { mimeType: string; base64Payload: string } | null {
  const commaIdx = dataUri.indexOf(",");
  if (!dataUri.startsWith("data:") || commaIdx === -1) return null;
  const parts = dataUri.slice(5, commaIdx).split(";");
  const mimeType = parts[0].trim();
  if (!mimeType || !parts.includes("base64")) return null;
  const base64Payload = dataUri.slice(commaIdx + 1);
  return base64Payload ? { mimeType, base64Payload } : null;
}

function estimateBase64DecodedBytes(base64: string): number {
  return Math.floor((base64.replace(/=+$/, "").length * 3) / 4);
}

// ── POST /api/admin/sales/upload — upload a payment QR code image ─────────────
// Open to admin and author roles. Returns { qr_code_url }; the URL is persisted
// via POST/PUT /api/admin/sales, which enforces posting ownership.
export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user!;
  if (user.role !== "admin" && user.role !== "author") {
    return json({ error: "Forbidden" }, 403);
  }
  if (isRateLimited(String(user.id))) {
    return json({ error: "Too many uploads. Try again later." }, 429);
  }

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
