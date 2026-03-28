# Panel Gallery — Weekly Homepage Image Assignment

**Created:** 2026-03-19  
**Status:** Planning complete, ready to build  
**Author:** Jimmy Burns (pluckcode)

---

## Feature Summary

Four decorative comic panels on the homepage currently render as CSS color fills with halftone dot patterns (Kirby Krackle). This feature lets the admin upload images and assign one per panel slot. When an image is assigned, the dot-pattern CSS is removed entirely and the image fills the panel with `object-fit: cover` plus the `krackle-breathe` scale-pulse animation. When no image is assigned, panels look exactly as they do today.

The admin refreshes the panel images **weekly**. The gallery picker in the admin dashboard only shows images uploaded within the last 7 days.

---

## Panel Slot Map

| Slot key   | CSS target                             | Location         | Default background       |
| ---------- | -------------------------------------- | ---------------- | ------------------------ |
| `panel-01` | `.panel-deco__frame` (no modifier)     | Hero — top-left  | `var(--surface-2)` flat  |
| `panel-02` | `.panel-deco__frame--b`                | Hero — top-right | Kirby blue + dot pattern |
| `panel-03` | `.panel-deco__frame--c` (spans 2 cols) | Hero — bottom    | `var(--surface)` flat    |
| `panel-04` | `.splash-panel--kirby`                 | Splash screen    | Kirby blue + dot pattern |

The hero panel cluster is in `src/pages/index.astro` inside `.hero__right > .panel-deco`.  
The splash panel is in `src/components/SplashScreen.tsx` (React island, `client:only="react"`).

---

## File Inventory — New Files

```
scripts/
  create-panel-tables.mjs        # One-time DB migration
src/
  lib/
    panels.ts                    # DB helpers for panel schema + queries
  pages/api/admin/panels/
    index.ts                     # GET  /api/admin/panels
    upload.ts                    # POST /api/admin/panels/upload
    assign.ts                    # POST /api/admin/panels/assign
    media/
      [id].ts                    # DELETE /api/admin/panels/media/[id]
  components/admin/
    PanelGallery.tsx              # React island (client:load)
  styles/components/
    panel-gallery.css             # Admin gallery + slot board styles
```

## File Inventory — Modified Files

```
src/
  pages/
    index.astro                  # Fetch assignments, conditional image render
  components/
    SplashScreen.tsx             # Accept panelImageUrl prop, conditional render
  styles/
    pages/home.css               # Add --has-image modifier class
    splash.css                   # Add [data-has-image] suppressor
  pages/admin/
    dashboard.astro              # Mount PanelGallery island
```

---

## Project Conventions (critical for accuracy)

- **Database:** `db.execute(sql, args?)` from `src/lib/db.ts`. Returns `{ rows: NamedPropertyObject[] }`. Args are positional `?` parameters passed as an array. No ORM.
- **Auth:** All `/api/admin/` routes are automatically JWT-protected by the middleware at `src/middleware.ts`. The middleware validates `Authorization: Bearer <token>` and sets `context.locals.user = { id: string, role: string }`. No manual auth check needed in admin routes — middleware handles it.
- **Admin role check:** For operations that require `role === 'admin'` (vs author), check `locals.user!.role === 'admin'` inside the route handler.
- **Cloudinary config:** Already initialised globally in `src/pages/api/upload.ts` via `cloudinary.config(...)`. Each new API file must call `cloudinary.config(...)` independently — config is not shared across files.
- **Cloudinary env vars:** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (server only). Public-safe env var: `PUBLIC_CLOUDINARY_CLOUD_NAME` — already used by existing React islands.
- **JSON helper pattern:** Every API route file defines a local `function json(data: unknown, status: number): Response` helper. Do not import it — replicate it.
- **Script pattern:** Migration scripts use `node --env-file=.env scripts/xxx.mjs`. They import `connect` from `@tursodatabase/serverless` directly and call `getDb()` for each statement (new connection per execute — the correct pattern for the HTTP serverless driver).
- **React islands:** Use `client:load` for admin components (user is always authenticated there). Use `client:only="react"` for the splash screen (it already uses this).
- **CSS import in Astro pages:** `<style> @import "../styles/pages/home.css"; </style>` — styles are scoped to the page via Astro's style block.
- **`ensureXxxSchema()` pattern:** Each lib module exports an idempotent schema function that runs `CREATE TABLE IF NOT EXISTS` and seeds required rows. It uses a module-level boolean flag to skip on repeat calls.

