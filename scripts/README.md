# Scripts

Classification of all scripts in this directory. Every `create-*` script is idempotent
and safe to re-run. Every `migrate-*` script is idempotent and uses duplicate-column
guards where applicable. `diagnose-sales.mjs` and `migrate-sales.sql` are one-off
diagnostic/migration files.

## Run order (fresh database)

1. `create-events-table.mjs` — `events` table + indexes (idempotent)
2. `create-media-tables.mjs` — `media`, `upload_sessions`, `upload_session_media` + indexes (idempotent)
3. `create-categories-table.mjs` — `categories`, `articles.category_id` ALTER + indexes + default seed (idempotent)
4. `create-sales-table.mjs` — `sales_postings`, `sales_images`, `sales_testimonials`, `sales_reviews` + indexes (idempotent)
5. `create-monetization-tables.mjs` — `advertisements`, `analytics_events` + indexes (idempotent)
6. `create-shares-table.mjs` — `shares` table (idempotent)
7. `create-site-settings-table.mjs` — `site_settings` table (idempotent)
8. `create-password-resets-table.mjs` — `password_resets` table (idempotent)
9. `create-panel-tables.mjs` — `panel_media`, `panel_assignments` + seed (idempotent)
10. `create-admin.mjs` — seed first admin user

## One-off / migration scripts (run once, then retire)

- `backfill-inline-images.mjs` — creates `images` table + backfills Quill inline images (one-off data migration)
- `migrate-add-indexes.mjs` — adds `idx_article_tags_tag_id`, `idx_articles_author_id` (idempotent migration; needs production go-ahead)
- `migrate-add-views.mjs` — adds view columns/tables (idempotent migration)
- `migrate-users-status.mjs` — adds user `status` column (idempotent migration)
- `migrate-users-shop-qr.mjs` — adds shop QR columns to `users` (idempotent migration)
- `migrate-sales-payment-links.mjs` — adds payment-link columns to `sales_postings` (idempotent migration)
- `migrate-sales-qr.mjs` — adds QR columns to `sales_postings` (idempotent migration)
- `migrate-sales-remove-etsy.mjs` — removes legacy Etsy columns (idempotent migration)
- `migrate-sales.sql` — raw SQL migration file (one-off)

## Diagnostic

- `diagnose-sales.mjs` — verifies `sales_postings` table and `GET /api/admin/sales` query (one-off diagnostic)

All scripts require `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` via `.env`.
Run with: `node --env-file=.env scripts/<name>.mjs`