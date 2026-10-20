import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const remote = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => fetch(input, { ...init, signal: init?.signal || AbortSignal.timeout(15000) }) } }) : null;
export const identityKey = (kind: string, value: string) => kind + ":" + createHash("sha256").update(value).digest("hex");
let local: Promise<import("node:sqlite").DatabaseSync> | undefined;
export async function database() {
  if (process.env.DIOKA_SCALE_MODE === "true" && !remote) throw new Error("Scale mode requires Supabase; SQLite is a local preview backend.");
  if (process.env.NODE_ENV === "production" && !process.env.DIOKA_DATA_DIR) throw new Error("Configure Supabase or a persistent DIOKA_DATA_DIR.");
  local ??= (async () => {
    const { DatabaseSync } = await import("node:sqlite"), { mkdir } = await import("node:fs/promises"), { join } = await import("node:path");
    const directory = process.env.DIOKA_DATA_DIR || join(process.cwd(), "data"); await mkdir(directory, { recursive: true });
    const db = new DatabaseSync(join(directory, "dioka.sqlite"));
    db.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS app_state (key TEXT PRIMARY KEY, value TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT '')");
    if (!(db.prepare("PRAGMA table_info(app_state)").all() as {name:string}[]).some(c => c.name === "updated_at")) db.exec("ALTER TABLE app_state ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''");
    db.exec("CREATE INDEX IF NOT EXISTS app_state_updated ON app_state(updated_at DESC,key)");
    if (!db.prepare("SELECT 1 FROM app_state WHERE key='schema:partitioned'").get()) {
      db.exec("BEGIN IMMEDIATE");
      try {
        const get = (id:string) => { const row = db.prepare("SELECT value FROM app_state WHERE key=?").get(id) as {value:string}|undefined; return row ? JSON.parse(row.value) : null; };
        const put = (id:string,value:unknown) => db.prepare("INSERT OR IGNORE INTO app_state(key,value,version,updated_at) VALUES(?,?,1,?)").run(id,JSON.stringify(value),new Date().toISOString());
        const accounts = get("accounts");
        for (const user of Object.values(accounts?.users || {}) as {id:string;email:string;googleSubject?:string}[]) { put("user:"+user.id,user); put(identityKey("email",user.email.toLowerCase()),{id:user.id}); if(user.googleSubject)put(identityKey("google",user.googleSubject),{id:user.id}); }
        for (const [hash,session] of Object.entries(accounts?.sessions || {})) put("session:"+hash,session);
        for (const [id,done] of Object.entries(accounts?.processedPayments || {})) put("paidcart:"+id,{done});
        for (const [group,prefix] of [["orders","order:"],["inbox","thread:"]] as const) for (const [id,value] of Object.entries(get(group)||{})) put(prefix+id,value);
        for (const [email,date] of Object.entries(get("subscribers")||{})) put(identityKey("subscriber",email),{email,createdAt:date});
        const catalog=get("catalogue-v1"); for (const p of catalog?.products||[]) put("product:"+p.id,p);
        for (const [id,value] of Object.entries(catalog?.reservations||{})) put("reservation:"+id,value);
        put("schema:partitioned",{ready:true}); db.exec("COMMIT");
      } catch(error) { db.exec("ROLLBACK"); throw error; }
    }
    return db;
  })(); return local;
}
type Row = {key:string;value:unknown;version:number;updated_at?:string};
export async function readState<T>(id:string, initial:T):Promise<T> {
  if(remote){ const {data,error}=await remote.from("dioka_app_state").select("value").eq("key",id).maybeSingle(); if(error)throw new Error("Database unavailable. Check migrations and server credentials."); return data ? data.value as T : structuredClone(initial); }
  const row=(await database()).prepare("SELECT value FROM app_state WHERE key=?").get(id) as {value:string}|undefined; return row ? JSON.parse(row.value) as T : structuredClone(initial);
}
/** An atomic transaction over a bounded set of independent records. No process-local lock is used in cloud mode. */
export async function atomicStates<R>(initial:Record<string,unknown>, change:(rows:Record<string,any>)=>R):Promise<R> {
  const ids=Object.keys(initial).sort(); if(!ids.length||ids.length>50)throw new Error("Invalid transaction size.");
  if(remote){
    for(let attempt=0;attempt<16;attempt++){
      const {data,error}=await remote.from("dioka_app_state").select("key,value,version").in("key",ids); if(error)throw new Error("Database unavailable.");
      const found=new Map((data as Row[]).map(row=>[row.key,row]));
      const values:Record<string,any>={}; for(const id of ids)values[id]=structuredClone(found.has(id)?found.get(id)!.value:initial[id]);
      const result=change(values);
      const {data:committed,error:writeError}=await remote.rpc("dioka_compare_set",{p_changes:ids.map(id=>({key:id,value:values[id],expected:found.get(id)?.version ?? -1}))});
      if(writeError)throw new Error("Database transaction failed. Check the scalability migration."); if(committed)return result;
      await new Promise(resolve=>setTimeout(resolve,Math.min(250,5*2**attempt)+Math.random()*20));
    } throw new Error("The record is busy. Please retry shortly.");
  }
  const db=await database(); db.exec("BEGIN IMMEDIATE");
  try {
    const values:Record<string,any>={}; for(const id of ids){const row=db.prepare("SELECT value FROM app_state WHERE key=?").get(id) as {value:string}|undefined; values[id]=row?JSON.parse(row.value):structuredClone(initial[id]);}
    const result=change(values), now=new Date().toISOString();
    for(const id of ids)db.prepare("INSERT INTO app_state(key,value,version,updated_at) VALUES(?,?,1,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,version=app_state.version+1,updated_at=excluded.updated_at").run(id,JSON.stringify(values[id]),now);
    db.exec("COMMIT");return result;
  }catch(error){db.exec("ROLLBACK");throw error;}
}
export function mutateState<T,R>(id:string,initial:T,change:(value:T)=>R){return atomicStates({[id]:initial},rows=>change(rows[id]));}
export function setState<T>(id:string,value:T){return atomicStates({[id]:null},rows=>{rows[id]=value;return value;});}
export async function deleteState(id:string){if(remote){const {error}=await remote.from("dioka_app_state").delete().eq("key",id);if(error)throw new Error("Could not remove record.");}else(await database()).prepare("DELETE FROM app_state WHERE key=?").run(id);}
export async function listStates<T>(prefix:string,options:{limit?:number;userId?:string;before?:string}={}){
  const limit=Math.min(1000,Math.max(1,options.limit||100));
  if(remote){let query=remote.from("dioka_app_state").select("key,value,updated_at").like("key",prefix+"%").order("updated_at",{ascending:false}).order("key",{ascending:false}).limit(limit);if(options.userId)query=query.eq("value->>userId",options.userId);if(options.before)query=query.lt("updated_at",options.before);const {data,error}=await query;if(error)throw new Error("Could not load records.");return data.map(row=>({key:row.key,value:row.value as T,updatedAt:row.updated_at}));}
  let sql="SELECT key,value,updated_at FROM app_state WHERE key LIKE ?",args:(string|number)[]=[prefix+"%"];
  if(options.userId){sql+=" AND json_extract(value,'$.userId')=?";args.push(options.userId)}if(options.before){sql+=" AND updated_at<?";args.push(options.before)}sql+=" ORDER BY updated_at DESC,key DESC LIMIT ?";args.push(limit);
  return ((await database()).prepare(sql).all(...args) as {key:string;value:string;updated_at:string}[]).map(row=>({key:row.key,value:JSON.parse(row.value) as T,updatedAt:row.updated_at}));
}
export async function incrementLimit(id:string,maximum:number){
 if(remote){const {data,error}=await remote.rpc("dioka_take_limit",{p_key:id,p_maximum:maximum});if(error)throw new Error("Traffic control unavailable.");return data===true;}
 return mutateState(id,{count:0},value=>++value.count<=maximum);
}

export async function adminTotals(){
 if(remote){const {data,error}=await remote.rpc("dioka_admin_totals");if(error)throw new Error("Store totals unavailable.");return data as {orders:number;revenue:number;products:number;openConversations:number;subscribers:number};}
 const db=await database(),count=(prefix:string,extra="")=>Number((db.prepare("SELECT count(*) AS n FROM app_state WHERE key LIKE ? "+extra).get(prefix+"%") as {n:number}).n);
 return {orders:count("order:"),revenue:Number((db.prepare("SELECT coalesce(sum(json_extract(value,'$.total')),0) AS n FROM app_state WHERE key LIKE 'order:%'").get() as {n:number}).n),products:count("product:","AND coalesce(json_extract(value,'$.archived'),0)=0"),openConversations:count("thread:","AND json_extract(value,'$.status')='open'"),subscribers:count("subscriber:")};
}
