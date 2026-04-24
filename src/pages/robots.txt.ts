import type { APIRoute } from "astro";

export const GET: APIRoute = ({ url }) => {
  const origin = process.env.SITE_URL || url.origin;
  const sitemapUrl = new URL("/sitemap.xml", origin).href;

  const content = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${sitemapUrl}
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
