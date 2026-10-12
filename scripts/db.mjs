// Shared by the scripts: same database selection as lib/db.ts
import { createClient } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";

export const LOCAL_DB = path.resolve(process.env.DATABASE_PATH ?? "data/guests.db");

export function localClient() {
  return createClient({ url: `file:${LOCAL_DB}` });
}

/** Turso when TURSO_DATABASE_URL is set, otherwise the local file. Schema is applied. */
export async function targetClient() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) fs.mkdirSync(path.dirname(LOCAL_DB), { recursive: true });
  const db = createClient(url ? { url, authToken: process.env.TURSO_AUTH_TOKEN } : { url: `file:${LOCAL_DB}` });
  await db.executeMultiple(fs.readFileSync(path.resolve("data/schema.sql"), "utf8"));
  return db;
}
