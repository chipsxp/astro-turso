import { connect } from "@tursodatabase/serverless";

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  process.exit(1);
}

const db = connect({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  try {
    await db.execute("ALTER TABLE sales_postings ADD COLUMN qr_code_url TEXT");
    console.log("Successfully added qr_code_url to sales_postings table.");
  } catch (error) {
    if (error.message && error.message.includes("duplicate column name")) {
      console.log("Column qr_code_url already exists in sales_postings.");
    } else {
      console.error("Migration failed:", error);
      process.exit(1);
    }
  }
}

main();
