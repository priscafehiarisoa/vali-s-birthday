// Usage: npm run set-password -- <new-password>
import Database from "better-sqlite3";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const password = process.argv[2];
if (!password) {
  console.error("Usage: npm run set-password -- <new-password>");
  process.exit(1);
}

const dbPath = path.resolve(process.env.DATABASE_PATH ?? "data/guests.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.exec(fs.readFileSync(path.resolve("data/schema.sql"), "utf8"));

const salt = crypto.randomBytes(16).toString("hex");
const hash = crypto.scryptSync(password, salt, 64).toString("hex");
db.prepare(
  "INSERT INTO settings (key, value) VALUES ('guest_password', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
).run(`${salt}:${hash}`);
console.log("Password updated 🐱");