---

## Phase 1 — Database Schema & Library

### Task 1.1 — Create `src/lib/panels.ts`

New file. Export the following:

**Types:**

```ts
export type PanelSlot = "panel-01" | "panel-02" | "panel-03" | "panel-04";

export interface PanelMedia {
  id: number;
  public_id: string;
  url: string;
  alt_text: string;
  width: number | null;
  height: number | null;
  format: string | null;
  created_at: string;
}

export interface PanelAssignment {
  slot: PanelSlot;
  label: string;
  media_id: number | null;
  url: string | null;
  alt_text: string | null;
  updated_at: string;
}
```

**Constants:**

```ts
export const VALID_SLOTS: PanelSlot[] = [
  "panel-01",
  "panel-02",
  "panel-03",
  "panel-04",
];

export const SLOT_META: Record<
  PanelSlot,
  { label: string; cssTarget: string; location: string }
> = {
  "panel-01": {
    label: "Panel 01",
    cssTarget: ".panel-deco__frame (default)",
    location: "Hero — top-left",
  },
  "panel-02": {
    label: "Panel 02",
    cssTarget: ".panel-deco__frame--b",
    location: "Hero — top-right",
  },
  "panel-03": {
    label: "Panel 03",
    cssTarget: ".panel-deco__frame--c",
    location: "Hero — bottom (wide)",
  },
  "panel-04": {
    label: "Panel 04",
    cssTarget: ".splash-panel--kirby",
    location: "Splash Screen",
  },
};
```

**DDL strings** (used by both `ensurePanelSchema` and the migration script):

```sql
-- panel_media
CREATE TABLE IF NOT EXISTS panel_media (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id  TEXT    NOT NULL,
  url        TEXT    NOT NULL,
  alt_text   TEXT    NOT NULL DEFAULT '',
  width      INTEGER,
  height     INTEGER,
  format     TEXT,
  created_at TEXT    DEFAULT CURRENT_TIMESTAMP
)

-- panel_assignments
CREATE TABLE IF NOT EXISTS panel_assignments (
  slot       TEXT    PRIMARY KEY,
  label      TEXT    NOT NULL,
  media_id   INTEGER REFERENCES panel_media(id) ON DELETE SET NULL,
  updated_at TEXT    DEFAULT CURRENT_TIMESTAMP
)

-- index
CREATE INDEX IF NOT EXISTS idx_panel_media_created_at ON panel_media(created_at)
```

**`ensurePanelSchema()`** — runs all three DDL statements, then seeds 4 rows:

```sql
INSERT OR IGNORE INTO panel_assignments (slot, label)
VALUES ('panel-01','Panel 01'),('panel-02','Panel 02'),
       ('panel-03','Panel 03'),('panel-04','Panel 04')
```

Use a module-level `let panelSchemaReady = false` flag to skip on repeat calls (same pattern as `ensureMediaTable` in `src/lib/media.ts`).

**`getCurrentPanelAssignments()`** — returns `PanelAssignment[]`:

```sql
SELECT pa.slot, pa.label, pa.media_id, pm.url, pm.alt_text, pa.updated_at
FROM panel_assignments pa
LEFT JOIN panel_media pm ON pm.id = pa.media_id
ORDER BY pa.slot ASC
```

Results keyed by slot for easy lookup in Astro frontmatter:

```ts
export async function getPanelImageMap(): Promise<
  Record<PanelSlot, string | null>
> {
  const rows = await getCurrentPanelAssignments();
  return Object.fromEntries(rows.map((r) => [r.slot, r.url])) as Record<
    PanelSlot,
    string | null
  >;
}
```

**`getRecentPanelMedia()`** — gallery query, last 7 days only:

```sql
SELECT id, public_id, url, alt_text, width, height, format, created_at
FROM panel_media
WHERE created_at >= datetime('now', '-7 days')
ORDER BY created_at DESC
```

---

### Task 1.2 — Migration script `scripts/create-panel-tables.mjs`

Follow the exact pattern of `scripts/create-shares-table.mjs`:

- Check `process.env.TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` at top; exit on missing
- One `getDb()` call per statement (new connection per execute)
- Log `✓` on success, `✗` + `process.exit(1)` on failure
- Run order: `panel_media` table → `panel_assignments` table → index → seed 4 rows

**Run command:**

```bash
node --env-file=.env scripts/create-panel-tables.mjs
```

> ⚠️ Run this script **before** deploying any of the other phases.

