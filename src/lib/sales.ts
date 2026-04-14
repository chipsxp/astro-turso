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
  etsy_listing_id: string | null;
  etsy_listing_url: string | null;
  etsy_price_amount: number | null;
  etsy_price_divisor: number;
  etsy_price_currency: string;
  etsy_quantity: number | null;
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

export interface SalesImage {
  id: number;
  posting_id: number;
  url: string;
  alt_text: string;
  source: "etsy" | "cloudinary" | "cdn";
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
 * Format an Etsy price (stored as integer units + divisor) to a display string.
 * e.g. amount=2499, divisor=100, currency='USD' → "$24.99"
 */
export function formatEtsyPrice(
  amount: number,
  divisor: number,
  currency: string,
): string {
  const value = amount / divisor;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

/**
 * Calculate the promotional sale price for a posting if a promotion is currently active.
 * Returns null if no active promotion exists.
 *
 * NOTE: This is a display-only price. The buyer pays the Etsy-set price at checkout.
 */
export function calcSalePrice(posting: SalesPosting): number | null {
  const now = Date.now();
  if (
    posting.promo_discount_pct != null &&
    posting.promo_discount_pct > 0 &&
    posting.promo_start &&
    new Date(posting.promo_start).getTime() <= now &&
    posting.promo_end &&
    new Date(posting.promo_end).getTime() >= now &&
    posting.etsy_price_amount != null &&
    posting.etsy_price_divisor
  ) {
    const base = posting.etsy_price_amount / posting.etsy_price_divisor;
    return parseFloat(
      (base * (1 - posting.promo_discount_pct / 100)).toFixed(2),
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

// ── Etsy description → HTML ───────────────────────────────────────────────────

/**
 * Convert Etsy plain-text listing description to basic HTML for the Quill editor.
 * Etsy descriptions are plain text; double newlines = paragraph breaks.
 */
export function etsyDescriptionToHtml(text: string): string {
  if (!text) return "";
  return text
    .split(/\n{2,}/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => `<p>${para.replace(/\n/g, "<br>")}</p>`)
    .join("\n");
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
