# The Happy Feeling Scriptorium

![Version](https://img.shields.io/badge/version-1.1.0-gold) ![Astro](https://img.shields.io/badge/Astro-5-orange) ![Turso](https://img.shields.io/badge/Turso-serverless-teal) ![License](https://img.shields.io/badge/license-MIT-blue)

Astro SSR blog and admin panel for publishing articles, managing events, managing media, and running a small author workflow on top of Turso and Cloudinary.

This repository is meant to be practical for developers who want to learn from it, run it locally, or adapt it for their own content site.

## Branches

| Branch           | Version | Description                                   |
| ---------------- | ------- | --------------------------------------------- |
| `main`           | 1.0.0   | Base blog platform — no events module         |
| `feature/events` | 1.1.0   | Adds the Upcoming Events module (this branch) |

Clone the branch that matches what you need:

```bash
# Base platform only
git clone https://github.com/chipsxp/astro-turso.git

# With Upcoming Events module
git clone -b feature/events https://github.com/chipsxp/astro-turso.git
```

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

---

## Changelog

### [1.0.0] — 2026-04-06 — Base Platform Release

First stable release. Core blogging platform, admin workflow, and security baseline are complete.

**Core Platform**

- Astro 5 SSR with `@astrojs/node` standalone adapter
- Turso (libSQL serverless) database with named-column row normalization
- JWT authentication via HttpOnly `SameSite=Strict` cookie — no `localStorage` tokens
- Role-based access control: `admin` and `author` roles
- Quill 2 WYSIWYG editor with toolbar (bold/italic/underline, color, blockquote, code-block, h2/h3, lists, link/image), in-editor image resize via `quill-resize-module`

**Media Architecture**

- `images` table — inline editor images stored as base64 payloads, served via `/api/inline-images/{id}` with immutable caching. On article save, Quill base64 data URIs are auto-extracted and rewritten to stable URLs — authors see no change in the editor
- `media` table — Cloudinary-backed cloud uploads only (images + videos). These two storage systems are strictly separate
- Server-side article body guardrails: 1.75 MB body cap, max 4 inline images, 300 KB per inline image, 1.2 MB total inline image bytes per submission

**Security Hardening**

- HSTS (`max-age=63072000; includeSubDomains`) in middleware and `.htaccess`
- Content Security Policy (Report-Only Phase 1): strict hash-based CSP for public routes, `'unsafe-inline'` for admin routes
- In-memory rate limiting on login (10 fails/IP/15 min), register (5/IP/60 min), contact (5/IP/60 min)
- `security.checkOrigin: false` with `SameSite=Strict` CSRF coverage (required for TLS-terminating proxies on Railway and LiteSpeed)
- Middleware two-phase pattern: identity resolution on every route, enforcement only on protected routes

**Public Features**

- Blog listing and article pages with responsive Cloudinary image delivery
- Open Graph + Twitter Card meta (full `article:*` object tags, image dimensions, per-tag entries)
- 10-platform social share panel for authors (Facebook, X, Instagram, WhatsApp, Pinterest, Reddit, Threads, LinkedIn, Medium, Bluesky) with per-platform analytics
- Dark/light theme toggle with Golden Age Comics light palette; FOUC-free anti-flash script
- Contact form with Resend email delivery and honeypot protection
- Sitemap at `/sitemap.xml`

**Admin Dashboard**

- Article create / edit / publish / delete with Quill editor
- Media upload panel (Cloudinary) with upload session staging
- Panel gallery with slot assignment (hero, splash)
- User management (admin: promote, suspend; author: own account view)
- Share analytics per article

**Infrastructure**

- Railway deployment (primary) with Fastly CDN TLS termination
- cPanel / LiteSpeed LAMP deployment (secondary, documented in `docs/DEPLOY-CPANEL.md`)

---

### [1.1.0] — 2026-04-08 — Upcoming Events Module (`feature/events` branch)

Adds a full Upcoming Events system alongside the existing blog and admin workflow.

**Events Public Pages**

- `/events/[slug]` — individual event detail page with full Quill-rendered body, event metadata (date, location, admission), and Cloudinary media support
- Upcoming Events listing integrated with the public navigation

**Events Admin**

- `/admin/events` — event listing for admins and authors (admins see all; authors see their own)
- `/admin/events/new` — create event with Quill WYSIWYG editor, date/time picker, location, admission fields, and Cloudinary media panel
- `/admin/events/[slug]` — edit and publish existing events

**Events API**

- `GET /api/events` — public listing of published upcoming events
- `GET /api/events/[slug]` — public event detail
- `GET|POST /api/admin/events` — admin/author-scoped event management
- `GET|PUT|DELETE /api/admin/events/[slug]` — event CRUD (role-enforced)
- `POST /api/admin/events/media` — Cloudinary media upload for events

**Database**

- New `events` table: id, title, slug, body, description, author_id, status, event_date, location, admission, created_at, updated_at
- Run `node --env-file=.env scripts/create-events-table.mjs` to create the table before first use

**Setup Note for This Branch**

After `npm install` and filling in `.env`, run the events table migration:

```bash
node --env-file=.env scripts/create-events-table.mjs
```

Then create your admin user and start the server as usual.

---

### Planned Releases

| Version   | Feature               | Status   |
| --------- | --------------------- | -------- |
| **1.1.0** | Upcoming Events page  | Released |
| **1.2.0** | Art Sales / Shop page | Planned  |
| **1.3.0** | _(to be determined)_  | Planned  |