---

## Phase 2 — API Routes

All routes live under `src/pages/api/admin/panels/`. The middleware at `src/middleware.ts` already enforces JWT auth on all `/api/admin/` paths — no auth code needed inside the route handlers. Access `context.locals.user` for the current user.

### Task 2.1 — `GET /api/admin/panels` → `src/pages/api/admin/panels/index.ts`

Response shape:

```json
{
  "assignments": [
    {
      "slot": "panel-01",
      "label": "Panel 01",
      "media_id": 12,
      "url": "https://...",
      "alt_text": "",
      "updated_at": "2026-03-18T..."
    }
  ],
  "gallery": [
    {
      "id": 12,
      "public_id": "scriptorium/panels/abc",
      "url": "https://...",
      "alt_text": "",
      "width": 1280,
      "height": 720,
      "format": "jpg",
      "created_at": "2026-03-18T..."
    }
  ]
}
```

- Call `ensurePanelSchema()` then `getCurrentPanelAssignments()` and `getRecentPanelMedia()` in parallel (`Promise.all`).
- Return 200 with both arrays.

### Task 2.2 — `POST /api/admin/panels/upload` → `src/pages/api/admin/panels/upload.ts`

- Reads `multipart/form-data`, key `file`.
- Validates MIME type using `IMAGE_MIME_TYPES` from `src/lib/media.ts`. Images only — no videos.
- Enforces 10 MB limit (same as `upload.ts`).
- Uploads to Cloudinary folder `scriptorium/panels/` using the same `upload_stream` pattern from `src/pages/api/upload.ts`. Copy the `uploadToCloudinary` helper or import it if it becomes shared.
- Inserts into `panel_media`:
  ```sql
  INSERT INTO panel_media (public_id, url, alt_text, width, height, format)
  VALUES (?, ?, '', ?, ?, ?)
  ```
- Returns 201 with the new `PanelMedia` record.
- Must call `cloudinary.config(...)` at the top of the file with the three env vars.
- Requires `admin` role: check `locals.user!.role === 'admin'`, return 403 if not.

### Task 2.3 — `POST /api/admin/panels/assign` → `src/pages/api/admin/panels/assign.ts`

Request body:

```json
{ "slot": "panel-02", "media_id": 12 }
```

- Validate `slot` is one of `VALID_SLOTS` (import from `panels.ts`). Return 400 if invalid.
- Validate `media_id` is a positive integer. Return 400 if invalid.
- Verify the `media_id` exists in `panel_media`:
  ```sql
  SELECT id FROM panel_media WHERE id = ?
  ```
  Return 404 if not found.
- Update:
  ```sql
  UPDATE panel_assignments
  SET media_id = ?, updated_at = datetime('now')
  WHERE slot = ?
  ```
- Return 200 with `{ ok: true, slot, media_id }`.
- Requires `admin` role.

To **unassign** a slot, accept `media_id: null` in the body and run:

```sql
UPDATE panel_assignments SET media_id = NULL, updated_at = datetime('now') WHERE slot = ?
```

### Task 2.4 — `DELETE /api/admin/panels/media/[id]` → `src/pages/api/admin/panels/media/[id].ts`

- Read `[id]` from `context.params.id`, parse as integer.
- Fetch `public_id` from `panel_media` first (needed for Cloudinary destroy).
- Call `cloudinary.uploader.destroy(public_id, { resource_type: 'image' })`.
- Delete from `panel_media`:
  ```sql
  DELETE FROM panel_media WHERE id = ?
  ```
  The `ON DELETE SET NULL` FK on `panel_assignments.media_id` cleans up slot references automatically.
- Return 200 `{ ok: true }`.
- Requires `admin` role.

---

## Phase 3 — Admin Dashboard React Island

### Task 3.1 — `src/components/admin/PanelGallery.tsx`

**Props:**

```ts
interface Props {
  cloudName: string;
}
```

**State (all `useState`):**

```ts
const [assignments, setAssignments] = useState<PanelAssignment[]>([]);
const [gallery, setGallery] = useState<PanelMedia[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [uploading, setUploading] = useState(false);
const [optimisticAssignments, addOptimisticAssignment] = useOptimistic(
  assignments,
  (
    state,
    update: { slot: string; media_id: number | null; url: string | null },
  ) => state.map((a) => (a.slot === update.slot ? { ...a, ...update } : a)),
);
```

**Token helper** (same pattern used throughout the admin):

