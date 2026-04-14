import type { APIRoute } from "astro";
import { etsyDescriptionToHtml } from "../../../../lib/sales";

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ── Rate limiting: 5 imports per user per 60 seconds ─────────────────────────
const importRateMap = new Map<string, number[]>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const maxRequests = 5;
  const timestamps = (importRateMap.get(userId) ?? []).filter(
    (t) => now - t < windowMs,
  );
  if (timestamps.length >= maxRequests) return false;
  timestamps.push(now);
  importRateMap.set(userId, timestamps);
  return true;
}

// ── Etsy listing ID extraction ────────────────────────────────────────────────
function extractListingId(input: string): string | null {
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/etsy\.com\/listing\/(\d+)/);
  return match ? match[1] : null;
}

// ── POST /api/admin/sales/etsy-import ─────────────────────────────────────────
export const POST: APIRoute = async ({ locals, request }) => {
  const user = locals.user;
  if (!user) return json({ error: "Unauthorized" }, 401);
  if (user.role !== "admin" && user.role !== "author") {
    return json({ error: "Forbidden" }, 403);
  }

  if (!checkRateLimit(user.id)) {
    return json({ error: "Rate limit exceeded. Try again in a minute." }, 429);
  }

  let body: { listing_url?: string; listing_id?: string | number };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  // Accept either a listing_id directly (from browser picker) or a URL/ID string
  const listingId = body.listing_id
    ? String(body.listing_id).trim()
    : extractListingId(body.listing_url ?? "");
  if (!listingId) {
    return json(
      {
        error:
          "Could not parse an Etsy listing ID. Provide a full Etsy listing URL, a bare listing ID, or use the product browser.",
      },
      400,
    );
  }

  const apiKey = process.env.ETSY_API_KEY;
  if (!apiKey) {
    return json({ error: "Etsy API key not configured on server." }, 500);
  }

  const headers = { "x-api-key": apiKey };

  // ── Fetch listing ─────────────────────────────────────────────────────────
  let listing: Record<string, any>;
  try {
    const listingRes = await fetch(
      `https://api.etsy.com/v3/application/listings/${listingId}`,
      { headers },
    );
    if (listingRes.status === 404)
      return json({ error: "Etsy listing not found." }, 404);
    if (listingRes.status === 429) {
      return json(
        { error: "Etsy API rate limit reached. Try again later." },
        429,
      );
    }
    if (!listingRes.ok)
      return json({ error: `Etsy API error: ${listingRes.status}` }, 502);
    listing = await listingRes.json();
  } catch {
    return json({ error: "Could not reach the Etsy API." }, 502);
  }

  if (listing.state !== "active") {
    return json(
      {
        error: `Listing is not active (state: "${listing.state}"). Only active listings can be imported.`,
      },
      400,
    );
  }

  // ── Fetch listing images ──────────────────────────────────────────────────
  let images: Array<{
    url_fullxfull: string;
    url_570xN: string;
    alt_text?: string;
  }> = [];
  try {
    const imgRes = await fetch(
      `https://api.etsy.com/v3/application/listings/${listingId}/images`,
      { headers },
    );
    if (imgRes.ok) {
      const imgData = await imgRes.json();
      images = Array.isArray(imgData.results) ? imgData.results : [];
    }
  } catch {
    // Non-fatal — proceed without images
  }

  // ── Build response payload ────────────────────────────────────────────────
  const price = listing.price ?? {};
  const priceAmount: number | null =
    typeof price.amount === "number" ? price.amount : null;
  const priceDivisor: number =
    typeof price.divisor === "number" ? price.divisor : 100;
  const priceCurrency: string =
    typeof price.currency_code === "string" ? price.currency_code : "USD";

  const bodyHtml = etsyDescriptionToHtml(listing.description ?? "");

  const importedImages = images.map((img, i) => ({
    url: img.url_fullxfull ?? img.url_570xN ?? "",
    thumbnail_url: img.url_570xN ?? img.url_fullxfull ?? "",
    alt_text: img.alt_text ?? "",
    sort_order: i,
    source: "etsy" as const,
  }));

  return json(
    {
      listing_id: String(listing.listing_id),
      title: listing.title ?? "",
      body_html: bodyHtml,
      listing_url: listing.url ?? `https://www.etsy.com/listing/${listingId}`,
      price_amount: priceAmount,
      price_divisor: priceDivisor,
      price_currency: priceCurrency,
      quantity: typeof listing.quantity === "number" ? listing.quantity : null,
      tags: Array.isArray(listing.tags) ? listing.tags : [],
      images: importedImages,
    },
    200,
  );
};
