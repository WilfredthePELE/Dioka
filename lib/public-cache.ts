import {createHash} from "node:crypto";
type Entry={expires:number;value:unknown};const values=new Map<string,Entry>(),pending=new Map<string,Promise<unknown>>();
export function invalidatePublicCache(){values.clear();}
export async function publicJson(request:Request,key:string,load:()=>Promise<unknown>){
 let entry=values.get(key);
 if(!entry||entry.expires<Date.now()){let work=pending.get(key);if(!work){work=load().then(value=>{values.set(key,{value,expires:Date.now()+10000});return value}).finally(()=>pending.delete(key));pending.set(key,work);}entry={value:await work,expires:Date.now()+10000};}
 const body=JSON.stringify(entry.value),etag='"'+createHash('sha256').update(body).digest('hex')+'"',headers={"Cache-Control":"public, max-age=0, s-maxage=10, stale-while-revalidate=30",ETag:etag,"Content-Type":"application/json"};
 return request.headers.get('if-none-match')===etag?new Response(null,{status:304,headers}):new Response(body,{headers});
}
