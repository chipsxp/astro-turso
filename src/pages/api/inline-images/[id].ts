import type { APIRoute } from "astro";
import { getInlineImageById } from "../../../lib/inline-images";
import { json } from "../../../lib/api-response";
import { createRateLimiter, getClientIp } from "../../../lib/rate-limit";

const inlineImageLimiter = createRateLimiter({
  limit: 240,
  windowMs: 60 * 1000,
});

export const GET: APIRoute = async ({ params, request }) => {
  const ip = getClientIp(request);
  if (inlineImageLimiter.limited(ip)) {
    return json({ error: "Too many requests" }, 429);
  }
  inlineImageLimiter.record(ip);

  const rawId = params.id;
  const imageId = Number(rawId);
  if (!Number.isInteger(imageId) || imageId <= 0) {
    return json({ error: "Invalid inline image id" }, 400);
  }

  try {
    const image = await getInlineImageById(imageId);
    if (!image) {
      return json({ error: "Inline image not found" }, 404);
    }

    const normalized = image.base64Data.replace(/\s+/g, "");
    const buffer = Buffer.from(normalized, "base64");
    const etagValue = `${image.id}-${image.updatedAt}`;

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": image.mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
        ETag: `\"${etagValue}\"`,
      },
    });
  } catch {
    return json({ error: "Database error" }, 500);
  }
};
