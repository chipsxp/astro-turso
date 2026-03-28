# Social Share Plan — Blog Articles

**Author**: Jimmy Burns (pluckcode)
**Date**: 2026-03-18
**Project**: astro-turso blog (Astro SSR + Turso + Cloudinary)
**References**: https://ogp.me/ · https://developers.facebook.com/docs/sharing/webmasters#markup

---

## Current State

Two components already exist from Phase 10:
- `src/components/SEOMeta.astro` — OG meta tag output
- `src/components/SocialShare.astro` — shell share component (Phase 10 baseline)

Both need to be audited and significantly enhanced to support the full platform list and author-driven sharing UI.

---

## Strategy: Share Intent URLs (Free, No Backend Required)

The cheapest and most maintainable approach is **share intent URLs** — every major social platform provides a browser-navigable URL that pre-populates a share dialog with your content. No API keys, no OAuth apps, no monthly fees.

### Platform Coverage

| Platform  | Method              | Cost | API Key Required |
|-----------|---------------------|------|-----------------|
| Facebook  | Share intent URL    | Free | No (fb:app_id optional for Insights only) |
| X (Twitter) | Tweet intent URL  | Free | No |
| LinkedIn  | Share article URL   | Free | No |
| Reddit    | Submit URL          | Free | No |
| Pinterest | Pin create URL      | Free | No |
| WhatsApp  | wa.me share URL     | Free | No |
| Threads   | Intent compose URL  | Free | No |
| Bluesky   | Intent compose URL  | Free | No |
| Instagram | Clipboard + deep link | Free | No (full API requires Meta Business — complex) |
| Medium    | Clipboard copy      | Free | No (no public share intent URL) |

**Total cost: $0** for all 10 platforms using this approach.

### Share Intent URL Templates

```
Facebook:  https://www.facebook.com/sharer/sharer.php?u={encodedUrl}
X:         https://twitter.com/intent/tweet?text={encodedTitle}&url={encodedUrl}&hashtags={encodedTags}
LinkedIn:  https://www.linkedin.com/shareArticle?mini=true&url={encodedUrl}&title={encodedTitle}&summary={encodedDesc}
Reddit:    https://reddit.com/submit?url={encodedUrl}&title={encodedTitle}
Pinterest: https://pinterest.com/pin/create/button/?url={encodedUrl}&media={encodedImage}&description={encodedTitle}
WhatsApp:  https://wa.me/?text={encodedTitle}%20{encodedUrl}
Threads:   https://www.threads.net/intent/post?text={encodedTitle}%20{encodedUrl}
Bluesky:   https://bsky.app/intent/compose?text={encodedTitle}%20{encodedUrl}
Instagram: clipboard copy → opens https://www.instagram.com (no web intent exists)
Medium:    clipboard copy → opens https://medium.com/new-story (no public share URL exists)
```

---

## Open Graph Meta Requirements

Based on ogp.me and Facebook developer docs, each article page must emit these tags.

### Required Tags (all 4 must be present)

```html
<meta property="og:title"       content="{article.title}" />
<meta property="og:type"        content="article" />
<meta property="og:url"         content="https://chipsxp.com/blog/{slug}" />
<meta property="og:image"       content="{article.cover_image_url}" />
```

### Recommended Tags (strong impact on feed appearance)

```html
<meta property="og:image:width"   content="1200" />
<meta property="og:image:height"  content="630" />
<meta property="og:image:type"    content="image/jpeg" />
<meta property="og:image:alt"     content="{image.alt_text}" />
<meta property="og:description"   content="{article.description}" />
<meta property="og:site_name"     content="ChipsXP" />
<meta property="og:locale"        content="en_US" />
```

### Article Object Type Tags (og:type="article" unlocks these)

```html
<meta property="article:published_time" content="{article.created_at ISO8601}" />
<meta property="article:modified_time"  content="{article.updated_at ISO8601}" />
<meta property="article:author"         content="https://chipsxp.com" />
<meta property="article:section"        content="{category.name}" />
<meta property="article:tag"            content="{tag}" />  <!-- repeat per tag -->
```

### Twitter/X Card Tags (separate spec, same `<head>`)

