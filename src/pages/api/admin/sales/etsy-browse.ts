import type { APIRoute } from "astro";

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ── Rate limiting: 10 browse requests per user per 60 seconds ────────────────
const browseRateMap = new Map<string, number[]>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const maxRequests = 10;
  const timestamps = (browseRateMap.get(userId) ?? []).filter(
    (t) => now - t < windowMs,
  );
  if (timestamps.length >= maxRequests) return false;
  timestamps.push(now);
  browseRateMap.set(userId, timestamps);
  return true;
}

// ── Section cache: keyed by shop_id, 5-min TTL ───────────────────────────────
interface CachedSections {
  fetchedAt: number;
  sections: Array<{ id: number; title: string }>;
}
const sectionCache = new Map<string, CachedSections>();
const SECTION_TTL_MS = 5 * 60 * 1000;

// ── GET /api/admin/sales/etsy-browse ─────────────────────────────────────────
// Query params:
//   section_id  — numeric shop_section_id or "all" (default: "all")
//   offset      — pagination offset (default: 0)
//   limit       — page size, max 48 (default: 24)
export const GET: APIRoute = async ({ locals, url }) => {
  const user = locals.user;
  if (!user) return json({ error: "Unauthorized" }, 401);
  if (user.role !== "admin" && user.role !== "author") {
    return json({ error: "Forbidden" }, 403);
  }

  if (!checkRateLimit(user.id)) {
    return json({ error: "Rate limit exceeded. Try again in a minute." }, 429);
  }

  const apiKey = process.env.ETSY_API_KEY;
  const shopId = process.env.ETSY_SHOP_ID;

  if (!apiKey)
    return json({ error: "ETSY_API_KEY not configured on server." }, 500);
  if (!shopId)
    return json(
      {
        error:
          "ETSY_SHOP_ID not configured on server. Add ETSY_SHOP_ID=<numeric-shop-id> to your .env file.",
      },
      500,
    );

  const sectionIdParam = url.searchParams.get("section_id") ?? "all";
  const offset = Math.max(0, Number(url.searchParams.get("offset") ?? "0"));
  const limit = Math.min(
    48,
    Math.max(1, Number(url.searchParams.get("limit") ?? "24")),
  );

  const headers = { "x-api-key": apiKey };

  // ── Fetch sections (cached, first page only) ──────────────────────────────
  let sections: Array<{ id: number; title: string }> = [];
  const isFirstPage = offset === 0;

  if (isFirstPage) {
    const cached = sectionCache.get(shopId);
    const now = Date.now();
    if (cached && now - cached.fetchedAt < SECTION_TTL_MS) {
      sections = cached.sections;
    } else {
      try {
        const secRes = await fetch(
          `https://openapi.etsy.com/v3/application/shops/${shopId}/sections`,
          { headers },
        );
        if (secRes.ok) {
          const secData = await secRes.json();
          sections = Array.isArray(secData.results)
            ? secData.results.map((s: any) => ({
                id: s.shop_section_id,
                title: String(s.title),
              }))
            : [];
          sectionCache.set(shopId, { fetchedAt: now, sections });
        }
      } catch {
        // Non-fatal — proceed without sections
      }
    }
  }

  // ── Build listings URL ────────────────────────────────────────────────────
  const listingsParams = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    "includes[]": "Images",
  });
  if (sectionIdParam !== "all") {
    const secId = Number(sectionIdParam);
    if (!isNaN(secId) && secId > 0) {
      listingsParams.set("shop_section_id", String(secId));
    }
  }

  const listingsUrl = `https://openapi.etsy.com/v3/application/shops/${shopId}/listings/active?${listingsParams.toString()}`;

  let total = 0;
  let listings: Array<{
    listing_id: string;
    title: string;
    price_display: string;
    price_amount: number | null;
    price_divisor: number;
    price_currency: string;
    quantity: number | null;
    thumbnail_url: string;
    listing_url: string;
  }> = [];

  try {
    const listRes = await fetch(listingsUrl, { headers });

    if (listRes.status === 404) {
      return json(
        { error: "Shop not found. Check your ETSY_SHOP_ID value." },
        404,
      );
    }
    if (listRes.status === 429) {
      return json(
        { error: "Etsy API rate limit reached. Try again in a moment." },
        429,
      );
    }
    if (!listRes.ok) {
      return json({ error: `Etsy API error: ${listRes.status}` }, 502);
    }

    const listData = await listRes.json();
    total = typeof listData.count === "number" ? listData.count : 0;

    const results: any[] = Array.isArray(listData.results)
      ? listData.results
      : [];

    listings = results.map((item: any) => {
      const price = item.price ?? {};
      const amount: number | null =
        typeof price.amount === "number" ? price.amount : null;
      const divisor: number =
        typeof price.divisor === "number" ? price.divisor : 100;
      const currency: string =
        typeof price.currency_code === "string" ? price.currency_code : "USD";

      let priceDisplay = "";
      if (amount != null) {
        try {
          priceDisplay = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
          }).format(amount / divisor);
        } catch {
          priceDisplay = `${currency} ${(amount / divisor).toFixed(2)}`;
        }
      }

      // Find smallest thumbnail from embedded Images[]
      const imgList: any[] = Array.isArray(item.images) ? item.images : [];
      const thumb = imgList[0]?.url_570xN ?? imgList[0]?.url_fullxfull ?? "";

      return {
        listing_id: String(item.listing_id),
        title: String(item.title ?? ""),
        price_display: priceDisplay,
        price_amount: amount,
        price_divisor: divisor,
        price_currency: currency,
        quantity: typeof item.quantity === "number" ? item.quantity : null,
        thumbnail_url: thumb,
        listing_url:
          item.url ?? `https://www.etsy.com/listing/${item.listing_id}`,
      };
    });
  } catch (err) {
    return json({ error: "Could not reach the Etsy API." }, 502);
  }

  return json(
    {
      sections: isFirstPage ? sections : [],
      listings,
      total,
      offset,
      limit,
      has_more: offset + listings.length < total,
    },
    200,
  );
};
