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
