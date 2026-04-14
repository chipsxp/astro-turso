import type { APIRoute } from "astro";
import { listCategories } from "../../../lib/categories";

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// --- In-memory rate limiter: 120 requests per IP per minute (public read) ---
const readAttempts = new Map<string, { count: number; resetAt: number }>();
const READ_MAX = 120;
const READ_WINDOW_MS = 60 * 1000;

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isReadRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = readAttempts.get(ip);
  if (!entry || now > entry.resetAt) return false;
  return entry.count >= READ_MAX;
}

function recordReadAttempt(ip: string): void {
  const now = Date.now();
  const entry = readAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    readAttempts.set(ip, { count: 1, resetAt: now + READ_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

export const GET: APIRoute = async ({ request }) => {
  const ip = getClientIp(request);
  if (isReadRateLimited(ip)) return json({ error: "Too many requests" }, 429);
  recordReadAttempt(ip);

  try {
    const categories = await listCategories();
    return json({ categories }, 200);
  } catch {
    return json({ error: "Database error" }, 500);
  }
};
