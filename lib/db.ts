import { createClient, type Client, type InArgs } from "@libsql/client";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/*
 * Production (Vercel): a hosted Turso database, set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN.
 * Local dev: falls back to the SQLite file data/guests.db (Vercel's disk is read-only, so this only works locally).
 */
const LOCAL_DB = path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.DATABASE_PATH ?? "data/guests.db");
const SCHEMA_PATH = path.resolve(/*turbopackIgnore: true*/ process.cwd(), "data/schema.sql");

export type Guest = {
  id: number;
  name: string;
  allergies: string | null;
  created_at: string;
};

export type Contact = {
  id: number;
  name: string;
  role: string | null;
  phone: string;
  whatsapp: string | null;
};

declare global {
  var __guestsDb: Promise<Client> | undefined;
}

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyHash(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

async function init() {
  let url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    fs.mkdirSync(path.dirname(LOCAL_DB), { recursive: true });
    url = `file:${LOCAL_DB}`;
  }
  const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  await db.executeMultiple(fs.readFileSync(SCHEMA_PATH, "utf8"));

  const hasPassword = await db.execute("SELECT 1 FROM settings WHERE key = 'guest_password'");
  if (hasPassword.rows.length === 0) {
    const initial = process.env.GUEST_PAGE_PASSWORD ?? "vali1234";
    await db.execute({
      sql: "INSERT INTO settings (key, value) VALUES ('guest_password', ?)",
      args: [hashPassword(initial)],
    });
  }
  return db;
}

export function getDb() {
  globalThis.__guestsDb ??= init().catch((err) => {
    globalThis.__guestsDb = undefined; // retry on next request
    throw err;
  });
  return globalThis.__guestsDb;
}

/** Runs a query and returns plain objects (libsql rows aren't JSON-friendly as is). */
async function all<T>(sql: string, args: InArgs = []): Promise<T[]> {
  const res = await (await getDb()).execute({ sql, args });
  return res.rows.map((row) => Object.fromEntries(res.columns.map((c) => [c, row[c]])) as T);
}

async function run(sql: string, args: InArgs = []) {
  await (await getDb()).execute({ sql, args });
}

export function addGuest(name: string, allergies: string | null) {
  return run("INSERT INTO guests (name, allergies) VALUES (?, ?)", [name, allergies]);
}

export function listGuests() {
  return all<Guest>("SELECT * FROM guests ORDER BY created_at DESC, id DESC");
}

export function deleteGuest(id: number) {
  return run("DELETE FROM guests WHERE id = ?", [id]);
}

export function listContacts() {
  return all<Contact>("SELECT id, name, role, phone, whatsapp FROM contacts ORDER BY position, id");
}

export function addContact(c: Omit<Contact, "id">) {
  return run(
    `INSERT INTO contacts (name, role, phone, whatsapp, position)
     VALUES (?, ?, ?, ?, (SELECT COALESCE(MAX(position), 0) + 1 FROM contacts))`,
    [c.name, c.role, c.phone, c.whatsapp],
  );
}

export function deleteContact(id: number) {
  return run("DELETE FROM contacts WHERE id = ?", [id]);
}

async function storedPasswordHash() {
  const [row] = await all<{ value: string }>("SELECT value FROM settings WHERE key = 'guest_password'");
  return row?.value;
}

export async function checkGuestPassword(password: string) {
  const stored = await storedPasswordHash();
  return !!stored && verifyHash(password, stored);
}

// Session token derived from the stored hash: changing the password invalidates existing sessions.
export async function sessionToken() {
  const secret = process.env.SESSION_SECRET ?? "change-me";
  return crypto
    .createHmac("sha256", secret)
    .update((await storedPasswordHash()) ?? "")
    .digest("hex");
}
