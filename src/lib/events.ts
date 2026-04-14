import { db } from "./db";

export type EventStatus = "draft" | "published" | "cancelled";

export interface EventRecord {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  body: string;
  owner_id: number;
  owner_email: string | null;
  status: EventStatus;
  start_date: string;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  is_all_day: boolean;
  venue_name: string | null;
  venue_address: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  event_url: string | null;
  featured_media_id: number | null;
  featured_media_public_id: string | null;
  featured_media_url: string | null;
  featured_media_alt_text: string | null;
  created_at: string;
  updated_at: string;
}

export type PublicEventRecord = Omit<
  EventRecord,
  | "id"
  | "owner_id"
  | "owner_email"
  | "featured_media_id"
  | "featured_media_public_id"
>;

export function toPublicEvent(event: EventRecord): PublicEventRecord {
  const {
    id: _id,
    owner_id: _ownerId,
    owner_email: _ownerEmail,
    featured_media_id: _fmId,
    featured_media_public_id: _fmPubId,
    ...pub
  } = event;
  return pub;
}

const EVENTS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    body TEXT NOT NULL,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled')),
    start_date TEXT NOT NULL,
    start_time TEXT,
    end_date TEXT,
    end_time TEXT,
    is_all_day INTEGER NOT NULL DEFAULT 0 CHECK (is_all_day IN (0, 1)),
    venue_name TEXT,
    venue_address TEXT,
    city TEXT,
    region TEXT,
    postal_code TEXT,
    event_url TEXT,
    featured_media_id INTEGER REFERENCES media(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

const EVENTS_INDEXES_SQL = [
  "CREATE INDEX IF NOT EXISTS idx_events_owner_id ON events(owner_id)",
  "CREATE INDEX IF NOT EXISTS idx_events_status ON events(status)",
  "CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date)",
  "CREATE INDEX IF NOT EXISTS idx_events_featured_media_id ON events(featured_media_id)",
];

let eventsSchemaReady = false;

export async function ensureEventsSchema(): Promise<void> {
  if (eventsSchemaReady) return;

  await db.execute(EVENTS_TABLE_SQL);
  for (const indexSql of EVENTS_INDEXES_SQL) {
    await db.execute(indexSql);
  }

  // Idempotent migration: add archive_date column if not present
  // This column tracks when an event became archivable (after its end date passed).
  // Used to enforce 14-day retention window for displaying ended events on public listings.
  try {
    await db.execute("ALTER TABLE events ADD COLUMN archive_date TEXT");
  } catch {
    // Column already exists; safe to continue.
  }

  eventsSchemaReady = true;
}

export function toEventSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeEventStatus(status: unknown): EventStatus {
  if (status === "published") return "published";
  if (status === "cancelled") return "cancelled";
  return "draft";
}

export function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isValidTime24(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function mapEventRow(row: Record<string, unknown>): EventRecord {
  const statusValue = String(row.status ?? "draft");
  const status: EventStatus =
    statusValue === "published" || statusValue === "cancelled"
      ? statusValue
      : "draft";

  return {
    id: Number(row.id),
    title: String(row.title ?? ""),
    slug: String(row.slug ?? ""),
    description: row.description == null ? null : String(row.description),
    body: String(row.body ?? ""),
    owner_id: Number(row.owner_id),
    owner_email: row.owner_email == null ? null : String(row.owner_email),
    status,
    start_date: String(row.start_date ?? ""),
    start_time: row.start_time == null ? null : String(row.start_time),
    end_date: row.end_date == null ? null : String(row.end_date),
    end_time: row.end_time == null ? null : String(row.end_time),
    is_all_day: Number(row.is_all_day ?? 0) === 1,
    venue_name: row.venue_name == null ? null : String(row.venue_name),
    venue_address: row.venue_address == null ? null : String(row.venue_address),
    city: row.city == null ? null : String(row.city),
    region: row.region == null ? null : String(row.region),
    postal_code: row.postal_code == null ? null : String(row.postal_code),
    event_url: row.event_url == null ? null : String(row.event_url),
    featured_media_id:
      row.featured_media_id == null ? null : Number(row.featured_media_id),
    featured_media_public_id:
      row.featured_media_public_id == null
        ? null
        : String(row.featured_media_public_id),
    featured_media_url:
      row.featured_media_url == null ? null : String(row.featured_media_url),
    featured_media_alt_text:
      row.featured_media_alt_text == null
        ? null
        : String(row.featured_media_alt_text),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export const EVENT_SELECT_FIELDS = `
  e.id,
  e.title,
  e.slug,
  e.description,
  e.body,
  e.owner_id,
  e.status,
  e.start_date,
  e.start_time,
  e.end_date,
  e.end_time,
  e.is_all_day,
  e.venue_name,
  e.venue_address,
  e.city,
  e.region,
  e.postal_code,
  e.event_url,
  e.featured_media_id,
  e.created_at,
  e.updated_at,
  u.email AS owner_email,
  m.url AS featured_media_url,
  m.public_id AS featured_media_public_id,
  m.alt_text AS featured_media_alt_text
`;

/**
 * Get the effective end date for an event (falls back to start_date if no end_date).
 * Returns ISO date string (YYYY-MM-DD).
 */
export function getEventEffectiveEndDate(event: EventRecord): string {
  return event.end_date && event.end_date.trim()
    ? event.end_date
    : event.start_date;
}

/**
 * Convert a date to America/New_York local date string.
 * Uses UTC midnight as the baseline and adjusts by -5/-4 hours depending on EST/EDT.
 * Returns ISO date string (YYYY-MM-DD) in New York local time.
 */
export function toNewYorkDate(date: Date): string {
  // Create a formatter for America/New_York
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date in America/New_York timezone.
 */
export function getTodayInNewYork(): string {
  return toNewYorkDate(new Date());
}

/**
 * Get a date N days in the past (in New York timezone).
 * For example, getDaysAgoInNewYork(14) returns the date 14 days ago.
 */
export function getDaysAgoInNewYork(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toNewYorkDate(date);
}

/**
 * Check if an event has ended (effective end date is before today in New York timezone).
 */
export function isEventEnded(event: EventRecord): boolean {
  const eventEndDate = getEventEffectiveEndDate(event);
  const todayNY = getTodayInNewYork();
  return eventEndDate < todayNY;
}

/**
 * Check if an event is within the 14-day archive window.
 * Returns true if the event has ended but is still within 14 days of its end date.
 */
export function isEventInArchiveWindow(event: EventRecord): boolean {
  const eventEndDate = getEventEffectiveEndDate(event);
  const todayNY = getTodayInNewYork();
  const fourteenDaysAgoNY = getDaysAgoInNewYork(14);

  // Event must have ended and be within the last 14 days
  return eventEndDate < todayNY && eventEndDate >= fourteenDaysAgoNY;
}

/**
 * Get the lifecycle state of an event for UI display.
 * Returns one of: "upcoming", "ended", "archived".
 * "ended" = 0-3 days past end date, "archived" = 4-14 days past.
 */
export function getEventLifecycleLabel(
  event: EventRecord,
): "upcoming" | "ended" | "archived" {
  if (!isEventEnded(event)) return "upcoming";

  const eventEndDate = getEventEffectiveEndDate(event);
  const todayNY = getTodayInNewYork();
  const threeDaysAgoNY = getDaysAgoInNewYork(3);

  // Ended within last 3 days = "ended", otherwise "archived"
  return eventEndDate >= threeDaysAgoNY ? "ended" : "archived";
}

/**
 * Check if an event should be visible on public listings (upcoming or archive pages).
 * Returns true if event is published AND (upcoming OR within 14-day archive window).
 */
export function isEventPubliclyVisible(event: EventRecord): boolean {
  if (event.status !== "published") return false;
  if (!isEventEnded(event)) return true; // Upcoming events are always visible
  return isEventInArchiveWindow(event); // Ended events only visible if within 14-day window
}

/**
 * Check if an event should be shown on the Upcoming Events page.
 * Returns true if event is published and not yet ended.
 */
export function isEventUpcoming(event: EventRecord): boolean {
  if (event.status !== "published") return false;
  return !isEventEnded(event);
}

/**
 * Check if an event should be shown on the Archive Events page.
 * Returns true if event is published and within 14-day archive window.
 */
export function isEventArchivable(event: EventRecord): boolean {
  if (event.status !== "published") return false;
  return isEventInArchiveWindow(event);
}

/**
 * Check if an event should be shown on the Archive page (permanent archive).
 * Returns true if event is published and has ended (no time limit).
 * Archive is permanent; manual deletion via admin dashboard.
 */
export function isEventArchivedPermanently(event: EventRecord): boolean {
  if (event.status !== "published") return false;
  return isEventEnded(event); // All ended events, no 14-day cutoff
}

/**
 * Get a human-readable "concluded X time ago" label for archive page display.
 * Examples: "concluded yesterday", "concluded 2 weeks ago", "concluded 3 months ago"
 */
export function getArchiveBadgeLabel(event: EventRecord): string {
  const eventEndDate = getEventEffectiveEndDate(event);
  const todayNY = getTodayInNewYork();

  // Parse dates and calculate days difference
  const eventDate = new Date(`${eventEndDate}T00:00:00`);
  const today = new Date(`${todayNY}T00:00:00`);
  const daysAgo = Math.floor(
    (today.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysAgo === 0) return "concluded today";
  if (daysAgo === 1) return "concluded yesterday";
  if (daysAgo < 7) return `concluded ${daysAgo} days ago`;

  const weeksAgo = Math.floor(daysAgo / 7);
  if (daysAgo < 30)
    return `concluded ${weeksAgo} week${weeksAgo > 1 ? "s" : ""} ago`;

  const monthsAgo = Math.floor(daysAgo / 30);
  if (daysAgo < 365)
    return `concluded ${monthsAgo} month${monthsAgo > 1 ? "s" : ""} ago`;

  const yearsAgo = Math.floor(daysAgo / 365);
  return `concluded ${yearsAgo} year${yearsAgo > 1 ? "s" : ""} ago`;
}
