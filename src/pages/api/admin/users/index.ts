import type { APIRoute } from "astro";
import { db } from "../../../../lib/db";

// --- Helpers ---

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// --- GET /api/admin/users — list users (all authenticated users) ---
// Admin: all users (pending sorted first) + status field.
// Author: own account only — no status field.

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user!;
  const isAdmin = user.role === "admin";

  try {
    const result = isAdmin
      ? await db.execute(
          `SELECT id, email, role, status, created_at
           FROM users
           ORDER BY
             CASE status WHEN 'pending' THEN 0 WHEN 'active' THEN 1 ELSE 2 END,
             created_at DESC`,
          [],
        )
      : await db.execute(
          `SELECT id, email, role, created_at
           FROM users
           WHERE id = ?`,
          [Number(user.id)],
        );

    console.log(
      `[users] GET isAdmin=${isAdmin} rows=${result.rows?.length ?? 0}`,
    );
    return json({ users: result.rows, isAdmin }, 200);
  } catch (err) {
    console.error("[users] query failed:", err);
    return json({ error: "Database error" }, 500);
  }
};

export const POST: APIRoute = () => json({ error: "Method not allowed" }, 405);