```html
<meta name="twitter:card"        content="summary_large_image" />
<meta name="twitter:title"       content="{article.title}" />
<meta name="twitter:description" content="{article.description}" />
<meta name="twitter:image"       content="{article.cover_image_url}" />
```

### Optional Facebook Insights Tag

```html
<meta property="fb:app_id" content="{PUBLIC_FB_APP_ID}" />
```
Only needed if you want Facebook traffic analytics. Requires creating a free Facebook App at developers.facebook.com. Safe to skip initially.

---

## Architecture

### Data Flow

```
blog/[slug].astro
  └── BlogLayout.astro
        ├── SEOMeta.astro  ← emits all <meta> OG + Twitter tags in <head>
        └── SocialShare.astro  ← author-facing share button panel (below article)
              └── POST /api/share  ← optional: log share events to DB
```

### SocialShare Component Props

```ts
interface SocialShareProps {
  title: string;
  description: string;
  url: string;           // canonical full URL
  image: string;         // Cloudinary secure_url of cover image
  tags: string[];        // article tags → hashtags for X
  authorId: number;      // used to gate: only show to article author or admin
  currentUserId: number | null;
}
```

The component renders only when `currentUserId === authorId || currentUserId is admin`. Logged-out visitors never see the share panel.

---

## Task List

### Phase A — OG Meta Audit & Enhancement

**Goal**: Every `blog/[slug].astro` page emits a complete, valid OG tag set.

