import {readFile,writeFile} from 'node:fs/promises';
import ts from 'typescript';
const source=await readFile('lib/products.ts','utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {products}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const contentSource=await readFile('lib/site-content.ts','utf8');
const contentCode=contentSource.match(/export const defaultContent = (\{.*\});/)[0];
const {defaultContent}=await import('data:text/javascript;base64,'+Buffer.from(contentCode).toString('base64'));
const rows={
 ...Object.fromEntries(products.map(p=>['product:'+p.id,{...p,version:1,stockQuantity:0,inStock:false}])),
 content:defaultContent,'schema:partitioned':{ready:true}
};
const quote=value=>"'"+JSON.stringify(value).replaceAll("'","''")+"'::jsonb";
const sql='-- Initial Dioka data. Existing records are never overwritten.\n-- Stock starts at zero until the owner enters actual inventory.\nbegin;\n'+Object.entries(rows).map(([key,value])=>"insert into public.dioka_app_state(key,value,version) values ('"+key+"',"+quote(value)+",1) on conflict(key) do nothing;").join('\n')+'\ncommit;\n';
await writeFile('supabase/seed.sql',sql);console.log('Generated safe initial catalogue, content and empty business records.');
