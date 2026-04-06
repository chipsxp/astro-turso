import type { APIRoute } from "astro";
import { getInlineImageById } from "../../../lib/inline-images";

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 240;
const WINDOW_MS = 60 * 1000;

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const current = attempts.get(ip);

  if (!current || now > current.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (current.count >= MAX_ATTEMPTS) {
    return true;
  }

  current.count += 1;
  attempts.set(ip, current);
  return false;
}

export const GET: APIRoute = async ({ params, request }) => {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return json({ error: "Too many requests" }, 429);
  }

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
