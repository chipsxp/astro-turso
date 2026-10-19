/**
 * Add direct payment links to sales postings.
 *
 * Usage:
 *   node --env-file=.env scripts/migrate-sales-payment-links.mjs
 */

import { createClient as connect } from "@tursodatabase/serverless/compat";

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  process.exit(1);
}

function getDb() {
  return connect({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

for (const column of ["paypal_link", "venmo_link", "cashapp_link"]) {
  try {
    await getDb().execute(
      `ALTER TABLE sales_postings ADD COLUMN ${column} TEXT`,
    );
    console.log(`Added ${column} to sales_postings.`);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("duplicate column name")
    ) {
      console.log(`${column} already exists in sales_postings.`);
      continue;
    }
    console.error(`Failed to add ${column}:`, error);
    process.exit(1);
  }
}

console.log("Sales payment-link migration complete.");
