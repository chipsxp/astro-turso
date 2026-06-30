import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import crypto from "node:crypto";

const forgotPasswordAttempts = new Map<string, { count: number; resetAt: number }>();
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
  const entry = forgotPasswordAttempts.get(ip);
  if (!entry || now > entry.resetAt) return false;
  return entry.count >= MAX_ATTEMPTS;
}

function recordAttempt(ip: string): void {
  const now = Date.now();
  const entry = forgotPasswordAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    forgotPasswordAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function isValidEmail(value: string): boolean {
  return value.includes("@") && value.includes(".") && value.length >= 5;
}

export const POST: APIRoute = async ({ request }) => {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return json({ error: "Too many attempts. Try again in 1 hour." }, 429);
  }
  recordAttempt(ip);

  let email: string;
  try {
    const body = await request.json();
    email = (body.email ?? "").trim();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!email || !isValidEmail(email)) {
    return json({ error: "A valid email is required" }, 400);
  }

  try {
    const userResult = await db.execute(
      "SELECT id, email FROM users WHERE email = ?",
      [email]
    );
    const user = userResult.rows[0];

    if (!user) {
      // Don't leak whether the email exists or not
      return json({ message: "If that email exists, a reset link has been sent." }, 200);
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await db.execute(
      "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)",
      [Number(user.id), token, expiresAt]
    );

    const resendApiKey = import.meta.env.RESEND_API_KEY;
    const fromEmail = import.meta.env.CONTACT_FROM_EMAIL ?? "support@happyfeelingprints.com";
    const siteUrl = process.env.SITE_URL ?? new URL(request.url).origin;
    const resetLink = `${siteUrl}/reset-password?token=${token}`;

    if (resendApiKey) {
      const emailResp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject: "Password Reset Request",
          text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nIf you did not request this, please ignore this email. This link will expire in 1 hour.`,
        }),
      });

      if (!emailResp.ok) {
        console.error("[forgot-password] Failed to send email:", await emailResp.text());
        return json({ error: "Failed to send email" }, 500);
      }
    } else {
      console.warn("[forgot-password] RESEND_API_KEY not configured. Reset link:", resetLink);
    }

    return json({ message: "If that email exists, a reset link has been sent." }, 200);
  } catch (err) {
    console.error("[forgot-password] Error:", err);
    return json({ error: "An internal error occurred" }, 500);
  }
};

export const GET: APIRoute = () => json({ error: "Method not allowed" }, 405);
