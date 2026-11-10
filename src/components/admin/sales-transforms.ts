import type { SalesImageTransforms } from "../../lib/sales";

export interface SalesImageRecord {
  id: number;
  url: string;
  public_id: string;
  alt_text: string;
  transforms: string;
  sort_order: number;
}

export const BG_COLORS = [
  { label: "White", value: "white" },
  { label: "Black", value: "black" },
  { label: "Cream", value: "rgb:F5F0E8" },
  { label: "Beige", value: "rgb:E8D9C5" },
  { label: "Gray", value: "rgb:CCCCCC" },
  { label: "Transparent", value: "transparent" },
];

export const TEXT_COLORS = [
  { label: "White", value: "white" },
  { label: "Black", value: "black" },
  { label: "Gold", value: "gold" },
];

export const MAX_IMAGES = 4;

export function defaultTransforms(): SalesImageTransforms {
  return {
    bgRemoval: false,
    bgColor: "white",
    text: "",
    textPosition: "bottom",
    textColor: "white",
  };
}

export function parseTransforms(json: string): SalesImageTransforms {
  try {
    return { ...defaultTransforms(), ...JSON.parse(json) };
  } catch {
    return defaultTransforms();
  }
}
