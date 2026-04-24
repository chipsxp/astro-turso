/**
 * Sales Postings module — shared types, helpers, and constants.
 * Used by API routes and Astro pages for the /shop feature.
 */

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
  linked_article_slug: string | null;
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
export const MAX_SALES_IMAGES = 4;

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
 * Transformation chain:
 *   1. Background removal (optional): e_background_removal
 *   2. Background color fill (optional, only if bgRemoval ON): b_[color]
 *   3. Text overlay (optional): l_text:[font]_[size]:[encoded_text],g_[gravity],[angle]
 *   4. Optimization: f_auto,q_auto,w_800
 */
export function buildSalesImageUrl(
  cloudName: string,
  publicId: string,
  transformsJson: string,
  width = 800,
): string {
  const t = parseTransforms(transformsJson);
  const parts: string[] = [];

  if (t.bgRemoval) {
    parts.push("e_background_removal");
    if (t.bgColor && t.bgColor !== "transparent") {
      const color = t.bgColor.startsWith("rgb:") ? t.bgColor : `${t.bgColor}`;
      parts.push(`b_${color}`);
    }
  }

  // Resize first so text overlay font size is relative to the final 800px image,
  // not the original high-res upload (which would shrink the text dramatically).
  parts.push(`w_${width}`);

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
    parts.push(
      `l_text:Helvetica_36_bold:${encoded},g_${gravity},y_20${t.textPosition !== "corner" ? "" : ",x_20"}${angle},co_${textColor}`,
    );
  }

  parts.push(`f_auto,q_auto`);

  const chain = parts.join("/");
  return `https://res.cloudinary.com/${cloudName}/image/upload/${chain}/${publicId}`;
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
