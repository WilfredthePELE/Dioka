import {DatabaseSync} from 'node:sqlite';
import {createClient} from '@supabase/supabase-js';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const args=process.argv.slice(2);const location=args.find(a=>!a.startsWith('--'));
if(!location)throw new Error('Usage: node scripts/import-local-to-supabase.mjs PATH_TO_SQLITE [--apply]');
const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key)throw new Error('Configure server-only Supabase credentials privately in the environment.');
const db=new DatabaseSync(resolve(location),{readOnly:true});
const rows=db.prepare('select key,value from app_state').all();db.close();
const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
const digest=value=>createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const planned=[];
for(const row of rows){
 if(row.key.startsWith('limits:')||row.key==='google-oauth')continue;
 const value=JSON.parse(row.value);if(row.key==='accounts')value.sessions={};
 const {data,error}=await client.from('dioka_app_state').select('value').eq('key',row.key).maybeSingle();if(error)throw new Error('Could not inspect target schema; apply the core migration first.');
 if(data){if(digest(data.value)!==digest(value))throw new Error('Target already has a different record for '+row.key+'. No records were overwritten. Import into an empty project or reconcile deliberately.');continue}
 planned.push({key:row.key,value,version:1});
}
console.log('Planned records: '+planned.length+'. Sessions and temporary sign-in/rate-limit records excluded.');
if(!args.includes('--apply')){console.log('Dry run only. Review the target and rerun with --apply to import.');process.exit(0)}
if(planned.length){const {error}=await client.from('dioka_app_state').insert(planned);if(error)throw new Error('Import failed; an existing record or schema constraint prevented the atomic insert. No overwrite was requested.')}
console.log('Import complete. Sign in again to create a new session.');
