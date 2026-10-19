import type { APIRoute } from "astro";
import { db } from "../../../../lib/db";
import { cloudinary } from "../../../../lib/cloudinary-server";

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
      [id],
    );

    return json({ ok: true });
  } catch (err) {
    console.error("Failed to toggle ad status:", err);
    return json({ error: "Internal Server Error" }, 500);
  }
};

const SLOT_TYPES = new Set([
  "dashboard_sidebar",
  "article_index_top",
  "shop_index_top",
  "footer",
  "homepage_grid",
  "event_index_top",
  "hidden",
]);

export const PUT: APIRoute = async ({ params, request, locals }) => {
  if (locals.user?.role !== "admin") {
    return json({ error: "Unauthorized" }, 403);
  }

  const id = Number(params.id);
  if (!id || Number.isNaN(id)) {
    return json({ error: "Invalid ID" }, 400);
  }

  try {
    const {
      business_name,
      description,
      image_data,
      target_url,
      coupon_code,
      slot_type,
    } = await request.json();

    if (!business_name || !target_url || !slot_type) {
      return json({ error: "Missing required fields" }, 400);
    }
    if (!SLOT_TYPES.has(slot_type)) {
      return json({ error: "Invalid slot type" }, 400);
    }

    const existing = await db.execute(
      `SELECT id FROM advertisements WHERE id = ?`,
      [id],
    );
    if (existing.rows.length === 0) {
      return json({ error: "Ad not found" }, 404);
    }

    // Only replace the image when a new one was provided
    let imageUrl: string | null = null;
    if (image_data) {
      try {
        const uploadResult = await cloudinary.uploader.upload(image_data, {
          folder: "blog/ads",
          resource_type: "image",
        });
        imageUrl = uploadResult.secure_url;
      } catch (err) {
        console.error("Cloudinary ad upload error:", err);
        return json({ error: "Image upload failed" }, 502);
      }
    }

    await db.execute(
      `UPDATE advertisements
         SET business_name = ?, description = ?, target_url = ?, coupon_code = ?,
             slot_type = ?, image_url = COALESCE(?, image_url)
       WHERE id = ?`,
      [
        business_name,
        description || null,
        target_url,
        coupon_code || null,
        slot_type,
        imageUrl,
        id,
      ],
    );

    return json({ ok: true });
  } catch (err) {
    console.error("Failed to update ad:", err);
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
