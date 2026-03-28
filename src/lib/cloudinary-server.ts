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
