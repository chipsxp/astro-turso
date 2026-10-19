import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { ensureMediaTable, LEAKED_MEDIA_WHERE } from "../../../lib/media";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const MAX_IDS = 200;

export const DELETE: APIRoute = async ({ request, locals }) => {
  if (locals.user?.role !== "admin") {
    return json({ error: "Forbidden" }, 403);
  }

  try {
    const body = await request.json().catch(() => null);
    const raw: unknown = body?.ids;
    if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_IDS) {
      return json({ error: `Provide 1-${MAX_IDS} ids` }, 400);
    }
    const ids = [...new Set(raw.map(Number))];
    if (ids.some((n) => !Number.isInteger(n) || n <= 0)) {
      return json({ error: "Invalid ids" }, 400);
    }

    await ensureMediaTable();
    const placeholders = ids.map(() => "?").join(",");
    // Re-check the leak condition so a real Cloudinary row can never be removed.
    const result = await db.execute(
      `DELETE FROM media WHERE id IN (
         SELECT m.id FROM media m
         WHERE m.id IN (${placeholders}) AND ${LEAKED_MEDIA_WHERE}
       )`,
      ids,
    );

    return json({
      ok: true,
      deleted: Number(result.rowsAffected ?? 0),
      requested: ids.length,
    });
  } catch (err) {
    console.error("Failed to delete leaked media:", err);
    return json({ error: "Internal Server Error" }, 500);
  }
};
