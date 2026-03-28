import node from "@astrojs/node";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: process.env.SITE_URL,
  output: "server",
  integrations: [react()],
  image: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  adapter: node({
    mode: "standalone",
  }),
  security: {
    // checkOrigin is disabled because both Railway (Fastly edge) and LiteSpeed
    // (Phusion Passenger) terminate TLS above Node.js. The Node.js process sees
    // all requests as http:// internally, so Astro's origin check false-positives
    // against the browser's https:// Origin header, returning 403 on DELETE/PUT/PATCH.
    // CSRF is already covered by SameSite=Strict on the JWT auth cookie (src/lib/auth.ts).
    checkOrigin: false,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
