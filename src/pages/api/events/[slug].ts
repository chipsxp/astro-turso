import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import {
  EVENT_SELECT_FIELDS,
  ensureEventsSchema,
  isValidIsoDate,
  isValidTime24,
  mapEventRow,
  normalizeEventStatus,
  toPublicEvent,
} from "../../../lib/events";
import { ensureMediaTable } from "../../../lib/media";

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

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const MAX_EVENT_BODY_BYTES = 1310720; // 1.25 MB

function validateEventBody(body: string): string | null {
  const bodyBytes = new TextEncoder().encode(body).length;
  if (bodyBytes > MAX_EVENT_BODY_BYTES) {
    return "Event details are too large (max 1.25 MB).";
  }

  return null;
}

function normalizeOptionalText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeBooleanFlag(value: unknown): number {
  return value === true || value === 1 || value === "1" ? 1 : 0;
}

export const GET: APIRoute = async ({ params, request }) => {
  const slug = params.slug;
  if (!slug) return json({ error: "Missing slug" }, 400);

  const ip = getClientIp(request);
  if (isReadRateLimited(ip)) {
    return json({ error: "Too many requests" }, 429);
  }
  recordReadAttempt(ip);

  try {
    await ensureEventsSchema();

    const result = await db.execute(
      `SELECT ${EVENT_SELECT_FIELDS}
       FROM events e
       LEFT JOIN users u ON u.id = e.owner_id
       LEFT JOIN media m ON m.id = e.featured_media_id
       WHERE e.slug = ?
         AND e.status = 'published'`,
      [slug],
    );

    const row = result.rows[0] as Record<string, unknown> | undefined;
    if (!row) return json({ error: "Event not found" }, 404);

    return json(toPublicEvent(mapEventRow(row)), 200);
  } catch {
    return json({ error: "Database error" }, 500);
  }
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const user = locals.user;
  const slug = params.slug;

  if (!user) return json({ error: "Unauthorized" }, 401);
  if (!slug) return json({ error: "Missing slug" }, 400);

  try {
    await ensureEventsSchema();
    await ensureMediaTable();
  } catch {
    return json({ error: "Database error" }, 500);
  }

  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  try {
    const existing = await db.execute(
      user.role === "admin"
        ? "SELECT id FROM events WHERE slug = ?"
        : "SELECT id FROM events WHERE slug = ? AND owner_id = ?",
      user.role === "admin" ? [slug] : [slug, Number(user.id)],
    );

    const eventRow = existing.rows[0] as Record<string, unknown> | undefined;
    if (!eventRow) return json({ error: "Event not found" }, 404);

    const eventId = Number(eventRow.id);

    const fields: string[] = [];
    const values: Array<string | number | null> = [];

    if (data.title !== undefined) {
      const title = String(data.title).trim();
      if (!title) return json({ error: "title cannot be empty" }, 400);
      fields.push("title = ?");
      values.push(title);
    }

    if (data.slug !== undefined) {
      const nextSlug = String(data.slug).trim();
      if (!nextSlug) return json({ error: "slug cannot be empty" }, 400);
      fields.push("slug = ?");
      values.push(nextSlug);
    }

    if (data.description !== undefined) {
      fields.push("description = ?");
      values.push(normalizeOptionalText(data.description));
    }

    if (data.body !== undefined) {
      const body = String(data.body).trim();
      if (!body) return json({ error: "body cannot be empty" }, 400);

      const bodyValidationError = validateEventBody(body);
      if (bodyValidationError) return json({ error: bodyValidationError }, 400);

      fields.push("body = ?");
      values.push(body);
    }

    if (data.status !== undefined) {
      fields.push("status = ?");
      values.push(normalizeEventStatus(data.status));
    }

    if (data.start_date !== undefined) {
      const startDate = String(data.start_date ?? "").trim();
      if (!isValidIsoDate(startDate)) {
        return json({ error: "start_date must use YYYY-MM-DD format" }, 400);
      }
      fields.push("start_date = ?");
      values.push(startDate);
    }

    if (data.start_time !== undefined) {
      const startTime = normalizeOptionalText(data.start_time);
      if (startTime && !isValidTime24(startTime)) {
        return json({ error: "start_time must use HH:MM 24-hour format" }, 400);
      }
      fields.push("start_time = ?");
      values.push(startTime);
    }

    if (data.end_date !== undefined) {
      const endDate = normalizeOptionalText(data.end_date);
      if (endDate && !isValidIsoDate(endDate)) {
        return json({ error: "end_date must use YYYY-MM-DD format" }, 400);
      }
      fields.push("end_date = ?");
      values.push(endDate);
    }

    if (data.end_time !== undefined) {
      const endTime = normalizeOptionalText(data.end_time);
      if (endTime && !isValidTime24(endTime)) {
        return json({ error: "end_time must use HH:MM 24-hour format" }, 400);
      }
      fields.push("end_time = ?");
      values.push(endTime);
    }

    if (data.is_all_day !== undefined) {
      fields.push("is_all_day = ?");
      values.push(normalizeBooleanFlag(data.is_all_day));
    }

    if (data.venue_name !== undefined) {
      fields.push("venue_name = ?");
      values.push(normalizeOptionalText(data.venue_name));
    }

    if (data.venue_address !== undefined) {
      fields.push("venue_address = ?");
      values.push(normalizeOptionalText(data.venue_address));
    }

    if (data.city !== undefined) {
      fields.push("city = ?");
      values.push(normalizeOptionalText(data.city));
    }

    if (data.region !== undefined) {
      fields.push("region = ?");
      values.push(normalizeOptionalText(data.region));
    }

    if (data.postal_code !== undefined) {
      fields.push("postal_code = ?");
      values.push(normalizeOptionalText(data.postal_code));
    }

    if (data.event_url !== undefined) {
      const eventUrl = normalizeOptionalText(data.event_url);
      if (eventUrl && !/^https?:\/\//i.test(eventUrl)) {
        return json(
          { error: "event_url must start with http:// or https://" },
          400,
        );
      }
      fields.push("event_url = ?");
      values.push(eventUrl);
    }

    if (data.color !== undefined) {
      fields.push("color = ?");
      values.push(normalizeOptionalText(data.color));
    }

    if (data.featured_media_id !== undefined) {
      const mediaId =
        data.featured_media_id == null || data.featured_media_id === ""
          ? null
          : Number(data.featured_media_id);

      if (mediaId != null) {
        if (!Number.isInteger(mediaId)) {
          return json({ error: "featured_media_id must be an integer" }, 400);
        }
        const mediaResult = await db.execute(
          user.role === "admin"
            ? "SELECT m.id FROM media m WHERE m.id = ? LIMIT 1"
            : `SELECT m.id
               FROM media m
               JOIN articles a ON a.id = m.article_id
               WHERE m.id = ? AND a.author_id = ?
               LIMIT 1`,
          user.role === "admin" ? [mediaId] : [mediaId, Number(user.id)],
        );
        if (!mediaResult.rows[0]) {
          return json(
            {
              error:
                "featured_media_id does not exist or is not owned by this author",
            },
            400,
          );
        }
      }

      fields.push("featured_media_id = ?");
      values.push(mediaId);
    }

    if (fields.length === 0) {
      return json({ updated: true }, 200);
    }

    fields.push("updated_at = datetime('now')");
    values.push(eventId);

    await db.execute(
      `UPDATE events SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );

    return json({ updated: true }, 200);
  } catch (err: any) {
    if (err?.message?.includes("UNIQUE constraint failed")) {
      return json({ error: "An event with that slug already exists" }, 409);
    }

    return json({ error: "Database error" }, 500);
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  const slug = params.slug;

  if (!user) return json({ error: "Unauthorized" }, 401);
  if (!slug) return json({ error: "Missing slug" }, 400);

  try {
    await ensureEventsSchema();

    const existing = await db.execute(
      user.role === "admin"
        ? "SELECT id FROM events WHERE slug = ?"
        : "SELECT id FROM events WHERE slug = ? AND owner_id = ?",
      user.role === "admin" ? [slug] : [slug, Number(user.id)],
    );

    const row = existing.rows[0] as Record<string, unknown> | undefined;
    if (!row) return json({ error: "Event not found" }, 404);

    await db.execute("DELETE FROM events WHERE id = ?", [Number(row.id)]);

    return json({ deleted: true }, 200);
  } catch {
    return json({ error: "Database error" }, 500);
  }
};
