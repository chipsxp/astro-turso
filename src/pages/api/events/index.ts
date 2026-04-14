import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import {
  EVENT_SELECT_FIELDS,
  ensureEventsSchema,
  getEventLifecycleLabel,
  isEventPubliclyVisible,
  isValidIsoDate,
  isValidTime24,
  mapEventRow,
  normalizeEventStatus,
  toEventSlug,
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

export const GET: APIRoute = async ({ request }) => {
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
       WHERE e.status = 'published'
       ORDER BY date(e.start_date) DESC, COALESCE(time(e.start_time), '23:59') DESC`,
    );

    const allEvents = result.rows.map((row: Record<string, unknown>) =>
      mapEventRow(row),
    );

    // Filter to only publicly visible events (upcoming + within 14-day archive window)
    // and add lifecycle metadata
    const visibleEvents = allEvents
      .filter(isEventPubliclyVisible)
      .map((event) => ({
        ...toPublicEvent(event),
        lifecycle: getEventLifecycleLabel(event),
      }));

    return json({ events: visibleEvents }, 200);
  } catch {
    return json({ error: "Database error" }, 500);
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return json({ error: "Unauthorized" }, 401);

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

  const title = String(data.title ?? "").trim();
  const body = String(data.body ?? "").trim();
  const slug = String(data.slug ?? "").trim() || toEventSlug(title);
  const status = normalizeEventStatus(data.status);
  const description = normalizeOptionalText(data.description);

  const startDate = String(data.start_date ?? "").trim();
  const startTime = normalizeOptionalText(data.start_time);
  const endDate = normalizeOptionalText(data.end_date);
  const endTime = normalizeOptionalText(data.end_time);
  const isAllDay = normalizeBooleanFlag(data.is_all_day);

  const venueName = normalizeOptionalText(data.venue_name);
  const venueAddress = normalizeOptionalText(data.venue_address);
  const city = normalizeOptionalText(data.city);
  const region = normalizeOptionalText(data.region);
  const postalCode = normalizeOptionalText(data.postal_code);
  const eventUrl = normalizeOptionalText(data.event_url);

  const featuredMediaId =
    data.featured_media_id == null || data.featured_media_id === ""
      ? null
      : Number(data.featured_media_id);

  if (!title || !body || !startDate) {
    return json({ error: "title, body, and start_date are required" }, 400);
  }

  if (!slug) {
    return json({ error: "Could not derive a slug from the given title" }, 400);
  }

  if (!isValidIsoDate(startDate)) {
    return json({ error: "start_date must use YYYY-MM-DD format" }, 400);
  }

  if (endDate && !isValidIsoDate(endDate)) {
    return json({ error: "end_date must use YYYY-MM-DD format" }, 400);
  }

  if (startTime && !isValidTime24(startTime)) {
    return json({ error: "start_time must use HH:MM 24-hour format" }, 400);
  }

  if (endTime && !isValidTime24(endTime)) {
    return json({ error: "end_time must use HH:MM 24-hour format" }, 400);
  }

  const bodyValidationError = validateEventBody(body);
  if (bodyValidationError) {
    return json({ error: bodyValidationError }, 400);
  }

  if (eventUrl && !/^https?:\/\//i.test(eventUrl)) {
    return json(
      { error: "event_url must start with http:// or https://" },
      400,
    );
  }

  if (featuredMediaId != null && !Number.isInteger(featuredMediaId)) {
    return json({ error: "featured_media_id must be an integer" }, 400);
  }

  try {
    if (featuredMediaId != null) {
      const mediaResult = await db.execute(
        user.role === "admin"
          ? "SELECT m.id FROM media m WHERE m.id = ? LIMIT 1"
          : `SELECT m.id
             FROM media m
             JOIN articles a ON a.id = m.article_id
             WHERE m.id = ? AND a.author_id = ?
             LIMIT 1`,
        user.role === "admin"
          ? [featuredMediaId]
          : [featuredMediaId, Number(user.id)],
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

    const result = await db.execute(
      `INSERT INTO events (
         title, slug, description, body,
         owner_id, status,
         start_date, start_time, end_date, end_time, is_all_day,
         venue_name, venue_address, city, region, postal_code,
         event_url, featured_media_id
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        description,
        body,
        Number(user.id),
        status,
        startDate,
        startTime,
        endDate,
        endTime,
        isAllDay,
        venueName,
        venueAddress,
        city,
        region,
        postalCode,
        eventUrl,
        featuredMediaId,
      ],
    );

    return json(
      {
        event_id: Number(result.lastInsertRowid),
        slug,
        preview_url: `/events/${slug}`,
      },
      201,
    );
  } catch (err: any) {
    if (err?.message?.includes("UNIQUE constraint failed")) {
      return json({ error: "An event with that slug already exists" }, 409);
    }

    return json({ error: "Database error" }, 500);
  }
};
