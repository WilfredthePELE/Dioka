import { createClient } from "@supabase/supabase-js";
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const remote = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
let local: Promise<import("node:sqlite").DatabaseSync> | undefined;
async function database() {
  if (process.env.NODE_ENV === "production" && !process.env.DIOKA_DATA_DIR) throw new Error("Configure Supabase or a persistent DIOKA_DATA_DIR.");
  local ??= (async () => {
    const { DatabaseSync } = await import("node:sqlite");
    const { mkdir } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const directory = process.env.DIOKA_DATA_DIR || join(process.cwd(), "data");
    await mkdir(directory, { recursive: true });
    const db = new DatabaseSync(join(directory, "dioka.sqlite"));
    db.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS app_state (key TEXT PRIMARY KEY, value TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 0)");
    return db;
  })();
  return local;
}
export async function readState<T>(id: string, initial: T): Promise<T> {
  if (remote) {
    const { data, error } = await remote.from("dioka_app_state").select("value").eq("key", id).maybeSingle();
    if (error) throw new Error("Database unavailable. Check the production migration.");
    return data ? data.value as T : structuredClone(initial);
  }
  const row = (await database()).prepare("SELECT value FROM app_state WHERE key = ?").get(id) as { value: string } | undefined;
  return row ? JSON.parse(row.value) as T : structuredClone(initial);
}
/** Compare-and-swap retries protect writes across multiple server instances. */
export async function mutateState<T, R>(id: string, initial: T, change: (value: T) => R): Promise<R> {
  if (remote) {
    for (let attempt = 0; attempt < 12; attempt++) {
      const { data, error } = await remote.from("dioka_app_state").select("value,version").eq("key", id).maybeSingle();
      if (error) throw new Error("Database unavailable.");
      const value = data ? structuredClone(data.value) as T : structuredClone(initial);
      const result = change(value);
      if (!data) {
        const inserted = await remote.from("dioka_app_state").insert({ key: id, value, version: 1 });
        if (!inserted.error) return result;
        if (inserted.error.code !== "23505") throw new Error("Could not save changes.");
      } else {
        const updated = await remote.from("dioka_app_state").update({ value, version: data.version + 1 }).eq("key", id).eq("version", data.version).select("version");
        if (updated.error) throw new Error("Could not save changes.");
        if (updated.data?.length) return result;
      }
    }
    throw new Error("The record is busy. Please try again.");
  }
  const db = await database();
  db.exec("BEGIN IMMEDIATE");
  try {
    const row = db.prepare("SELECT value FROM app_state WHERE key = ?").get(id) as { value: string } | undefined;
    const value = row ? JSON.parse(row.value) as T : structuredClone(initial);
    const result = change(value);
    db.prepare("INSERT INTO app_state (key,value,version) VALUES (?,?,1) ON CONFLICT(key) DO UPDATE SET value=excluded.value, version=app_state.version+1").run(id, JSON.stringify(value));
    db.exec("COMMIT"); return result;
  } catch (error) { db.exec("ROLLBACK"); throw error; }
}
