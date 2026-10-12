// Usage: npm run set-password -- <new-password>
// Updates Turso if TURSO_DATABASE_URL is set in .env, otherwise the local data/guests.db.
import crypto from "node:crypto";
import { targetClient } from "./db.mjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: npm run set-password -- <new-password>");
  process.exit(1);
}

const db = await targetClient();
const salt = crypto.randomBytes(16).toString("hex");
const hash = crypto.scryptSync(password, salt, 64).toString("hex");
await db.execute({
  sql: "INSERT INTO settings (key, value) VALUES ('guest_password', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  args: [`${salt}:${hash}`],
});
console.log("Password updated 🐱");
