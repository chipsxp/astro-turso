import type { APIRoute } from "astro";
import { db } from "../lib/db";

function urlEntry(
  loc: string,
  changefreq: string,
  priority: string,
  lastmod?: string,
): string {
  return `  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
  </url>`;
}

export const GET: APIRoute = async ({ url }) => {
  const origin = process.env.SITE_URL || url.origin;
  const today = new Date().toISOString().slice(0, 10);

  const [articlesRes, eventsRes, shopRes] = await Promise.all([
    db.execute(
      `SELECT slug, updated_at, created_at FROM articles WHERE status = 'published' ORDER BY updated_at DESC`,
      [],
    ),
    db.execute(
      `SELECT slug, updated_at, created_at FROM events WHERE status = 'published' ORDER BY created_at DESC`,
      [],
    ),
    db.execute(
      `SELECT slug, updated_at, created_at FROM sales_postings WHERE status = 'published' ORDER BY created_at DESC`,
      [],
    ),
  ]);

  const staticEntries = [
    urlEntry(origin, "weekly", "1.0", today),
    urlEntry(`${origin}/blog`, "daily", "0.9", today),
    urlEntry(`${origin}/upcoming-events`, "daily", "0.9", today),
    urlEntry(`${origin}/events/archive`, "weekly", "0.7", today),
    urlEntry(`${origin}/shop`, "daily", "0.9", today),
    urlEntry(`${origin}/about-us`, "monthly", "0.6"),
    urlEntry(`${origin}/contact-us`, "monthly", "0.5"),
    urlEntry(`${origin}/privacy-policy`, "yearly", "0.3"),
  ];

  const articleEntries = (articlesRes.rows as Record<string, unknown>[]).map(
    (row) => {
      const lastmod = String(row.updated_at ?? row.created_at).slice(0, 10);
      return urlEntry(`${origin}/blog/${row.slug}`, "monthly", "0.8", lastmod);
    },
  );

  const eventEntries = (eventsRes.rows as Record<string, unknown>[]).map(
    (row) => {
      const lastmod = String(row.updated_at ?? row.created_at).slice(0, 10);
      return urlEntry(`${origin}/events/${row.slug}`, "weekly", "0.7", lastmod);
    },
  );

  const shopEntries = (shopRes.rows as Record<string, unknown>[]).map((row) => {
    const lastmod = String(row.updated_at ?? row.created_at).slice(0, 10);
    return urlEntry(`${origin}/shop/${row.slug}`, "weekly", "0.8", lastmod);
  });

  const allEntries = [
    ...staticEntries,
    ...articleEntries,
    ...eventEntries,
    ...shopEntries,
  ].join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
