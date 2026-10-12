import Database from "better-sqlite3";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const DB_PATH = path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.DATABASE_PATH ?? "data/guests.db");
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
  var __guestsDb: Database.Database | undefined;
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

function init() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(fs.readFileSync(SCHEMA_PATH, "utf8"));

  const hasPassword = db.prepare("SELECT 1 FROM settings WHERE key = 'guest_password'").get();
  if (!hasPassword) {
    const initial = process.env.GUEST_PAGE_PASSWORD ?? "vali1234";
    db.prepare("INSERT INTO settings (key, value) VALUES ('guest_password', ?)").run(hashPassword(initial));
  }
  return db;
}

export function getDb() {
  globalThis.__guestsDb ??= init();
  return globalThis.__guestsDb;
}

export function addGuest(name: string, allergies: string | null) {
  return getDb().prepare("INSERT INTO guests (name, allergies) VALUES (?, ?)").run(name, allergies);
}

export function listGuests(): Guest[] {
  return getDb().prepare("SELECT * FROM guests ORDER BY created_at DESC, id DESC").all() as Guest[];
}

export function listContacts(): Contact[] {
  return getDb()
    .prepare("SELECT id, name, role, phone, whatsapp FROM contacts ORDER BY position, id")
    .all() as Contact[];
}

export function addContact(c: Omit<Contact, "id">) {
  const next = getDb().prepare("SELECT COALESCE(MAX(position), 0) + 1 AS p FROM contacts").get() as { p: number };
  return getDb()
    .prepare("INSERT INTO contacts (name, role, phone, whatsapp, position) VALUES (?, ?, ?, ?, ?)")
    .run(c.name, c.role, c.phone, c.whatsapp, next.p);
}

export function deleteContact(id: number) {
  return getDb().prepare("DELETE FROM contacts WHERE id = ?").run(id);
}

export function checkGuestPassword(password: string) {
  const row = getDb().prepare("SELECT value FROM settings WHERE key = 'guest_password'").get() as
    | { value: string }
    | undefined;
  return !!row && verifyHash(password, row.value);
}

// Session token derived from the stored hash: changing the password invalidates existing sessions.
export function sessionToken() {
  const row = getDb().prepare("SELECT value FROM settings WHERE key = 'guest_password'").get() as { value: string };
  const secret = process.env.SESSION_SECRET ?? "change-me";
  return crypto.createHmac("sha256", secret).update(row.value).digest("hex");
}