```ts
function getToken() {
  return localStorage.getItem("admin_token") ?? "";
}
```

**On mount:** `fetch('/api/admin/panels', { headers: { Authorization: getToken() } })` → populates both `assignments` and `gallery`. Redirect to `/admin` on 401.

**Layout — two sections:**

**Section A — Assignment Board**

- 2×2 CSS grid (`.panel-gallery__board`), one card per slot in slot-key order.
- Each card shows:
  - Slot label badge ("Panel 01"), location string ("Hero — top-left"), CSS target hint
  - If `url` is set: `<img>` thumbnail + "Unassign" button
  - If `url` is null: dashed placeholder, label "No image assigned"
- "Unassign" sends `POST /api/admin/panels/assign` with `{ slot, media_id: null }` and updates state.
- `useOptimistic` flips the card immediately before the POST resolves.

**Section B — Recent Gallery**

- Upload button at top (`<input type="file" accept="image/*">` hidden, label triggers it).
- On file select: POST to `/api/admin/panels/upload`, show uploading state, push new item to `gallery` on success.
- Grid of image cards (`.panel-gallery__grid`), each card shows:
  - Thumbnail (use `buildCloudinaryImageUrl` from `src/lib/cloudinary.ts` with preset `'thumb'` if `cloudName` + `public_id` available, otherwise use `url` directly)
  - Upload date formatted as "Mar 18"
  - "Assign to…" button — opens an inline slot picker (4 slot buttons)
  - "Delete" button — two-click confirm pattern (first click: arms; second click within a timeout: executes DELETE, removes from gallery, clears any assignment)
- Empty state: "No images uploaded this week."

**`useTransition` for assign flow:** Wrap the assign POST in `startTransition` to keep the UI responsive.

**Toast notifications:** Use `window.dispatchEvent(new CustomEvent('admin-media-toast', { detail: { galleryId: 'panels', type: 'success'|'error', message } }))` — this hooks into the existing toast system already wired into `AdminMediaGallery.tsx` and the dashboard.

### Task 3.2 — Mount in `src/pages/admin/dashboard.astro`

Add a new section after the existing article table panel:

```astro
---
// add to imports at top:
import PanelGallery from "../../components/admin/PanelGallery";
---

<!-- ─── Homepage Panels ─── -->
<section class="page-section">
  <div class="page-header">
    <div>
      <p class="page-header__eyebrow">Weekly Rotation</p>
      <h2 class="page-header__title">Homepage <em>Panels</em></h2>
    </div>
  </div>
  <PanelGallery
    client:load
    cloudName={import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME}
  />
</section>
```

> `PUBLIC_CLOUDINARY_CLOUD_NAME` is already in the environment — it is the public-safe version of the Cloudinary cloud name used by existing React islands.

---

## Phase 4 — Homepage Rendering

### Task 4.1 — Update `src/pages/index.astro` frontmatter

Add import and fetch:

```ts
import { ensurePanelSchema, getPanelImageMap } from "../lib/panels";

await ensurePanelSchema();
const panelImages = await getPanelImageMap();
// panelImages shape: { 'panel-01': string|null, 'panel-02': string|null, ... }
```

### Task 4.2 — Hero panel conditional rendering

For each `panel-deco__frame`, check the slot's image URL. When present:

- Drop the dot-pattern modifier class (`panel-deco__frame--b`, `panel-deco__frame--c`) — replace with `panel-deco__frame--has-image`.
- Render an `<img class="panel-deco__img">` inside `panel-deco__inner`, which sits `position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0`.
- Label spans stay at `z-index: 1` (rendered above the image).
- `panel-deco__inner` gets `position: relative` when image is present.
- `panel-deco__frame--has-image` gets `overflow: hidden` in CSS to clip the `krackle-breathe` scale overshoot.

When no image is assigned, frame renders exactly as today — no class change, no extra elements.

**Astro template pattern (Panel 02 example):**

```astro
{panelImages['panel-02']
  ? (
    <div class="panel-deco__frame panel-deco__frame--has-image">
      <div class="panel-deco__inner panel-deco__inner--b" style="position:relative">
        <img
          class="panel-deco__img"
          src={panelImages['panel-02']!}
          alt=""
          aria-hidden="true"
          loading="eager"
        />
        <span class="panel-deco__label" style="position:relative;z-index:1">Panel&nbsp;02</span>
      </div>
    </div>
  ) : (
    <div class="panel-deco__frame panel-deco__frame--b">
      <div class="panel-deco__inner panel-deco__inner--b">
        <span class="panel-deco__label">Panel&nbsp;02</span>
      </div>
    </div>
  )
}
```

