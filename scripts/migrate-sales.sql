-- Sales Postings Module — Database Migration
-- Run: turso db shell <db-name> < scripts/migrate-sales.sql

-- Main sales posting record
CREATE TABLE IF NOT EXISTS sales_postings (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  slug                  TEXT NOT NULL UNIQUE,
  author_id             INTEGER NOT NULL REFERENCES users(id),
  title                 TEXT NOT NULL,
  body                  TEXT NOT NULL DEFAULT '',
  status                TEXT NOT NULL DEFAULT 'draft',  -- 'draft' | 'published'

  -- Etsy import cache (snapshot at import time — not live data)
  etsy_listing_id       TEXT,
  etsy_listing_url      TEXT,
  etsy_price_amount     INTEGER,        -- price in smallest currency unit (e.g. cents)
  etsy_price_divisor    INTEGER DEFAULT 100,
  etsy_price_currency   TEXT DEFAULT 'USD',
  etsy_quantity         INTEGER,        -- cached stock quantity
  tags                  TEXT DEFAULT '[]',  -- JSON array of tag strings

  -- Site-managed promotion (display only — buyer pays Etsy price at checkout)
  promo_label           TEXT,           -- e.g. "Spring Sale"
  promo_discount_pct    REAL,           -- 0.0–100.0
  promo_start           DATETIME,
  promo_end             DATETIME,

  -- PayPal legacy form HTML (stored raw, sanitized on render)
  paypal_button_html    TEXT,

  -- Link to a related blog article on this site
  linked_article_slug   TEXT,

  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Images associated with a sales posting (Etsy CDN + Cloudinary uploads)
CREATE TABLE IF NOT EXISTS sales_images (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  posting_id      INTEGER NOT NULL REFERENCES sales_postings(id) ON DELETE CASCADE,
  url             TEXT NOT NULL,
  alt_text        TEXT DEFAULT '',
  source          TEXT DEFAULT 'etsy',   -- 'etsy' | 'cloudinary' | 'cdn'
  sort_order      INTEGER DEFAULT 0,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Testimonials (author-curated customer quotes)
CREATE TABLE IF NOT EXISTS sales_testimonials (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  posting_id      INTEGER NOT NULL REFERENCES sales_postings(id) ON DELETE CASCADE,
  author_name     TEXT NOT NULL,
  quote           TEXT NOT NULL,
  rating          INTEGER CHECK(rating BETWEEN 1 AND 5),
  sort_order      INTEGER DEFAULT 0,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Reviews (structured entries with optional verified-buyer flag)
CREATE TABLE IF NOT EXISTS sales_reviews (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  posting_id      INTEGER NOT NULL REFERENCES sales_postings(id) ON DELETE CASCADE,
  reviewer_name   TEXT NOT NULL,
  review_text     TEXT NOT NULL,
  rating          INTEGER CHECK(rating BETWEEN 1 AND 5),
  is_verified     INTEGER DEFAULT 0,   -- 1 = verified Etsy buyer
  review_date     TEXT,
  sort_order      INTEGER DEFAULT 0,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);
