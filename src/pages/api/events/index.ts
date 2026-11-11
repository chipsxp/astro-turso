import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import {
  EVENT_LIST_FIELDS,
  getEventLifecycleLabel,
  isEventPubliclyVisible,
  isValidIsoDate,
  isValidTime24,
  mapEventRow,
  normalizeEventStatus,
  toEventSlug,
  toPublicEvent,
  type EventRecord,
} from "../../../lib/events";
import { json } from "../../../lib/api-response";
import { createRateLimiter, getClientIp } from "../../../lib/rate-limit";
import { requireUser } from "../../../lib/auth";

// --- In-memory rate limiter: 120 requests per IP per minute (public read) ---
const readLimiter = createRateLimiter({ limit: 120, windowMs: 60 * 1000 });

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
  if (readLimiter.limited(ip)) {
    return json({ error: "Too many requests" }, 429);
  }
  readLimiter.record(ip);

  try {
    const result = await db.execute(
      `SELECT ${EVENT_LIST_FIELDS}
       FROM events e
       LEFT JOIN users u ON u.id = e.owner_id
       LEFT JOIN media m ON m.id = e.featured_media_id
       WHERE e.status = 'published'
       ORDER BY date(e.start_date) DESC, COALESCE(time(e.start_time), '23:59') DESC`,
    );

    const allEvents: EventRecord[] = result.rows.map(
      (row: Record<string, unknown>) => mapEventRow(row),
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
  const user = requireUser(locals);
  if (!user) return json({ error: "Unauthorized" }, 401);

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
  const color = normalizeOptionalText(data.color);

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
         event_url, color, featured_media_id
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        color,
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
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      err.message.includes("UNIQUE constraint failed")
    ) {
      return json({ error: "An event with that slug already exists" }, 409);
    }

    return json({ error: "Database error" }, 500);
  }
};
