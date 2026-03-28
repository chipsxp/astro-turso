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

  if (!needsAuth) {
    return addSecurityHeaders(await next());
  }

  // --- Extract token from HttpOnly cookie ---
  const cookieHeader = context.request.headers.get("Cookie") ?? "";
  const tokenMatch = cookieHeader.match(/(?:^|;\s*)auth_token=([^;]+)/);
  const token = tokenMatch?.[1] ?? null;

  const isApiRoute = pathname.startsWith("/api/");

  if (!token) {
    if (isApiRoute) return unauthorized("Missing or invalid session");
    return context.redirect("/admin", 302);
  }

  // --- Verify token signature / expiry ---
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY);

    const subject = String(payload.sub ?? "");
    const userId = Number(subject);
    if (!Number.isInteger(userId) || userId < 1) {
      if (isApiRoute) return unauthorized("Invalid session user");
      return context.redirect("/admin", 302);
    }

    const userResult = await db.execute(
      "SELECT id, role, status FROM users WHERE id = ?",
      [userId],
    );
    const userRow = userResult.rows[0];

    if (!userRow) {
      if (isApiRoute) return unauthorized("Session user not found");
      return context.redirect("/admin", 302);
    }

    if (String(userRow.status) !== "active") {
      if (isApiRoute) return unauthorized("Account is not active");
      return context.redirect("/admin", 302);
    }

    context.locals.user = {
      id: String(userRow.id),
      role: String(userRow.role),
    };
  } catch {
    if (isApiRoute) return unauthorized("Invalid or expired token");
    return context.redirect("/admin", 302);
  }

  return addSecurityHeaders(await next());
});

function addSecurityHeaders(response: Response): Response {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  return response;
}

function unauthorized(message: string): Response {
  return addSecurityHeaders(
    new Response(JSON.stringify({ error: message }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    }),
  );
}
