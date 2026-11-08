/**
 * Sales Postings module — shared types, helpers, and constants.
 * Used by API routes and Astro pages for the /shop feature.
 */

import { buildCloudinaryImageUrl, resolveCloudName } from "./cloudinary";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SalesPosting {
  id: number;
  slug: string;
  author_id: number;
  title: string;
  body: string;
  status: "draft" | "published";
  price: number | null;
  tags: string; // JSON array string e.g. '["ring","silver"]'
  promo_label: string | null;
  promo_discount_pct: number | null;
  promo_start: string | null;
  promo_end: string | null;
  paypal_button_html: string | null;
  paypal_link: string | null;
  venmo_link: string | null;
  cashapp_link: string | null;
  linked_article_slug: string | null;
  qr_code_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalesImageTransforms {
  bgRemoval: boolean;
  bgColor: string; // 'white' | 'black' | 'transparent' | 'rgb:RRGGBB'
  text: string;
  textPosition: "top" | "bottom" | "corner";
  textColor: string; // 'white' | 'black' | 'gold' | 'rgb:RRGGBB'
}

export interface SalesImage {
  id: number;
  posting_id: number;
  url: string;
  public_id: string;
  transforms: string; // JSON string of SalesImageTransforms
  alt_text: string;
  source: "cloudinary" | "cdn";
  sort_order: number;
  created_at: string;
}

export interface SalesTestimonial {
  id: number;
  posting_id: number;
  author_name: string;
  quote: string;
  rating: number | null;
  sort_order: number;
  created_at: string;
}

export interface SalesReview {
  id: number;
  posting_id: number;
  reviewer_name: string;
  review_text: string;
  rating: number | null;
  is_verified: number;
  review_date: string | null;
  sort_order: number;
  created_at: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const MAX_BODY_BYTES = 1_835_008; // 1.75 MB — same limit as articles
export const MAX_PAYPAL_HTML_BYTES = 4_096; // 4 KB — PayPal buttons are small
export const MAX_PAYMENT_LINK_LENGTH = 2_048;
export const MAX_SALES_IMAGES = 4;

export function isValidPaymentLink(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const link = value.trim();
  if (!link) return true;
  if (link.length > MAX_PAYMENT_LINK_LENGTH) return false;

  try {
    return new URL(link).protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidQrUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > MAX_PAYMENT_LINK_LENGTH) {
    return false;
  }
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com") {
      return false;
    }
    const cloudName = resolveCloudName();
    return !cloudName || url.pathname.startsWith(`/${cloudName}/`);
  } catch {
    return false;
  }
}

export function normalizePaymentLink(value: string): string | null {
  return value.trim() || null;
}

// ── Slug generation ───────────────────────────────────────────────────────────

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Price helpers ─────────────────────────────────────────────────────────────

/**
 * Format a USD price (decimal) to a display string. e.g. 24.99 → "$24.99"
 */
export function formatPrice(price: number | null): string {
  if (price == null) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

/**
 * Calculate the promotional sale price if a promotion is currently active.
 * Returns null if no active promotion.
 */
export function calcSalePrice(posting: SalesPosting): number | null {
  if (
    posting.promo_discount_pct != null &&
    posting.promo_discount_pct > 0 &&
    posting.price != null &&
    posting.promo_start &&
    new Date(posting.promo_start).getTime() <= Date.now() &&
    posting.promo_end &&
    new Date(posting.promo_end).getTime() >= Date.now()
  ) {
    return parseFloat(
      (posting.price * (1 - posting.promo_discount_pct / 100)).toFixed(2),
    );
  }
  return null;
}

/**
 * Returns true if a posting currently has an active promotion.
 */
export function isPromoActive(posting: SalesPosting): boolean {
  return calcSalePrice(posting) !== null;
}

// ── Cloudinary URL builder for sales images ───────────────────────────────────

const DEFAULT_TRANSFORMS: SalesImageTransforms = {
  bgRemoval: false,
  bgColor: "white",
  text: "",
  textPosition: "bottom",
  textColor: "white",
};

/**
 * Parse a transforms JSON string from the DB into a SalesImageTransforms object.
 */
export function parseTransforms(json: string): SalesImageTransforms {
  try {
    const parsed = JSON.parse(json);
    return { ...DEFAULT_TRANSFORMS, ...parsed };
  } catch {
    return { ...DEFAULT_TRANSFORMS };
  }
}

/**
 * Build a Cloudinary delivery URL for a sales image, applying stored transforms.
 * Delegates to the shared buildCloudinaryImageUrl ("sales" preset) so the
 * f_auto/q_auto optimization suffix is guaranteed by one builder.
 * Transformation chain:
 *   1. Background removal (optional): e_background_removal
 *   2. Background color fill (optional, only if bgRemoval ON): b_[color]
 *   3. Resize: w_[width] (default 800) — before the overlay so the text font
 *      size is relative to the final image, not the high-res original
 *   4. Text overlay (optional): l_text:[font]_[size]:[encoded_text],g_[gravity],[angle]
 *   5. Optimization: f_auto/q_auto (appended by the shared builder)
 */
export function buildSalesImageUrl(
  cloudName: string,
  publicId: string,
  transformsJson: string,
  width = 800,
): string {
  const t = parseTransforms(transformsJson);
  const preTransforms: string[] = [];

  if (t.bgRemoval) {
    preTransforms.push("e_background_removal");
    if (t.bgColor && t.bgColor !== "transparent") {
      const color = t.bgColor.startsWith("rgb:") ? t.bgColor : `${t.bgColor}`;
      preTransforms.push(`b_${color}`);
    }
  }

  const postTransforms: string[] = [];
  if (t.text.trim()) {
    const encoded = encodeURIComponent(t.text.trim()).replace(/%20/g, "%20");
    const gravity =
      t.textPosition === "top"
        ? "north"
        : t.textPosition === "corner"
          ? "south_east"
          : "south";
    const angle = t.textPosition === "corner" ? ",a_-20" : "";
    const textColor = t.textColor.startsWith("rgb:")
      ? t.textColor
      : t.textColor === "gold"
        ? "rgb:F2C85A"
        : t.textColor;
    //text font size is fixed at 36 for readability, but could be made customizable in the future if needed. Helvetica bold is used as a clean, widely available font that fits the sales image aesthetic.
    postTransforms.push(
      `l_text:Helvetica_36_bold:${encoded},g_${gravity},y_20${t.textPosition !== "corner" ? "" : ",x_20"}${angle},co_${textColor}`,
    );
  }

  return buildCloudinaryImageUrl({
    cloudName,
    publicId,
    preset: "sales",
    width,
    preTransforms,
    postTransforms,
  });
}

// ── Tags ──────────────────────────────────────────────────────────────────────

export function parseTags(tagsJson: string): string[] {
  try {
    const parsed = JSON.parse(tagsJson);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
