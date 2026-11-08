import type { APIRoute } from "astro";
import bcrypt from "bcryptjs";
import { db } from "../../../lib/db";
import { json } from "../../../lib/api-response";
import { createRateLimiter, getClientIp } from "../../../lib/rate-limit";

// --- In-memory rate limiter: 5 registration attempts per IP per 60 minutes ---
const registerLimiter = createRateLimiter({
  limit: 5,
  windowMs: 60 * 60 * 1000,
});

// --- Helpers ---

// Basic email format check — full validation happens server-side on login
function isValidEmail(value: string): boolean {
  return value.includes("@") && value.includes(".") && value.length >= 5;
}

// --- POST /api/auth/register — public self-registration for authors ---
// Role is ALWAYS hardcoded to 'author' — never accepted from request body.
// Status is set to 'pending' — admin must approve before the user can log in.

export const POST: APIRoute = async ({ request }) => {
  const ip = getClientIp(request);

  if (registerLimiter.limited(ip)) {
    return json(
      { error: "Too many registration attempts. Try again in 1 hour." },
      429,
    );
  }

  registerLimiter.record(ip);

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

  // --- Send admin notification email ---
  const resendApiKey = import.meta.env.RESEND_API_KEY;
  const toEmail =
    import.meta.env.CONTACT_TO_EMAIL ?? "support@happyfeelingprints.com";
  const fromEmail =
    import.meta.env.CONTACT_FROM_EMAIL ?? "support@happyfeelingprints.com";

  if (resendApiKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail],
          subject: "New Author Registration Pending Approval",
          text: `A new user has registered and is pending approval.\n\nEmail: ${email}\n\nPlease log in to the admin dashboard to approve or decline this account.`,
        }),
      });
    } catch (err) {
      console.error("[register] Failed to send admin notification email:", err);
    }
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
