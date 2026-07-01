import type { APIRoute } from "astro";
import { db } from "../../../../lib/db";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const PATCH: APIRoute = async ({ params, locals }) => {
  if (locals.user?.role !== "admin") {
    return json({ error: "Unauthorized" }, 403);
  }

  const id = Number(params.id);
  if (!id || Number.isNaN(id)) {
    return json({ error: "Invalid ID" }, 400);
  }

  try {
    // Toggle the is_active status
    await db.execute(
      `UPDATE advertisements SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?`,
      [id]
    );

    return json({ ok: true });
  } catch (err) {
    console.error("Failed to toggle ad status:", err);
    return json({ error: "Internal Server Error" }, 500);
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  if (locals.user?.role !== "admin") {
    return json({ error: "Unauthorized" }, 403);
  }

  const id = Number(params.id);
  if (!id || Number.isNaN(id)) {
    return json({ error: "Invalid ID" }, 400);
  }

  try {
    await db.execute(`DELETE FROM advertisements WHERE id = ?`, [id]);
    return json({ ok: true });
  } catch (err) {
    console.error("Failed to delete ad:", err);
    return json({ error: "Internal Server Error" }, 500);
  }
};
