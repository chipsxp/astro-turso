import { connect } from "@tursodatabase/serverless";

const db = connect({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
  console.log("Starting migration: Add views column to articles table...");
  try {
    const res = await db.execute(`
      ALTER TABLE articles ADD COLUMN views INTEGER DEFAULT 0;
    `);
    console.log("Migration successful:", res);
  } catch (error) {
    if (error.message && error.message.includes("duplicate column name")) {
      console.log("Column 'views' already exists. Skipping.");
    } else {
      console.error("Migration failed:", error);
      process.exit(1);
    }
  }
}

run();
