import {z} from "zod";
import fields from "@/lib/site-editable.json";
const known=new Map(fields.map(field=>[field.id,field]));
const texts=z.record(z.string().max(32),z.string().max(5000)).refine(value=>Object.keys(value).length<=600&&Object.keys(value).every(key=>known.get(key)?.kind==="text"),"Unknown text field");
const safeUrl=(value:string,link:boolean)=>/^\/(?!\/)/.test(value)||/^https:\/\//.test(value)||(link&&/^(mailto:|tel:|#)/.test(value));
const assets=z.record(z.string().max(32),z.string().max(2000)).refine(value=>Object.keys(value).length<=300&&Object.entries(value).every(([key,url])=>{const field=known.get(key);return field&&(field.kind==="asset"||field.kind==="link")&&safeUrl(url,field.kind==="link")}),"Use a website path or HTTPS URL for a known media/link field");
export const controlsSchema=z.object({texts:texts.default({}),assets:assets.default({}),sections:z.record(z.string().max(32),z.boolean()).refine(value=>Object.keys(value).length<=100&&Object.keys(value).every(key=>known.get(key)?.kind==="section")).default({}),order:z.record(z.string().max(120),z.array(z.string().max(32)).max(80)).refine(value=>Object.keys(value).length<=10&&Object.values(value).every(ids=>new Set(ids).size===ids.length&&ids.every(id=>known.get(id)?.kind==="section"))).default({})}).default({});
