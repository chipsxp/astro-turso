import type { APIRoute } from "astro";
import { db } from "../../../../lib/db";

// --- Helpers ---

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

type Action = "approve" | "suspend" | "reinstate" | "promote";

// --- PATCH /api/admin/users/[id] — manage user status and role ---
//
// Actions:
//   approve   — pending  → active  (author stays author)
//   suspend   — active   → suspended
//   reinstate — suspended → active
//   promote   — active author → active admin
//
// Guards:
//   - Caller must have role=admin (JWT checked via middleware; role checked here)
//   - Caller cannot act on their own account (prevents self-lockout / self-promotion)

export const PATCH: APIRoute = async ({ params, locals, request }) => {
  const user = locals.user!;

  if (user.role !== "admin") {
    return json({ error: "Forbidden" }, 403);
  }

  const { id } = params;
  if (!id || isNaN(Number(id))) {
    return json({ error: "Invalid user id" }, 400);
  }

  const targetId = Number(id);

  // Prevent self-action
  if (targetId === Number(user.id)) {
    return json(
      { error: "You cannot modify your own account via this endpoint" },
      403,
    );
  }

  // --- Parse action ---
  let action: Action;
  try {
    const body = await request.json();
    action = body.action;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const validActions: Action[] = ["approve", "suspend", "reinstate", "promote"];
  if (!validActions.includes(action)) {
    return json(
      { error: `Invalid action. Must be one of: ${validActions.join(", ")}` },
      400,
    );
  }

  // --- Fetch target user ---
  let target: Record<string, unknown>;
  try {
    const result = await db.execute(
      "SELECT id, email, role, status FROM users WHERE id = ?",
      [targetId],
    );
    target = result.rows[0];
  } catch {
    return json({ error: "Database error" }, 500);
  }

  if (!target) {
    return json({ error: "User not found" }, 404);
  }

  // --- Apply action with state guards ---
  try {
    switch (action) {
      case "approve":
        if (target.status !== "pending") {
          return json({ error: "User is not in pending status" }, 409);
        }
        await db.execute("UPDATE users SET status = 'active' WHERE id = ?", [
          targetId,
        ]);
        break;

      case "suspend":
        if (target.status === "suspended") {
          return json({ error: "User is already suspended" }, 409);
        }
        if (target.role === "admin") {
          return json(
            { error: "Admin accounts cannot be suspended via this endpoint" },
            403,
          );
        }
        await db.execute("UPDATE users SET status = 'suspended' WHERE id = ?", [
          targetId,
        ]);
        break;

      case "reinstate":
        if (target.status !== "suspended") {
          return json({ error: "User is not suspended" }, 409);
        }
        await db.execute("UPDATE users SET status = 'active' WHERE id = ?", [
          targetId,
        ]);
        break;

      case "promote":
        if (target.role === "admin") {
          return json({ error: "User is already an admin" }, 409);
        }
        if (target.status !== "active") {
          return json({ error: "Only active users can be promoted" }, 409);
        }
        await db.execute(
          "UPDATE users SET role = 'admin', status = 'active' WHERE id = ?",
          [targetId],
        );
        break;
    }
  } catch {
    return json({ error: "Database error" }, 500);
  }

  return json({ success: true, action, userId: targetId }, 200);
};

export const GET: APIRoute = () => json({ error: "Method not allowed" }, 405);
