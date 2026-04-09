import type { APIRoute } from "astro";
import { db } from "../../../../lib/db";
import {
  EVENT_SELECT_FIELDS,
  ensureEventsSchema,
  mapEventRow,
} from "../../../../lib/events";

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  const slug = params.slug;

  if (!user) return json({ error: "Unauthorized" }, 401);
  if (!slug) return json({ error: "Missing slug" }, 400);

  try {
    await ensureEventsSchema();

    const isAdmin = user.role === "admin";
    const result = await db.execute(
      isAdmin
        ? `SELECT ${EVENT_SELECT_FIELDS}
           FROM events e
           LEFT JOIN users u ON u.id = e.owner_id
           LEFT JOIN media m ON m.id = e.featured_media_id
           WHERE e.slug = ?
           LIMIT 1`
        : `SELECT ${EVENT_SELECT_FIELDS}
           FROM events e
           LEFT JOIN users u ON u.id = e.owner_id
           LEFT JOIN media m ON m.id = e.featured_media_id
           WHERE e.slug = ? AND e.owner_id = ?
           LIMIT 1`,
      isAdmin ? [slug] : [slug, Number(user.id)],
    );

    const row = result.rows[0] as Record<string, unknown> | undefined;
    if (!row) return json({ error: "Event not found" }, 404);

    return json(mapEventRow(row), 200);
  } catch {
    return json({ error: "Database error" }, 500);
  }
};