Apply same conditional pattern for `panel-01`, `panel-03`.

> Panel 01 currently shows `panel-deco__impact` ("POW!") and Panel 03 shows `panel-deco__zap` ("ZAP!"). When an image is assigned to those slots, keep those spans but render them at `z-index: 1` over the image — they read as comic caption bursts against the art, which is on-brand.

### Task 4.3 — Update `src/components/SplashScreen.tsx`

Add prop:

```ts
export default function SplashScreen({ panelImageUrl }: { panelImageUrl?: string }) {
```

In the `.splash-panel--kirby` div, add `data-has-image` when URL is present and render the fill image:

```tsx
<div
  className="splash-panel splash-panel--kirby"
  {...(panelImageUrl ? { "data-has-image": "true" } : {})}
>
  {panelImageUrl && (
    <img
      className="splash-panel__img"
      src={panelImageUrl}
      alt=""
      aria-hidden="true"
    />
  )}
  <span className="kirby-badge">New Issue!</span>
</div>
```

The `<img>` is styled via `.splash-panel__img` (added in Task 6.2):
`position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0`.
The badge stays at `z-index: 2`.

Update the mount in `index.astro`:

```astro
<SplashScreen client:only="react" panelImageUrl={panelImages['panel-04'] ?? undefined} />
```

> `client:only="react"` — Astro will NOT server-render this component, but it **does** pass props to the client hydration. String props work correctly with `client:only`.

---

## Phase 5 — CSS

### Task 5.1 — `src/styles/pages/home.css` additions

Add at the end of the panel-deco section:

```css
/* ─── Has-image modifier — drops dot pattern, clips scale animation ─── */
.panel-deco__frame--has-image {
  background: var(--surface-2); /* flat fallback, no background-image */
  overflow: hidden; /* clip krackle-breathe scale overshoot */
  position: relative;
}

/* Image fill */
.panel-deco__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  animation: krackle-breathe 3.2s ease-in-out infinite;
  /* krackle-breathe is defined in splash.css — 
     copy the keyframe into home.css or move it to global.css */
}
```

> **Important:** `krackle-breathe` keyframe currently lives in `src/styles/splash.css`. Either duplicate it in `home.css` or move it to `src/styles/global.css` and remove from `splash.css`. Pick one — do not reference a keyframe defined in a different stylesheet.

### Task 5.2 — `src/styles/splash.css` additions

Add selector to suppress dots and animation when image is present:

```css
/* ─── Splash panel: image assigned — remove dot pattern and breathe animation ─── */
.splash-panel--kirby[data-has-image] {
  background-image: none;
  /* Override the chained animation-name so only panel-slam runs, not krackle-breathe */
  animation-name: panel-slam;
  animation-duration: 0.55s;
  animation-delay: 0.1s;
  animation-timing-function: cubic-bezier(0.34, 1.36, 0.64, 1);
  animation-fill-mode: forwards;
  animation-iteration-count: 1;
  overflow: hidden;
  position: relative;
}

/* Image fill inside splash panel */
.splash-panel__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  animation: krackle-breathe 3.2s ease-in-out infinite;
  animation-delay: 0.8s; /* match original breathe delay */
}

/* Badge above image */
.splash-panel--kirby[data-has-image] .kirby-badge {
  position: relative;
  z-index: 2;
}
```

### Task 5.3 — `src/styles/components/panel-gallery.css` (new file)

