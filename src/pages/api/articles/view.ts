import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { json } from "../../../lib/api-response";

// Public endpoint: one counted view per IP per article per 30 minutes, plus a
// per-IP burst cap so it can't be used to spam the DB.
const VIEW_WINDOW_MS = 30 * 60 * 1000;
const BURST_WINDOW_MS = 60 * 1000;
const BURST_MAX = 30;
const MAX_ENTRIES = 5000;
const seenViews = new Map<string, number>();
const burst = new Map<string, { count: number; resetAt: number }>();

function normalizeIp(value: string | null | undefined): string | null {
  if (!value) return null;
  const ip = value.trim();
  if (!ip || ip.length > 45 || /[\s,]/.test(ip)) return null;
  if (!/^[0-9a-fA-F:.]+$/.test(ip)) return null;
  return ip;
}

function isPrivateIp(ip: string): boolean {
  if (ip === "::1" || ip === "localhost") return true;
  const v4 = ip.startsWith("::ffff:") ? ip.slice(7) : ip;
  if (v4.startsWith("127.") || v4.startsWith("10.") || v4.startsWith("192.168.")) {
    return true;
  }
  const match = /^172\.(\d+)\./.exec(v4);
  if (match) {
    const second = Number(match[1]);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

// Only the proxy closest to this server can be trusted: the rightmost
// x-forwarded-for hop was appended by it (LiteSpeed/Apache on cPanel, or the
// Railway edge). Earlier entries are attacker-controlled, so never use the
// leftmost value. Prefer the socket address when it is a public IP.
function getIp(request: Request, clientAddress?: string): string {
  const socketIp = normalizeIp(clientAddress);
  if (socketIp && !isPrivateIp(socketIp)) return socketIp;

  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    const hops = fwd.split(",");
    const trustedHop = normalizeIp(hops[hops.length - 1]);
    if (trustedHop) return trustedHop;
  }

  return socketIp ?? "unknown";
}

function prune(now: number) {
  if (seenViews.size > 5000) {
    for (const [k, t] of seenViews) if (t <= now) seenViews.delete(k);
  }
  if (burst.size > 5000) {
    for (const [k, v] of burst) if (v.resetAt <= now) burst.delete(k);
  }
  capMap(seenViews);
  capMap(burst);
}

// Hard size cap: Maps iterate in insertion order, so evicting from the front
// drops the oldest entries even when nothing has expired yet.
function capMap<T>(map: Map<string, T>) {
  while (map.size > MAX_ENTRIES) {
    const oldest = map.keys().next().value;
    if (oldest === undefined) break;
    map.delete(oldest);
  }
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const now = Date.now();
    const ip = getIp(request, clientAddress);
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
    capMap(seenViews);
    return json({ success: true, counted: true }, 200);
  } catch (error) {
    console.error("Error updating article views:", error);
    return json({ error: "Internal Server Error" }, 500);
  }
};
