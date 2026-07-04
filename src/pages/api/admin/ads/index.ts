import type { APIRoute } from "astro";
import { db } from "../../../../lib/db";
import { cloudinary } from "../../../../lib/cloudinary-server";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  // Rely on middleware for auth check.
  // If we reach here, locals.user should be an admin (or we enforce it).
  if (locals.user?.role !== "admin") {
    return json({ error: "Unauthorized" }, 403);
  }

  try {
    const payload = await request.json();
    const {
      business_name,
      description,
      image_data,
      target_url,
      coupon_code,
      slot_type,
    } = payload;

    if (!business_name || !image_data || !target_url || !slot_type) {
      return json({ error: "Missing required fields" }, 400);
    }

    let image_url = "";
    try {
      const uploadResult = await cloudinary.uploader.upload(image_data, {
        folder: "blog/ads",
        resource_type: "image",
      });
      image_url = uploadResult.secure_url;
    } catch (err) {
      console.error("Cloudinary ad upload error:", err);
      return json({ error: "Image upload failed" }, 502);
    }

    await db.execute(
      `INSERT INTO advertisements 
            (business_name, description, image_url, target_url, coupon_code, slot_type, is_active)
            VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [
        business_name,
        description || null,
        image_url,
        target_url,
        coupon_code || null,
        slot_type,
      ],
    );

    return json({ ok: true }, 201);
  } catch (err: unknown) {
    console.error(
      "Ad creation failed:",
      err instanceof Error ? err.message : err,
    );
    return json({ error: "Internal Server Error" }, 500);
  }
};
