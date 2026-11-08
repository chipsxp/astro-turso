import type { APIRoute } from "astro";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { setAuthCookie, type UserRecord } from "../../../lib/auth";
import { db } from "../../../lib/db";
import { json } from "../../../lib/api-response";
import { createRateLimiter, getClientIp } from "../../../lib/rate-limit";

// --- In-memory rate limiter: 10 failed attempts per IP per 15 minutes ---
const loginLimiter = createRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 });

export const POST: APIRoute = async ({ request }) => {
  const ip = getClientIp(request);

  if (loginLimiter.limited(ip)) {
    return json(
      { error: "Too many login attempts. Try again in 15 minutes." },
      429,
    );
  }

  // --- Parse body ---
  let email: string;
  let password: string;

  try {
    const body = await request.json();
    email = body.email?.trim();
    password = body.password;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!email || !password) {
    return json({ error: "email and password are required" }, 400);
  }

  // --- Look up user ---
  let user: UserRecord | undefined;

  try {
    const result = await db.execute<UserRecord>(
      "SELECT id, email, password_hash, role, status FROM users WHERE email = ?",
      [email],
    );
    user = result.rows[0];
  } catch {
    return json({ error: "Database error" }, 500);
  }

  // --- Verify password (constant-time; same 401 for unknown email or bad password) ---
  const validPassword =
    user != null &&
    (await bcrypt.compare(password, user.password_hash as string));

  if (!validPassword) {
    loginLimiter.record(ip);
    return json({ error: "Invalid credentials" }, 401);
  }

  // --- Status gate (block pending / suspended accounts) ---
  if (user.status === "pending") {
    return json({ error: "Your account is pending admin approval" }, 403);
  }
  if (user.status === "suspended") {
    return json({ error: "Your account has been suspended" }, 403);
  }

  // --- Sign JWT ---
  loginLimiter.clear(ip);
  const secret = new TextEncoder().encode(import.meta.env.JWT_SECRET);

  const token = await new SignJWT({
    sub: String(user.id),
    role: user.role as string,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": setAuthCookie(token),
    },
  });
};

// Only POST is handled on this route
export const GET: APIRoute = () => json({ error: "Method not allowed" }, 405);
