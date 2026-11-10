import type { APIRoute } from "astro";
import { db } from "../../../../lib/db";
import { cloudinary, destroyCloudinaryAsset } from "../../../../lib/cloudinary-server";
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
      `SELECT id, image_url FROM advertisements WHERE id = ?`,
      [id],
    );
    if (existing.rows.length === 0) {
      return json({ error: "Ad not found" }, 404);
    }

    const previousImageUrl =
      typeof existing.rows[0].image_url === "string"
        ? existing.rows[0].image_url
        : "";

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

    // Destroy the replaced Cloudinary asset, if any. The database write is
    // committed; a cleanup failure returns 502 partial success so the row is
    // not lost and the old asset can be reconciled manually.
    const previousPublicId =
      imageUrl != null && imageUrl !== previousImageUrl
        ? parseAdImagePublicId(previousImageUrl)
        : null;
    if (previousPublicId) {
      try {
        await destroyCloudinaryAsset(previousPublicId, "image");
      } catch (err) {
        console.error("Failed to destroy replaced ad image:", err);
        return json(
          {
            updated: true,
            error: "Ad updated, but previous image cleanup failed on CDN",
          },
          502,
        );
      }
    }

    return json({ ok: true });
  } catch (err) {
    console.error("Failed to update ad:", err);
    return json({ error: "Internal Server Error" }, 500);
  }
};

/**
 * Extract a destroyable public_id from a Cloudinary delivery URL
 * (`.../{cloud}/image/upload/[v{version}/]blog/ads/{id}.{ext}`).
 * Returns null for non-Cloudinary or unparseable URLs so the caller can
 * skip the CDN destroy and still delete the row.
 */
function parseAdImagePublicId(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    if (url.hostname !== "res.cloudinary.com") return null;

    const segments = url.pathname.split("/").filter(Boolean);
    if (
      segments.length < 4 ||
      segments[1] !== "image" ||
      segments[2] !== "upload"
    ) {
      return null;
    }

    let rest = segments.slice(3);
    if (rest.length > 1 && /^v\d+$/i.test(rest[0])) {
      rest = rest.slice(1);
    }
    // Drop transformation components (they contain "," or "=");
    // raw upload URLs stored by this route have none.
    rest = rest.filter(
      (segment) => !segment.includes(",") && !segment.includes("="),
    );
    if (rest.length === 0) return null;

    const last = rest[rest.length - 1];
    const dot = last.lastIndexOf(".");
    if (dot > 0) {
      rest[rest.length - 1] = last.slice(0, dot);
    }

    const publicId = rest.join("/");
    return publicId || null;
  } catch {
    return null;
  }
}

export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!requireAdmin(locals)) {
    return json({ error: "Unauthorized" }, 403);
  }

  const id = Number(params.id);
  if (!id || Number.isNaN(id)) {
    return json({ error: "Invalid ID" }, 400);
  }

  try {
    // Fetch image_url first so the Cloudinary asset is destroyed together
    // with the row (advertisements stores no public_id — parse it from the
    // delivery URL per D4).
    const existing = await db.execute(
      `SELECT image_url FROM advertisements WHERE id = ?`,
      [id],
    );
    const row = existing.rows[0];
    if (!row) {
      return json({ error: "Ad not found" }, 404);
    }

    const imageUrl = typeof row.image_url === "string" ? row.image_url : "";
    const publicId = parseAdImagePublicId(imageUrl);
    if (publicId) {
      try {
        await destroyCloudinaryAsset(publicId, "image");
      } catch (err) {
        console.error("Failed to destroy ad image:", err);
        return json({ error: "Image delete failed on CDN" }, 502);
      }
    }

    await db.execute(`DELETE FROM advertisements WHERE id = ?`, [id]);
    return json({ ok: true });
  } catch (err) {
    console.error("Failed to delete ad:", err);
    return json({ error: "Internal Server Error" }, 500);
  }
};
