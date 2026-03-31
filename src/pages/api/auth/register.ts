import type { APIRoute } from "astro";
import bcrypt from "bcryptjs";
import { db } from "../../../lib/db";

// --- In-memory rate limiter: 5 registration attempts per IP per 60 minutes ---
const registerAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 60 * 1000;

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = registerAttempts.get(ip);
  if (!entry || now > entry.resetAt) return false;
  return entry.count >= MAX_ATTEMPTS;
}

function recordAttempt(ip: string): void {
  const now = Date.now();
  const entry = registerAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    registerAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

// --- Helpers ---

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Basic email format check — full validation happens server-side on login
function isValidEmail(value: string): boolean {
  return value.includes("@") && value.includes(".") && value.length >= 5;
}

// --- POST /api/auth/register — public self-registration for authors ---
// Role is ALWAYS hardcoded to 'author' — never accepted from request body.
// Status is set to 'pending' — admin must approve before the user can log in.

export const POST: APIRoute = async ({ request }) => {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return json(
      { error: "Too many registration attempts. Try again in 1 hour." },
      429,
    );
  }

  recordAttempt(ip);

  // --- Parse body ---
  let email: string;
  let password: string;

  try {
    const body = await request.json();
    email = (body.email ?? "").trim();
    password = body.password ?? "";
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  // --- Validate ---
  if (!email || !password) {
    return json({ error: "email and password are required" }, 400);
  }

  if (!isValidEmail(email)) {
    return json({ error: "Invalid email address" }, 400);
  }

  if (password.length < 8) {
    return json({ error: "Password must be at least 8 characters" }, 400);
  }

  // --- Check for duplicate email ---
  let existingCount: number;

  try {
    const result = await db.execute(
      "SELECT COUNT(*) AS cnt FROM users WHERE email = ?",
      [email],
    );
    existingCount = Number(result.rows[0]?.cnt ?? 0);
  } catch (err) {
    console.error("[register] duplicate-check query failed:", err);
    return json({ error: "Database error" }, 500);
  }

  if (existingCount > 0) {
    return json({ error: "An account with that email already exists" }, 409);
  }

  // --- Hash and insert ---
  // Role is hardcoded to 'author'; status is 'pending' until admin approves.
  try {
    const hash = await bcrypt.hash(password, 12);
    await db.execute(
      "INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, 'author', 'pending')",
      [email, hash],
    );
  } catch (err) {
    console.error("[register] INSERT failed:", err);
    return json({ error: "Database error" }, 500);
  }

  return json(
    {
      message:
        "Registration submitted. An admin will review your account before you can log in.",
    },
    201,
  );
};

// Only POST is handled on this route
export const GET: APIRoute = () => json({ error: "Method not allowed" }, 405);
