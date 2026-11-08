import type { APIRoute } from "astro";
import { db } from "../../../../lib/db";
import { cloudinary } from "../../../../lib/cloudinary-server";
import { validateAdFields, validateAdImageData } from "../../../../lib/monetization";
import { json } from "../../../../lib/api-response";
import { requireAdmin } from "../../../../lib/auth";

export const PATCH: APIRoute = async ({ params, locals }) => {
  if (!requireAdmin(locals)) {
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

export const PUT: APIRoute = async ({ params, request, locals }) => {
  if (!requireAdmin(locals)) {
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

    const payload = {
      business_name,
      description,
      target_url,
      coupon_code,
      slot_type,
    };
    const fieldError = validateAdFields(payload);
    if (fieldError) return json({ error: fieldError.error }, fieldError.status);

    if (image_data) {
      const imageError = validateAdImageData(image_data);
      if (imageError) return json({ error: imageError.error }, imageError.status);
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
  if (!requireAdmin(locals)) {
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
