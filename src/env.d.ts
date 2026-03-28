/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly TURSO_DATABASE_URL: string;
  readonly TURSO_AUTH_TOKEN: string;
  readonly JWT_SECRET: string;
  readonly CLOUDINARY_CLOUD_NAME: string;
  readonly CLOUDINARY_API_KEY: string;
  readonly CLOUDINARY_API_SECRET: string;
  readonly RESEND_API_KEY: string;
  readonly CONTACT_TO_EMAIL: string;
  readonly CONTACT_FROM_EMAIL: string;
  // CDN — PUT-compatible storage (Bunny CDN, Cloudflare R2, etc.)
  readonly CDN_UPLOAD_URL: string; // e.g. https://storage.bunnycdn.com/my-zone
  readonly CDN_PUBLIC_URL: string; // e.g. https://my-zone.b-cdn.net
  readonly CDN_API_KEY: string; // storage API key / access key
  readonly SITE_URL: string; // public origin e.g. https://yourdomain.com
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    user?: {
      id: string;
      role: string;
    };
  }
}
