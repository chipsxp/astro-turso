import { connect } from "@tursodatabase/serverless";

/**
 * Creates the `password_resets` table in Turso.
 * Run with: node --env-file=.env scripts/create-password-resets-table.mjs
 */
async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error(
      "Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN environment variables.",
    );
    process.exit(1);
  }

  const db = connect({ url, authToken });

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("✓ Created password_resets table.");
  } catch (err) {
    console.error("✗ Failed to create password_resets table:", err.message);
  }
}

main();
