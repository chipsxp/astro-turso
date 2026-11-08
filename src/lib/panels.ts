import { db } from "./db";

// ─── Types ───────────────────────────────────────────────────────────────────

export type PanelSlot = "panel-01" | "panel-02" | "panel-03" | "panel-04";

export interface PanelMedia {
  id: number;
  public_id: string;
  url: string;
  alt_text: string;
  width: number | null;
  height: number | null;
  format: string | null;
  created_at: string;
}

export interface PanelAssignment {
  slot: PanelSlot;
  label: string;
  media_id: number | null;
  media_public_id: string | null;
  url: string | null;
  alt_text: string | null;
  updated_at: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const VALID_SLOTS: PanelSlot[] = [
  "panel-01",
  "panel-02",
  "panel-03",
  "panel-04",
];

export const SLOT_META: Record<
  PanelSlot,
  { label: string; cssTarget: string; location: string }
> = {
  "panel-01": {
    label: "Panel 01",
    cssTarget: ".panel-deco__frame (default)",
    location: "Hero — top-left",
  },
  "panel-02": {
    label: "Panel 02",
    cssTarget: ".panel-deco__frame--b",
    location: "Hero — top-right",
  },
  "panel-03": {
    label: "Panel 03",
    cssTarget: ".panel-deco__frame--c",
    location: "Hero — bottom (wide)",
  },
  "panel-04": {
    label: "Panel 04",
    cssTarget: ".splash-panel--kirby",
    location: "Splash Screen",
  },
};

// ─── Queries ─────────────────────────────────────────────────────────────────

function mapAssignmentRow(row: Record<string, unknown>): PanelAssignment {
  return {
    slot: String(row.slot) as PanelSlot,
    label: String(row.label),
    media_id: row.media_id == null ? null : Number(row.media_id),
    media_public_id:
      row.media_public_id == null ? null : String(row.media_public_id),
    url: row.url == null ? null : String(row.url),
    alt_text: row.alt_text == null ? null : String(row.alt_text),
    updated_at: String(row.updated_at),
  };
}

function mapMediaRow(row: Record<string, unknown>): PanelMedia {
  return {
    id: Number(row.id),
    public_id: String(row.public_id),
    url: String(row.url),
    alt_text: String(row.alt_text),
    width: row.width == null ? null : Number(row.width),
    height: row.height == null ? null : Number(row.height),
    format: row.format == null ? null : String(row.format),
    created_at: String(row.created_at),
  };
}

/** Returns all 4 slot assignments, LEFT JOINed with their assigned image. */
export async function getCurrentPanelAssignments(): Promise<PanelAssignment[]> {

  const result = await db.execute(`
    SELECT pa.slot, pa.label, pa.media_id, pm.public_id AS media_public_id, pm.url, pm.alt_text, pa.updated_at
    FROM panel_assignments pa
    LEFT JOIN panel_media pm ON pm.id = pa.media_id
    ORDER BY pa.slot ASC
  `);

  return result.rows.map((row: Record<string, unknown>) =>
    mapAssignmentRow(row),
  );
}

export type PanelImageEntry = {
  url: string | null;
  publicId: string | null;
  altText: string | null;
};

/**
 * Convenience helper for Astro frontmatter — returns a slot → { url, publicId } map.
 * Both values are null when no image is assigned to that slot.
 */
export async function getPanelImageMap(): Promise<
  Record<PanelSlot, PanelImageEntry>
> {
  const rows = await getCurrentPanelAssignments();
  return Object.fromEntries(
    rows.map((r) => [
      r.slot,
      { url: r.url, publicId: r.media_public_id, altText: r.alt_text },
    ]),
  ) as Record<PanelSlot, PanelImageEntry>;
}

/**
 * Gallery query: images uploaded within the last 7 days, newest first.
 * This is the only set shown in the admin gallery picker.
 */
export async function getRecentPanelMedia(): Promise<PanelMedia[]> {

  const result = await db.execute(`
    SELECT id, public_id, url, alt_text, width, height, format, created_at
    FROM panel_media
    WHERE created_at >= datetime('now', '-7 days')
    ORDER BY created_at DESC
  `);

  return result.rows.map((row: Record<string, unknown>) => mapMediaRow(row));
}
