import type { APIRoute } from "astro";
import { listCategories } from "../../../lib/categories";
import { json } from "../../../lib/api-response";
import { createRateLimiter, getClientIp } from "../../../lib/rate-limit";

// --- In-memory rate limiter: 120 requests per IP per minute (public read) ---
const readLimiter = createRateLimiter({ limit: 120, windowMs: 60 * 1000 });

export const GET: APIRoute = async ({ request }) => {
  const ip = getClientIp(request);
  if (readLimiter.limited(ip)) return json({ error: "Too many requests" }, 429);
  readLimiter.record(ip);

  try {
    const categories = await listCategories();
    return json({ categories }, 200);
  } catch {
    return json({ error: "Database error" }, 500);
  }
};
