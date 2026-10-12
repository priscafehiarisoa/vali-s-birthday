// Usage: npm run db:push
// Copies contacts and guests from the local data/guests.db to Turso (TURSO_DATABASE_URL in .env).
// Rows already present in Turso (same name + phone / name + date) are skipped.
import fs from "node:fs";
import { LOCAL_DB, localClient, targetClient } from "./db.mjs";

if (!process.env.TURSO_DATABASE_URL) {
  console.error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env first.");
  process.exit(1);
}
if (!fs.existsSync(LOCAL_DB)) {
  console.error(`No local database at ${LOCAL_DB}, nothing to copy.`);
  process.exit(1);
}

const local = localClient();
const remote = await targetClient();

const contacts = (await local.execute("SELECT name, role, phone, whatsapp, position FROM contacts")).rows;
let added = 0;
for (const c of contacts) {
  const exists = await remote.execute({
    sql: "SELECT 1 FROM contacts WHERE name = ? AND phone = ?",
    args: [c.name, c.phone],
  });
  if (exists.rows.length) continue;
  await remote.execute({
    sql: "INSERT INTO contacts (name, role, phone, whatsapp, position) VALUES (?, ?, ?, ?, ?)",
    args: [c.name, c.role, c.phone, c.whatsapp, c.position],
  });
  added++;
}
console.log(`Contacts: ${added} copied, ${contacts.length - added} already there`);

const guests = (await local.execute("SELECT name, allergies, created_at FROM guests")).rows;
added = 0;
for (const g of guests) {
  const exists = await remote.execute({
    sql: "SELECT 1 FROM guests WHERE name = ? AND created_at = ?",
    args: [g.name, g.created_at],
  });
  if (exists.rows.length) continue;
  await remote.execute({
    sql: "INSERT INTO guests (name, allergies, created_at) VALUES (?, ?, ?)",
    args: [g.name, g.allergies, g.created_at],
  });
  added++;
}
console.log(`Guests: ${added} copied, ${guests.length - added} already there`);
