import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
if(!process.env.DIOKA_PGLITE_PACKAGE)throw new Error('Set DIOKA_PGLITE_PACKAGE to an installed PGlite index.js for isolated PostgreSQL migration checks.');
const {PGlite}=await import(pathToFileURL(process.env.DIOKA_PGLITE_PACKAGE).href);
const db=new PGlite();
try{
await db.exec('create role anon; create role authenticated; create role service_role bypassrls; create schema storage; create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);');
const core=await readFile('supabase/production.sql','utf8'), media=await readFile('supabase/migrations/20261020084445_dioka_media_storage.sql','utf8');
await db.exec(core);await db.exec(media);await db.exec(core);await db.exec(media);
const seed=await readFile("supabase/seed.sql","utf8");await db.exec(seed);await db.exec(seed);
const initial=(await db.query("select value from public.dioka_app_state where key=$1",["catalogue-v1"])).rows[0].value;assert.equal(initial.products.length,12);assert.ok(initial.products.every(p=>p.stockQuantity===0&&p.inStock===false));
assert.equal((await db.query("select count(*)::int as total from public.dioka_app_state")).rows[0].total,6);
const buckets=(await db.query('select id,public,file_size_limit from storage.buckets order by id')).rows;assert.equal(buckets.length,2);assert.equal(buckets.find(b=>b.id==='dioka-products').public,true);assert.equal(buckets.find(b=>b.id==='dioka-private').public,false);
for(const role of ['anon','authenticated'])for(const table of ['dioka_app_state','dioka_media'])assert.equal((await db.query("select has_table_privilege($1,$2,'select') as allowed",[role,'public.'+table])).rows[0].allowed,false);
assert.equal((await db.query("select has_table_privilege('service_role','public.dioka_media','insert') as allowed")).rows[0].allowed,true);
const rls=(await db.query("select relname,relrowsecurity from pg_class where relname in ('dioka_app_state','dioka_media')")).rows;assert.ok(rls.every(r=>r.relrowsecurity));
await mkdir('test-results',{recursive:true});await writeFile('test-results/migrations.json',JSON.stringify({passed:true,engine:'PGlite PostgreSQL with isolated Supabase storage schema fixture',buckets,checked:'Idempotency, row security, denied browser roles, allowed service role',liveSupabase:false},null,2));console.log('PASS database: migrations run twice, public/private bucket configuration, row security and server-only permissions');
}finally{await db.close()}
