import { products, type Category, type Product } from "@/lib/products";
import { atomicStates, mutateState, readState, listStates, remote } from "@/lib/persistence";
import { invalidatePublicCache } from "@/lib/public-cache";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { HttpError } from "@/lib/http";
export type { Category }; export type AdminProduct=Product;
type Reservation={items:{id:string;quantity:number}[];expiresAt:number;status:"pending"|"paid"|"released"};
let initialized:Promise<void>|undefined;
async function ensureCatalogue(){initialized??=(async()=>{if((await listStates<Product>("product:",{limit:1})).length)return;for(const product of products)await atomicStates({["product:"+product.id]:null},rows=>{rows["product:"+product.id]??={...product,version:1,stockQuantity:0,inStock:false};});})();return initialized;}
export const productSchema = z.object({
  version: z.number().int().min(0).optional(),
  id: z.string().regex(/^[a-z0-9-]+$/).max(100), name: z.string().trim().min(2).max(160),
  category: z.enum(["Bags", "Footwear", "Jackets"]), price: z.number().finite().positive().multipleOf(0.01).max(1000000),
  image: z.string().max(2000).refine(v => /^\/(?!\/)/.test(v) || /^https:\/\//.test(v), "Use a local path or HTTPS image URL"),
  position: z.string().max(60).default("center"), sizes: z.array(z.string().trim().min(1).max(60)).min(1).max(30),
  color: z.string().max(100), description: z.string().trim().min(5).max(5000),
  subtitle: z.string().max(300).optional(), materials: z.string().max(1000).optional(), dimensions: z.string().max(500).optional(), care: z.string().max(2000).optional(),
  details: z.array(z.string().max(1000)).max(30).optional(), bagType: z.enum(["Shoulder Bags", "Crossbody Bags", "Travel & Duffle Bags"]).optional(),
  stockQuantity: z.number().int().min(0).max(1000000), inStock: z.boolean().optional(), rating: z.number().min(0).max(5).optional(), reviews: z.number().int().min(0).optional(),
});

export async function adminListProducts(){await ensureCatalogue();return(await listStates<Product & {archived?:boolean}>("product:",{limit:1000})).map(r=>r.value).filter(p=>!p.archived);}
export async function adminGetProduct(id:string){const product=await readState<Product & {archived?:boolean}|null>("product:"+id,null);return product&&!product.archived?product:null;}
export async function adminUpsertProduct(input:AdminProduct){await ensureCatalogue();const product=productSchema.parse(input);if(product.category==="Bags"&&!product.bagType)product.bagType="Shoulder Bags";return atomicStates({["product:"+product.id]:null},rows=>{const existing=rows["product:"+product.id] as Product|null;if(existing&&(product.version??0)!==(existing.version??0))throw new HttpError(409,"This piece changed. Close and reopen the editor before saving.");rows["product:"+product.id]={...product,version:(existing?.version||0)+1,inStock:product.stockQuantity>0};return{upserted:!existing};});}
export async function adminUpdatePriceAndQuantity(id:string,price:number,stockQuantity:number,version?:number){const product=await adminGetProduct(id);if(!product)return null;await adminUpsertProduct({...product,price,stockQuantity,version});return adminGetProduct(id);}
export async function adminDeleteProduct(id:string){await mutateState<Product & {archived?:boolean}|null,void>("product:"+id,null,product=>{if(product){product.archived=true;product.version=(product.version||0)+1;}});}
export async function reserveInventory(items:{id:string;quantity:number;price:number}[],id:string=randomUUID()){
 await ensureCatalogue();
 if(remote){const {error}=await remote.rpc("dioka_reserve_inventory",{p_id:id,p_items:items});if(error)throw new HttpError(error.code==="P0001"?400:503,error.code==="P0001"?"A selection changed or sold out. Please review your bag.":"Inventory is busy. Please retry shortly.");invalidatePublicCache();return id;}
 const combined=new Map<string,{quantity:number;price:number}>();for(const item of items){const previous=combined.get(item.id);if(previous&&previous.price!==item.price)throw new HttpError(400,"A selection changed.");combined.set(item.id,{quantity:(previous?.quantity||0)+item.quantity,price:item.price});}
 const reservationKey="reservation:"+id,initial:Record<string,unknown>={[reservationKey]:null};for(const productId of combined.keys())initial["product:"+productId]=null;
 await atomicStates(initial,rows=>{if(rows[reservationKey])return;for(const [productId,item] of combined){const p=rows["product:"+productId] as (Product & {archived?:boolean})|null;if(!p||p.archived||p.price!==item.price||!p.inStock||(p.stockQuantity||0)<item.quantity)throw new HttpError(400,"A selection changed or sold out. Please review your bag.");p.stockQuantity=(p.stockQuantity||0)-item.quantity;p.inStock=p.stockQuantity>0;p.version=(p.version||0)+1;}rows[reservationKey]={items:[...combined].map(([productId,item])=>({id:productId,quantity:item.quantity})),expiresAt:Date.now()+40*60000,status:"pending"};});invalidatePublicCache();return id;
}
export async function settleInventory(id:string,paid:boolean){
 if(remote){const {error}=await remote.rpc("dioka_settle_inventory",{p_id:id,p_paid:paid});if(error)throw new Error("Inventory settlement failed; reconciliation is required.");invalidatePublicCache();return;}
 const key="reservation:"+id,reservation=await readState<Reservation|null>(key,null);if(!reservation)throw new Error("Reservation not found.");const initial:Record<string,unknown>={[key]:null};for(const item of reservation.items)initial["product:"+item.id]=null;
 await atomicStates(initial,rows=>{const r=rows[key] as Reservation;if(paid){if(r.status==="released")throw new Error("Released inventory needs payment reconciliation.");r.status="paid";}else if(r.status==="pending"){for(const item of r.items){const p=rows["product:"+item.id] as Product|null;if(p){p.stockQuantity=(p.stockQuantity||0)+item.quantity;p.inStock=p.stockQuantity>0;p.version=(p.version||0)+1;}}r.status="released";}});invalidatePublicCache();
}
