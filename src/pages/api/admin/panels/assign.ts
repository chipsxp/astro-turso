import type { APIRoute } from "astro";
import { db } from "../../../../lib/db";
import type { PanelSlot } from "../../../../lib/panels";
import { ensurePanelSchema, VALID_SLOTS } from "../../../../lib/panels";

// --- Helper ---

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// --- POST /api/admin/panels/assign ---
// Assigns or unassigns a panel_media image to a slot.
//
// Body: { slot: string, media_id: number | null }
//   - media_id: null  → unassigns the slot (sets media_id = NULL)
//   - media_id: <int> → assigns that panel_media row to the slot
//
// Auth: Bearer JWT required. Admin role required.

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user!;
  if (user.role !== "admin") {
    return json({ error: "Forbidden" }, 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Expected JSON body" }, 400);
  }

  const { slot, media_id } = body as { slot: unknown; media_id: unknown };

  // Validate slot
  if (typeof slot !== "string" || !VALID_SLOTS.includes(slot as PanelSlot)) {
    return json(
      { error: `slot must be one of: ${VALID_SLOTS.join(", ")}` },
      400,
    );
  }

  // Validate media_id: must be a positive integer OR null to unassign
  if (media_id !== null && media_id !== undefined) {
    const id = Number(media_id);
    if (!Number.isInteger(id) || id < 1) {
      return json(
        { error: "media_id must be a positive integer or null" },
        400,
      );
    }
  }

  try {
    await ensurePanelSchema();

    // Unassign path
    if (media_id === null || media_id === undefined) {
      await db.execute(
        `UPDATE panel_assignments
         SET media_id = NULL, updated_at = datetime('now')
         WHERE slot = ?`,
        [slot],
      );
      return json({ ok: true, slot, media_id: null }, 200);
    }

    // Assign path — verify the media row exists
    const mediaCheck = await db.execute(
      "SELECT id FROM panel_media WHERE id = ?",
      [Number(media_id)],
    );
    if (!mediaCheck.rows[0]) {
      return json({ error: "panel_media record not found" }, 404);
    }

    await db.execute(
      `UPDATE panel_assignments
       SET media_id = ?, updated_at = datetime('now')
       WHERE slot = ?`,
      [Number(media_id), slot],
    );

    return json({ ok: true, slot, media_id: Number(media_id) }, 200);
  } catch (err) {
    console.error("[panels/assign] failed:", err);
    return json({ error: "Database error" }, 500);
  }
};

export const GET: APIRoute = () => json({ error: "Method not allowed" }, 405);
