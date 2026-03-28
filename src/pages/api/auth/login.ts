import type { APIRoute } from "astro";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { db } from "../../../lib/db";
import { setAuthCookie } from "../../../lib/auth";

export const POST: APIRoute = async ({ request }) => {
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
