import { defineMiddleware } from "astro:middleware";
import { jwtVerify } from "jose";
import { db } from "./lib/db";

// Routes that skip auth entirely regardless of method.
const PUBLIC_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
];
const WRITE_METHODS = new Set(["POST", "PUT", "DELETE", "PATCH"]);

// Module-level secret key — TextEncoder is only called once at startup
const JWT_SECRET_KEY = new TextEncoder().encode(import.meta.env.JWT_SECRET);

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = new URL(context.request.url);
  const method = context.request.method;

  // Auth is required for:
  //   - all server-rendered admin pages (except the login page itself at /admin)
  //   - all /api/admin/* routes (any method)
  //   - write-method calls to any /api/* route (except PUBLIC_PATHS)
  const needsAuth =
    (pathname.startsWith("/admin/") && pathname !== "/admin/") ||
    pathname.startsWith("/api/admin/") ||
    (pathname.startsWith("/api/") &&
      WRITE_METHODS.has(method) &&
      !PUBLIC_PATHS.includes(pathname));

  // --- Always attempt to identify the logged-in user from the cookie ---
  // This runs on every route so that public pages (e.g. /blog/[slug]) can
  // still access Astro.locals.user and render auth-aware UI (e.g. SocialShare).
  const cookieHeader = context.request.headers.get("Cookie") ?? "";
  const tokenMatch = cookieHeader.match(/(?:^|;\s*)auth_token=([^;]+)/);
  const token = tokenMatch?.[1] ?? null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
      const userId = Number(String(payload.sub ?? ""));
      if (Number.isInteger(userId) && userId >= 1) {
        const userResult = await db.execute(
          "SELECT id, role, status FROM users WHERE id = ?",
          [userId],
        );
        const userRow = userResult.rows[0];
        if (userRow && String(userRow.status) === "active") {
          context.locals.user = {
            id: String(userRow.id),
            role: String(userRow.role),
          };
        }
      }
    } catch {
      // Invalid or expired token — locals.user stays undefined
    }
  }

  // --- Enforce auth on protected routes ---
  if (needsAuth && !context.locals.user) {
    const isApiRoute = pathname.startsWith("/api/");
    if (isApiRoute) return unauthorized("Missing or invalid session", pathname);
    return context.redirect("/admin", 302);
  }

  return addSecurityHeaders(await next(), pathname);
});

function addSecurityHeaders(response: Response, pathname: string): Response {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  // HSTS — force HTTPS for 2 years on this domain and all subdomains.
  // Do NOT add `; preload` until the domain is submitted to hstspreload.org.
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains",
  );

  // CSP Phase 1 — Report-Only (audit, no blocking).
  // Violations appear in browser DevTools → Console as "[Report Only] Refused to..."
  // Phase 2: compute sha256 hash of the anti-FOUC inline script in BlogLayout.astro
  // and switch to enforced Content-Security-Policy with per-pathname split.
  // Admin pages will keep 'unsafe-inline' due to define:vars in [slug].astro.
  const isAdmin = pathname.startsWith("/admin");
  // sha256 hash of the anti-FOUC is:inline script in BlogLayout.astro
  const fouc = "'sha256-HPPfxiskdCPpqDyDMT/Cc9sakRhGIC0x+o5OZyk+BdM='";
  // Shop pages (/shop/*) render Etsy product images and PayPal checkout forms.
  const isShop = pathname.startsWith("/shop");
  const imgSrc = `img-src 'self' data: blob: https://res.cloudinary.com https://*.etsystatic.com https://www.paypalobjects.com;`;
  const formAction =
    isAdmin || isShop
      ? `form-action 'self' https://www.paypal.com;`
      : `form-action 'self';`;
  const csp = isAdmin
    ? `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; ${imgSrc} font-src 'self' https://fonts.gstatic.com; connect-src 'self'; frame-src 'none'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; ${formAction}`
    : `default-src 'self'; script-src 'self' ${fouc}; style-src 'self' https://fonts.googleapis.com; ${imgSrc} font-src 'self' https://fonts.gstatic.com; connect-src 'self'; frame-src 'none'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; ${formAction}`;
  response.headers.set("Content-Security-Policy-Report-Only", csp);

  return response;
}

function unauthorized(message: string, pathname: string): Response {
  return addSecurityHeaders(
    new Response(JSON.stringify({ error: message }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    }),
    pathname,
  );
}
