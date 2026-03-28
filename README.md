# The Happy Feeling Scriptorium

Astro SSR blog and admin panel for publishing articles, managing media, and running a small author workflow on top of Turso and Cloudinary.

This repository is meant to be practical for developers who want to learn from it, run it locally, or adapt it for their own content site.

## What This Project Is For

- Public blog pages rendered with Astro
- Admin dashboard for authors and admins
- JWT cookie-based authentication
- Turso database storage for users, articles, tags, categories, media metadata, and share events
- Cloudinary-based image and video hosting
- Contact form email delivery
- Deployment to a LiteSpeed/LAMP-style shared hosting environment using Node.js and Passenger

## Who Composed The Code

Primary author: Jimmy Burns (pluckcode)  
Website: https://chipsxp.com

## Tech Stack

- Astro 5
- TypeScript
- React 19 for interactive admin components
- Tailwind CSS 4
- Turso (`@tursodatabase/serverless`)
- Cloudinary
- `jose` for JWT signing and verification
- `bcryptjs` for password hashing
- Node.js standalone server output via `@astrojs/node`

## Requirements

Before you start, make sure you have:

- Node.js 20 or newer
- npm
- A Turso database
- A Cloudinary account
- A Resend account if you want the contact form to work

## Installation

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Create your local environment file from the example:

```bash
cp .env.example .env
```

If you are on Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

4. Fill in the values in `.env`.
5. Start the development server:

```bash
npm run dev
```

## Useful Scripts

```bash
npm run dev
npm run build
npm run preview
node --env-file=.env scripts/create-admin.mjs <email> <password>
```

What these do:

- `npm run dev` starts the local Astro dev server
- `npm run build` creates the production build in `dist/`
- `npm run preview` runs the built app locally
- `create-admin.mjs` creates your first admin user in the database

## Environment Variables

Copy `.env.example` to `.env` and set the following values.

### Core App

`SITE_URL`  
Your full site URL, for example `https://yourdomain.com`

`JWT_SECRET`  
Used to sign login tokens. Generate a strong random value.

Example:

```bash
openssl rand -base64 32
```

### Turso Database

`TURSO_DATABASE_URL`  
Where to get it: Turso dashboard -> your database -> connection URL

`TURSO_AUTH_TOKEN`  
Where to get it: Turso dashboard -> your database -> auth tokens -> create token

### Cloudinary

`CLOUDINARY_CLOUD_NAME`  
Where to get it: Cloudinary dashboard -> settings -> account

`CLOUDINARY_API_KEY`  
Where to get it: Cloudinary dashboard -> settings -> API keys / access keys

`CLOUDINARY_API_SECRET`  
Where to get it: Cloudinary dashboard -> settings -> API keys / access keys

### Contact Form Email

`RESEND_API_KEY`  
Where to get it: Resend dashboard -> API Keys

`CONTACT_TO_EMAIL`  
The inbox that should receive contact form messages

`CONTACT_FROM_EMAIL`  
A sender address verified in Resend

### Optional

`PUBLIC_FB_APP_ID`  
Optional Facebook app ID for social share metadata. Get it from Meta for Developers if you need it.

`CDN_UPLOAD_URL`  
Optional advanced CDN upload endpoint

`CDN_PUBLIC_URL`  
Optional public CDN base URL

`CDN_API_KEY`  
Optional CDN API credential

## First-Time Setup

After you add your `.env` values, create an admin user:

```bash
node --env-file=.env scripts/create-admin.mjs you@example.com "YourStrongPasswordHere"
```

Then run the app and open:

- `/` for the public site
- `/admin` for the login page

## How The App Works

At a high level:

- Astro serves the public pages and API routes
- Admin pages use Astro plus React components where interactive UI is needed
- Authentication uses an `auth_token` cookie with `HttpOnly`, `Secure`, and `SameSite=Strict`
- Turso stores the application data
- Cloudinary stores uploaded media files
- Resend handles contact form delivery

## Security Notes For Developers

- Never commit `.env`
- Never place production secrets in markdown files, screenshots, or sample JSON
- Keep `.env.example` as placeholders only
- The repo is configured to ignore local env files and common secret file formats
- If a secret is ever exposed, rotate it immediately

## Build For Production

Create the production build with:

```bash
npm run build
```

This generates:

- `dist/client/` for static assets
- `dist/server/entry.mjs` for the Node.js server entrypoint

## LiteSpeed / LAMP Server Deployment

This project is designed to run on a shared-hosting style setup where:

- LiteSpeed or Apache serves the domain
- cPanel manages the app
- Node.js runs through Passenger / Setup Node.js App
- HTTPS is required because the auth cookie uses the `Secure` flag

### Deployment Summary

1. Build the app locally with `npm run build`
2. Upload these files to the server:

```text
dist/
package.json
package-lock.json
.nvmrc
```

3. In cPanel, create a Node.js app
4. Set the startup file to:

```text
dist/server/entry.mjs
```

5. Add your environment variables in cPanel
6. Run npm install on the server
7. Restart the Node.js app
8. Make sure SSL is active for the domain

### Important Deployment Note

Do not upload these to production:

- `.env`
- `src/`
- `node_modules/`
- local debug/build backup folders

For the full step-by-step server guide, see [docs/DEPLOY-CPANEL.md](c:/Users/manag/Github-repo/astro-turso/docs/DEPLOY-CPANEL.md).

## Project Structure

```text
src/
  components/     reusable UI
  layouts/        page layouts
  lib/            database, auth, media helpers
  pages/          Astro pages and API routes
scripts/          one-off setup and migration scripts
docs/             deployment and project notes
public/           static assets
```

## For Developers Exploring The Project

If you are new to Astro or full-stack content apps, start in this order:

1. Read `package.json` to see the scripts and dependencies
2. Read `src/pages/` to understand the routes
3. Read `src/pages/api/` to see the backend endpoints
4. Read `src/lib/db.ts` and `src/lib/auth.ts` for the main app plumbing
5. Read `docs/DEPLOY-CPANEL.md` when you are ready to deploy

## Notes

- This project uses Astro server output, not a static-only export
- The app expects real service credentials for Turso, Cloudinary, and Resend
- HTTPS is mandatory in production for login to work correctly
