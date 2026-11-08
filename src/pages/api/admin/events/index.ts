import type { APIRoute } from "astro";
import { db } from "../../../../lib/db";
import {
  EVENT_SELECT_FIELDS,
  ensureEventsSchema,
  mapEventRow,
} from "../../../../lib/events";
import { json } from "../../../../lib/api-response";
import { requireUser } from "../../../../lib/auth";

export const GET: APIRoute = async ({ locals }) => {
  const user = requireUser(locals);
  if (!user) return json({ error: "Unauthorized" }, 401);

  try {
    await ensureEventsSchema();

    const isAdmin = user.role === "admin";
    const result = await db.execute(
      isAdmin
        ? `SELECT ${EVENT_SELECT_FIELDS}
           FROM events e
           LEFT JOIN users u ON u.id = e.owner_id
           LEFT JOIN media m ON m.id = e.featured_media_id
           ORDER BY date(e.start_date) DESC, e.created_at DESC`
        : `SELECT ${EVENT_SELECT_FIELDS}
           FROM events e
           LEFT JOIN users u ON u.id = e.owner_id
           LEFT JOIN media m ON m.id = e.featured_media_id
           WHERE e.owner_id = ?
           ORDER BY date(e.start_date) DESC, e.created_at DESC`,
      isAdmin ? [] : [Number(user.id)],
    );

    const events = result.rows.map((row: Record<string, unknown>) =>
      mapEventRow(row),
    );

    return json({ events }, 200);
  } catch {
    return json({ error: "Database error" }, 500);
  }
};