```css
/* ─── Panel Gallery — Admin Dashboard ─── */

/* Assignment board: 2×2 grid */
.panel-gallery__board {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
  background: var(--comic-black);
  border: 3px solid var(--comic-black);
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
  margin-bottom: 32px;
}

/* Individual slot card */
.panel-slot-card {
  background: var(--surface-2);
  padding: 0;
  position: relative;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-slot-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  z-index: 2;
  position: relative;
}

.panel-slot-card__label {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.panel-slot-card__location {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: var(--text-status);
  letter-spacing: 0.1em;
}

.panel-slot-card__thumb {
  flex: 1;
  position: relative;
  min-height: 120px;
  overflow: hidden;
}

.panel-slot-card__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.panel-slot-card__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--border);
  margin: 12px;
  color: var(--text-status);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.panel-slot-card__actions {
  padding: 8px 14px;
  display: flex;
  gap: 8px;
  background: var(--surface);
  border-top: 1px solid var(--border);
}

/* Gallery section */
.panel-gallery__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.panel-gallery__eyebrow {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.panel-gallery__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 3px;
  background: var(--comic-black);
  border: 3px solid var(--comic-black);
}

.panel-gallery__image-card {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--surface-2);
  cursor: pointer;
}

.panel-gallery__image-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: opacity 0.15s;
}

.panel-gallery__image-card:hover img {
  opacity: 0.6;
}

.panel-gallery__image-card-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.15s;
  padding: 8px;
}

.panel-gallery__image-card:hover .panel-gallery__image-card-overlay {
  opacity: 1;
}

.panel-gallery__date {
  position: absolute;
  bottom: 6px;
  left: 8px;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  color: var(--text-status);
  letter-spacing: 0.1em;
  pointer-events: none;
}

.panel-gallery__empty {
  grid-column: 1 / -1;
  padding: 40px;
  text-align: center;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  text-transform: uppercase;
}

/* Slot picker dropdown (inline, appears on "Assign to…" click) */
.slot-picker {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--surface);
  border: 2px solid var(--comic-black);
  padding: 8px;
  position: absolute;
  bottom: calc(100% + 4px);
  left: 0;
  z-index: 100;
  min-width: 140px;
  box-shadow: 3px 3px 0 var(--comic-black);
}

.slot-picker__btn {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 6px 10px;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
  transition: background 0.1s;
}

.slot-picker__btn:hover {
  background: var(--accent);
  color: var(--comic-black);
}
```

Import this in `dashboard.astro`:

```astro
<style is:global>
  @import "../../styles/components/panel-gallery.css";
</style>
```

---

## Phase 6 — Run Order & Build Checklist

Execute phases in this order to avoid dependency errors:

```
[ ] 1. Run: node --env-file=.env scripts/create-panel-tables.mjs
[ ] 2. Build src/lib/panels.ts
[ ] 3. Build API routes (tasks 2.1–2.4)
[ ] 4. Build PanelGallery.tsx (task 3.1)
[ ] 5. Add panel-gallery.css (task 5.3)
[ ] 6. Mount island in dashboard.astro (task 3.2)
[ ] 7. Update index.astro frontmatter (task 4.1)
[ ] 8. Update index.astro hero panel markup (task 4.2)
[ ] 9. Update SplashScreen.tsx (task 4.3)
[ ] 10. Add CSS to home.css (task 5.1) + decide keyframe location
[ ] 11. Add CSS to splash.css (task 5.2)
[ ] 12. Smoke test: assign image to panel-02 → verify hero renders image, dot pattern gone
[ ] 13. Smoke test: assign image to panel-04 → verify splash renders image, krackle gone
[ ] 14. Smoke test: unassign → verify panel reverts to dot pattern
[ ] 15. Smoke test: upload image → appears in gallery → gallery shows it → assign works
[ ] 16. Smoke test: delete image → gallery card removed → slot auto-cleared → homepage reverts
```

---

## Notes for the Implementing Agent

- **Do not modify `src/lib/media.ts` or `src/pages/api/upload.ts`** — panel uploads are a separate flow in new files.
- **`panel-deco__frame--c` spans 2 grid columns** (`grid-column: span 2`). When showing an image there, the `--has-image` modifier must not override `grid-column` — add it alongside `span 2` or keep the span on the `--c` class and only change the background property.
- **`krackle-breathe` keyframe resolution** — pick one location before writing Task 5.1. Recommended: move to `src/styles/global.css` since it will now be used in both `home.css` and `splash.css`.
- **`aria-hidden="true"` on the hero right panel** is already set in `index.astro` — all the panel images inside it are decorative. Keep `alt=""` and `aria-hidden="true"` on every `panel-deco__img`. The splash panel `<img>` is also decorative (`alt=""`).
- **7-day gallery filter is query-time only** — no scheduled cleanup job. Old records stay in the DB. Admin deletes them manually via the Delete button in the gallery.
- **Slot assignments never auto-expire** — if admin assigns Panel 01 in week 1 and doesn't touch it in week 2, Panel 01 still shows that image. The weekly rotation is the admin's responsibility.
- **`PUBLIC_CLOUDINARY_CLOUD_NAME`** — confirm this env var exists in `.env`. If only `CLOUDINARY_CLOUD_NAME` exists (no PUBLIC\_ prefix), add `PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name` to `.env` so the React island can access it at runtime.
