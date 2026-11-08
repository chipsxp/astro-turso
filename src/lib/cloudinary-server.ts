import { v2 as cloudinaryV2 } from "cloudinary";

cloudinaryV2.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET,
});

/**
 * Pre-configured Cloudinary v2 SDK — server-only.
 * Import this in API routes instead of calling cloudinary.config() per-route.
 * Do NOT import this in client-side components or Astro <script> blocks.
 */
export const cloudinary = cloudinaryV2;

/**
 * Destroy one Cloudinary asset, treating an already-missing asset as success.
 * Any other unexpected result or API error is surfaced to the caller.
 */
export async function destroyCloudinaryAsset(
  publicId: string,
  resourceType: "image" | "video",
): Promise<void> {
  try {
    const destroyResult = await cloudinaryV2.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });

    const result = String(destroyResult?.result ?? "").toLowerCase();
    if (
      result &&
      result !== "ok" &&
      result !== "not found" &&
      result !== "not_found"
    ) {
      throw new Error(`Cloudinary delete returned: ${result}`);
    }
  } catch (err) {
    const message = (
      err instanceof Error ? err.message : String(err)
    ).toLowerCase();
    if (message.includes("not found")) return;
    throw err;
  }
}
