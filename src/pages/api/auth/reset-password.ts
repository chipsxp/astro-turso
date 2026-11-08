import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import bcrypt from "bcryptjs";
import { json } from "../../../lib/api-response";
import { createRateLimiter, getClientIp } from "../../../lib/rate-limit";

const resetPasswordLimiter = createRateLimiter({
  limit: 5,
  windowMs: 60 * 60 * 1000,
});

export const POST: APIRoute = async ({ request }) => {
  const ip = getClientIp(request);

  if (resetPasswordLimiter.limited(ip)) {
    return json({ error: "Too many attempts. Try again in 1 hour." }, 429);
  }
  resetPasswordLimiter.record(ip);

  let token: string;
  let password: string;

  try {
    const body = await request.json();
    token = (body.token ?? "").trim();
    password = body.password ?? "";
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!token) {
    return json({ error: "Reset token is missing" }, 400);
  }

  if (password.length < 8) {
    return json({ error: "Password must be at least 8 characters" }, 400);
  }

  try {
    // Look up token
    const result = await db.execute(
      "SELECT user_id, expires_at FROM password_resets WHERE token = ?",
      [token],
    );

    const resetRecord = result.rows[0];

    if (!resetRecord) {
      return json({ error: "Invalid or expired reset token" }, 400);
    }

    const expiresAt = new Date(String(resetRecord.expires_at)).getTime();
    if (Date.now() > expiresAt) {
      await db.execute("DELETE FROM password_resets WHERE token = ?", [token]);
      return json({ error: "Reset token has expired" }, 400);
    }

    // Hash new password and update user
    const hash = await bcrypt.hash(password, 12);
    const userId = Number(resetRecord.user_id);

    await db.execute("UPDATE users SET password_hash = ? WHERE id = ?", [
      hash,
      userId,
    ]);

    // Delete the used token
    await db.execute("DELETE FROM password_resets WHERE token = ?", [token]);

    return json({ message: "Password has been successfully reset" }, 200);
  } catch (err) {
    console.error("[reset-password] Error:", err);
    return json({ error: "An internal error occurred" }, 500);
  }
};

export const GET: APIRoute = () => json({ error: "Method not allowed" }, 405);
