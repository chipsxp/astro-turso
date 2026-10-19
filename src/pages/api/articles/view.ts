import type { APIRoute } from "astro";
import { db } from "../../../lib/db";

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Public endpoint: one counted view per IP per article per 30 minutes, plus a
// per-IP burst cap so it can't be used to spam the DB.
const VIEW_WINDOW_MS = 30 * 60 * 1000;
const BURST_WINDOW_MS = 60 * 1000;
const BURST_MAX = 30;
const seenViews = new Map<string, number>();
const burst = new Map<string, { count: number; resetAt: number }>();

function getIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function prune(now: number) {
  if (seenViews.size > 5000) {
    for (const [k, t] of seenViews) if (t <= now) seenViews.delete(k);
  }
  if (burst.size > 5000) {
    for (const [k, v] of burst) if (v.resetAt <= now) burst.delete(k);
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const now = Date.now();
    const ip = getIp(request);
    prune(now);

    const b = burst.get(ip);
    if (!b || b.resetAt <= now) {
      burst.set(ip, { count: 1, resetAt: now + BURST_WINDOW_MS });
    } else if (++b.count > BURST_MAX) {
      return json({ error: "Too many requests" }, 429);
    }

    const data = await request.json().catch(() => null);
    const id = data?.id;

    if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) {
      return json({ error: "Invalid article ID" }, 400);
    }

    const key = `${ip}:${id}`;
    if ((seenViews.get(key) ?? 0) > now) {
      return json({ success: true, counted: false }, 200);
    }

    const result = await db.execute(
      "UPDATE articles SET views = views + 1 WHERE id = ? AND status = 'published'",
      [id],
    );
    if (!result.rowsAffected) {
      return json({ error: "Article not found" }, 404);
    }

    seenViews.set(key, now + VIEW_WINDOW_MS);
    return json({ success: true, counted: true }, 200);
  } catch (error) {
    console.error("Error updating article views:", error);
    return json({ error: "Internal Server Error" }, 500);
  }
};
