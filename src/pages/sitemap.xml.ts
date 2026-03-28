import type { APIRoute } from "astro";
import { db } from "../lib/db";

export const GET: APIRoute = async () => {
  const siteUrl = import.meta.env.SITE_URL ?? "";

  // Fetch all published article slugs and their last-modified dates
  const result = await db.execute(
    `SELECT slug, updated_at, created_at
     FROM articles
     WHERE status = 'published'
     ORDER BY updated_at DESC`
  );

  const articleUrls = result.rows
    .map((row: Record<string, unknown>) => {
      const slug    = String(row.slug);
      const lastmod = String(row.updated_at ?? row.created_at).split("T")[0];
      return `
  <url>
    <loc>${siteUrl}/blog/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join("");

  const today = new Date().toISOString().split("T")[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>${articleUrls}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
