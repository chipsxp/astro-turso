import type { APIRoute } from "astro";
import { cloudinary } from "../../../../../lib/cloudinary-server";
import { db } from "../../../../../lib/db";

// --- Helper ---

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// --- DELETE /api/admin/panels/media/[id] ---
// 1. Fetches public_id from panel_media.
// 2. Destroys the asset from Cloudinary.
// 3. Deletes the panel_media row.
//    FK ON DELETE SET NULL on panel_assignments.media_id auto-clears any slot
//    that was pointing to this image.
// Auth: Bearer JWT required. Admin role required.

export const DELETE: APIRoute = async ({ params, locals }) => {
  const user = locals.user!;
  if (user.role !== "admin") {
    return json({ error: "Forbidden" }, 403);
  }

  const mediaId = Number(params.id);
  if (!Number.isInteger(mediaId) || mediaId < 1) {
    return json({ error: "Invalid id" }, 400);
  }

  try {
    // Fetch public_id before deleting so we can destroy in Cloudinary
    const fetch = await db.execute(
      "SELECT id, public_id FROM panel_media WHERE id = ?",
      [mediaId],
    );
    const row = fetch.rows[0];
    if (!row) {
      return json({ error: "Not found" }, 404);
    }

    const publicId = String(row.public_id);

    // Destroy from Cloudinary (non-fatal if it fails — still delete the DB row)
    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        invalidate: true,
      });
    } catch (cloudErr) {
      console.warn(
        "[panels/media/delete] Cloudinary destroy failed (continuing):",
        cloudErr,
      );
    }

    await db.execute("DELETE FROM panel_media WHERE id = ?", [mediaId]);

    return json({ ok: true }, 200);
  } catch (err) {
    console.error("[panels/media/delete] failed:", err);
    return json({ error: "Database error" }, 500);
  }
};

export const GET: APIRoute = () => json({ error: "Method not allowed" }, 405);
