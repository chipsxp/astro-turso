import type { APIRoute } from "astro";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { setAuthCookie } from "../../../lib/auth";
import { db } from "../../../lib/db";

// --- In-memory rate limiter: 10 failed attempts per IP per 15 minutes ---
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) return false;
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(ip: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function clearAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

export const POST: APIRoute = async ({ request }) => {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
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
  let user: Record<string, any>;

  try {
    const result = await db.execute(
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
    recordFailure(ip);
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
  clearAttempts(ip);
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

// --- Helper ---
function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
