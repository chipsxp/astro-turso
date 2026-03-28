/**
 * Seed an admin user into the Turso database.
 *
 * Usage:
 *   node --env-file=.env scripts/create-admin.mjs <email> <password>
 *
 * Example:
 *   node --env-file=.env scripts/create-admin.mjs admin@example.com MyP@ssw0rd
 */

import { connect } from "@tursodatabase/serverless";
import bcrypt from "bcryptjs";

const email    = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: node --env-file=.env scripts/create-admin.mjs <email> <password>");
  process.exit(1);
}

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN — make sure .env is loaded.");
  process.exit(1);
}

const db = connect({
  url:       process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

try {
  const hash = await bcrypt.hash(password, 12);

  await db.execute(
    "INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'admin')",
    [email, hash]
  );

  console.log(`✓ Admin user created: ${email}`);
  console.log(`  Role: admin`);
  console.log(`  You can now log in at /admin`);
} catch (err) {
  if (err.message?.includes("UNIQUE constraint")) {
    console.error(`✗ A user with email "${email}" already exists.`);
  } else {
    console.error("✗ Error:", err.message);
  }
  process.exit(1);
} finally {
  db.close();
}
