/**
 * Diagnostic script: verify the sales_postings table exists and
 * that the LEFT JOIN query used by GET /api/admin/sales returns rows.
 *
 * Usage:
 *   node --env-file=.env scripts/diagnose-sales.mjs
 */

import { connect } from "@tursodatabase/serverless";

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN.");
  process.exit(1);
}

function getDb() {
  return connect({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

function mapRows(result) {
  if (!Array.isArray(result?.columns) || result.columns.length === 0)
    return result;
  return {
    ...result,
    rows: result.rows.map((row) =>
      Object.fromEntries(result.columns.map((col, i) => [col, row[i]])),
    ),
  };
}

// ── 1. Check table exists ─────────────────────────────────────────────────────
console.log("\n── 1. Checking sales_postings table ──");
try {
  const r = mapRows(
    await getDb().execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='sales_postings'",
      [],
    ),
  );
  if (r.rows.length === 0) {
    console.error("  ✗  Table sales_postings does NOT exist.");
    console.error(
      "     Run: node --env-file=.env scripts/create-sales-table.mjs",
    );
    process.exit(1);
  }
  console.log("  ✓  Table sales_postings exists.");
} catch (err) {
  console.error("  ✗  sqlite_master query failed:", err.message);
  process.exit(1);
}

// ── 2. Row count ──────────────────────────────────────────────────────────────
console.log("\n── 2. Row count ──");
try {
  const r = mapRows(
    await getDb().execute("SELECT COUNT(*) AS cnt FROM sales_postings", []),
  );
  console.log("  Rows in sales_postings:", r.rows[0]?.cnt ?? "(unknown)");
} catch (err) {
  console.error("  ✗  COUNT query failed:", err.message);
}

// ── 3. Exact query used by GET /api/admin/sales (admin path) ─────────────────
console.log("\n── 3. Admin listing query ──");
try {
  const r = mapRows(
    await getDb().execute(
      `SELECT sp.*, u.email AS author_email
       FROM sales_postings sp
       LEFT JOIN users u ON u.id = sp.author_id
       ORDER BY sp.created_at DESC`,
      [],
    ),
  );
  console.log("  columns:", r.columns);
  console.log("  rows returned:", r.rows.length);
  if (r.rows.length > 0) {
    console.log("  first row keys:", Object.keys(r.rows[0]));
    console.log("  first row slug:", r.rows[0].slug);
    console.log("  first row title:", r.rows[0].title);
  }
} catch (err) {
  console.error("  ✗  Admin listing query failed:", err.message);
  console.error("     This is the query that GET /api/admin/sales runs.");
}

// ── 4. JSON serialization test ────────────────────────────────────────────────
console.log("\n── 4. JSON serialization test ──");
try {
  const r = mapRows(
    await getDb().execute(
      `SELECT sp.*, u.email AS author_email
       FROM sales_postings sp
       LEFT JOIN users u ON u.id = sp.author_id
       ORDER BY sp.created_at DESC`,
      [],
    ),
  );
  const serialized = JSON.stringify({ postings: r.rows });
  console.log("  ✓  JSON.stringify succeeded, length:", serialized.length);
} catch (err) {
  console.error("  ✗  JSON.stringify failed:", err.message);
  console.error(
    "     This is why the API returns 500 — BigInt or circular ref.",
  );
}

console.log("\nDone.");