- [x] A1. Read `src/components/SEOMeta.astro` — audit current tag output
- [x] A2. Read `src/pages/blog/[slug].astro` — confirm what props are passed to SEOMeta
- [x] A3. Add missing required tags: `og:type="article"`, `og:image:width/height/type/alt`
- [x] A4. Add article object tags: `article:published_time`, `article:modified_time`, `article:section`, `article:tag` (one per tag, looped)
- [x] A5. Add Twitter Card tags: already existed — verified and kept; added `twitter:image:alt`
- [x] A6. Add optional `fb:app_id` tag gated on `PUBLIC_FB_APP_ID` env var (skip if not set)
- [ ] A7. Validate output using Facebook Sharing Debugger (https://developers.facebook.com/tools/debug/) on deployed URL

### Phase B — SocialShare Component Rebuild

**Goal**: Author sees a platform picker below their article; clicking opens the platform share dialog.

- [x] B1. Read current `src/components/SocialShare.astro`
- [x] B2. Define the 10-platform config array with: id, label, inline SVG, urlTemplate, method (`intent` | `clipboard`)
- [x] B3. Build the platform selection UI:
  - Grid of platform toggle buttons (`aria-pressed`) — author picks which to share to
  - "Share to selected (N)" action button + "Select all / Deselect all" secondary button
  - For `intent` platforms: `window.open(url, '_blank', 'width=600,height=500,noopener,noreferrer')`
  - For `clipboard` platforms (Instagram, Medium): copy text to clipboard, show status tip, open site in new tab
- [x] B4. Encode all URL parameters with `encodeURIComponent()` — all URLs built server-side in frontmatter
- [x] B5. Auth gate: panel hidden by default (`display:none`); client script decodes localStorage JWT, checks `sub === authorId || role === "admin"`, removes panel if not authorized; shows panel if authorized
- [x] B6. Styled with CSS custom properties matching project design system (var(--font-mono), var(--border), var(--surface), var(--text))
- [x] B7. Accessibility: `aria-pressed`, `aria-label`, `aria-live` for count + tip, `role="group"` on grid, AbortController for cleanup

### Phase C — Share Event API Route (Optional Analytics)

**Goal**: Server-side log of which platform and article was shared, for author dashboard stats.

- [x] C1. Migration script `scripts/create-shares-table.mjs` — creates `shares` table + 2 indexes; safe to re-run
  ```sql
  CREATE TABLE IF NOT EXISTS shares (
    id          INTEGER PRIMARY KEY,
    article_id  INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    user_id     INTEGER NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    platform    TEXT    NOT NULL,
    shared_at   INTEGER NOT NULL DEFAULT (unixepoch())
  );
  ```
- [x] C2. Created `src/pages/api/share.ts` — `POST /api/share`:
  - Middleware auto-protects all POST /api/* routes — Bearer JWT required
  - Body: `{ article_id, platform }` — both validated (integer check + VALID_PLATFORMS set)
  - FOREIGN KEY failure → 404 (article doesn't exist)
  - Returns `{ ok: true }` on 201
- [ ] C3. Add `GET /api/admin/shares` route for dashboard stats view (deferred — future phase)
- [x] C4. `SocialShare.astro` wired: `logShare(platform)` fires before each `window.open` / clipboard action; failures silently swallowed so share never blocks on analytics

> **Note**: Phase C is optional. The share buttons work without it. Add it only if analytics are wanted.

### Phase D — Environment Variables

- [x] D1. Added `PUBLIC_FB_APP_ID` block to `.env.example` with instructions for creating a free Facebook App
- [x] D2. `SITE_URL` already existed in `.env.example` as a server-side SSR var — no change needed; confirmed used correctly in `[slug].astro`
- [x] D3. Updated `docs/project_notes/key_facts.md`:
  - Added `shares` to DB tables list
  - Added `/api/share` to API routes list
  - Added social share system overview (OG meta, component, env vars, migration command)

### Phase E — Testing ✅ COMPLETE (2026-03-18)

- [x] E1. Use Playwright MCP to open a published article on local dev server
- [x] E2. `browser_snapshot` — verified all OG meta tags in `<head>` (required, recommended, article object, Twitter Card, all 3 article:tag elements)
- [x] E3. `browser_take_screenshot` — share panel UI confirmed; auth gate hides panel for logged-out visitors
- [x] E4. All 8 intent platform URLs verified correct (Facebook, X, LinkedIn, Reddit, Pinterest, WhatsApp, Threads, Bluesky)
- [x] E5. Clipboard path verified — Instagram copies `title url`, Medium copies `title\n\nurl`; tooltip fires correctly; `POST /api/share → 201` after fixing double-Bearer bug
- [ ] E6. Validate with Facebook Sharing Debugger after deploying to production URL
- [x] E7. Human sign-off — confirmed 2026-03-18

**Bug fixed during testing**: `SocialShare.astro` was sending `Authorization: Bearer Bearer eyJ…` (double prefix). Fixed line 345: changed `` `Bearer ${token}` `` → `token` to match all other admin pages.

---

## Cost Summary

| Item | Cost |
|------|------|
| Share intent URLs for Facebook, X, LinkedIn, Reddit, Pinterest, WhatsApp, Threads, Bluesky | **$0** |
| Instagram (clipboard + open site) | **$0** |
| Medium (clipboard + open site) | **$0** |
| Facebook fb:app_id for Insights | **$0** (free Facebook developer account) |
| Turso shares table | **$0** (within free tier row limits) |
| **Total** | **$0** |

Full posting capability for 10 platforms with zero recurring costs.

---

## What Requires Paid APIs (Not Used Here)

For reference, these are the paid/complex alternatives this plan intentionally avoids:

- **Meta Graph API** — required for auto-posting to Instagram Feed; needs Meta Business account, app review, and ongoing approval
- **Buffer / Hootsuite API** — third-party scheduling, $6–$18/month per user
- **Twitter/X API v2 write access** — $100/month Basic tier required for posting; free tier is read-only
- **LinkedIn Organization API** — for posting to company pages (not personal sharing)

All of these are bypassed by using share intent URLs, which delegate the actual posting action to the logged-in user's session on the target platform.

---

## Files to Create or Modify

| File | Action |
|------|--------|
| `src/components/SEOMeta.astro` | Modify — add missing OG + Twitter Card + article tags |
| `src/pages/blog/[slug].astro` | Modify — pass additional props (image, tags, category, authorId) to SEOMeta and SocialShare |
| `src/components/SocialShare.astro` | Rewrite — full 10-platform UI |
| `src/pages/api/share.ts` | Create — optional share event logging |
| `.env.example` | Modify — add PUBLIC_SITE_URL, PUBLIC_FB_APP_ID |
| `docs/project_notes/key_facts.md` | Modify — add new env vars |
| (optional) DB migration script | Create — `shares` table DDL |
