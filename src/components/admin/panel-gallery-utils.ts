import { buildCloudinaryImageUrl } from "../../lib/cloudinary";

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

export const SLOT_META: Record<
  PanelSlot,
  { location: string; bgHint: string }
> = {
  "panel-01": { location: "Hero — top-left", bgHint: "var(--surface-2)" },
  "panel-02": { location: "Hero — top-right", bgHint: "#3a7bd5" },
  "panel-03": { location: "Hero — bottom wide", bgHint: "var(--surface)" },
  "panel-04": { location: "Splash Screen", bgHint: "#3a7bd5" },
};

export const VALID_SLOTS: PanelSlot[] = [
  "panel-01",
  "panel-02",
  "panel-03",
  "panel-04",
];

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

export function thumbUrl(item: PanelMedia, cloudName: string): string {
  if (item.public_id && cloudName) {
    try {
      return buildCloudinaryImageUrl({
        cloudName,
        publicId: item.public_id,
        preset: "thumb",
      });
    } catch {
      return item.url;
    }
  }
  return item.url;
}

export function showToast(type: "success" | "error", message: string) {
  window.dispatchEvent(
    new CustomEvent("admin-media-toast", {
      detail: { galleryId: "panels", type, message },
    }),
  );
}
