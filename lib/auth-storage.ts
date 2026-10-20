import crypto from "node:crypto";
import { promisify } from "node:util";
import { readState, mutateState, atomicStates, setState, deleteState, identityKey } from "@/lib/persistence";
import { z } from "zod";
const scrypt=promisify(crypto.scrypt);
export interface StoredCartItem { id: string; size: string; quantity: number; addedAt?: string; color?: string; leather?: string; shape?: string; monogram?: string; itemKey?: string }
export interface UserOrder { orderId: string; items: StoredCartItem[]; subtotal: number; total: number; currency: string; shippingAddress?: UserAccount["shippingAddress"]; status: "Confirmed" | "Crafting" | "Dispatched" | "Delivered"; trackingCode: string; createdAt: string }
export interface UserAccount {
  id: string; name: string; email: string; googleSubject?: string; passwordHash: string; salt: string; tier: string;
  cart: StoredCartItem[]; wishlist: string[]; orders: UserOrder[];
  shippingAddress?: { fullName?: string; street?: string; city?: string; country?: string; postalCode?: string; phone?: string };
  createdAt: string; updatedAt: string;
}
export const cartSchema = z.array(z.object({ id: z.string().min(1).max(100), size: z.string().min(1).max(100), quantity: z.number().int().min(1).max(10), addedAt: z.string().max(100).optional(), color: z.string().max(100).optional(), leather: z.string().max(100).optional(), shape: z.string().max(100).optional(), monogram: z.string().max(3).optional(), itemKey: z.string().max(500).optional() })).max(50);
let hashing=0;
export async function hashPassword(password:string,salt:string){if(hashing>=32)throw new Error("Sign-in is busy. Please retry shortly.");hashing++;try{return(await scrypt(password,salt,64) as Buffer).toString("hex");}finally{hashing--;}}
export async function verifyPassword(password: string, user: UserAccount) {
  if (!user.passwordHash || !user.salt) return false;
  const expected = Buffer.from(user.passwordHash, "hex");
  const actual = Buffer.from(await hashPassword(password, user.salt), "hex");
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

export async function findUserByEmail(email:string){const index=await readState<{id:string}|null>(identityKey("email",email.trim().toLowerCase()),null);return index?findUserById(index.id):null;}
export function findUserById(id:string){return readState<UserAccount|null>("user:"+id,null);}
async function insertUser(user:UserAccount){const emailKey=identityKey("email",user.email),userKey="user:"+user.id;return atomicStates({[emailKey]:null,[userKey]:null},rows=>{if(rows[emailKey])throw new Error("An account with this email already exists.");rows[emailKey]={id:user.id};rows[userKey]=user;return user;});}
export async function createUser(params:{name:string;email:string;password:string;initialCart?:StoredCartItem[]}){const email=params.email.trim().toLowerCase(),salt=crypto.randomBytes(24).toString("hex"),passwordHash=await hashPassword(params.password,salt),now=new Date().toISOString();return insertUser({id:crypto.randomUUID(),name:params.name.trim(),email,salt,passwordHash,tier:"Dioka Atelier Member",cart:cartSchema.parse(params.initialCart||[]),wishlist:[],orders:[],createdAt:now,updatedAt:now});}
const sessionKey=(token:string)=>"session:"+crypto.createHash("sha256").update(token).digest("hex");
export async function createSession(userId:string){const token=crypto.randomBytes(32).toString("hex");await setState(sessionKey(token),{userId,expiresAt:Date.now()+7*86400000});return token;}
export async function getUserFromSession(token?:string|null){if(!token||!/^[a-f0-9]{64}$/.test(token))return null;const session=await readState<{userId:string;expiresAt:number}|null>(sessionKey(token),null);return session&&session.expiresAt>Date.now()?findUserById(session.userId):null;}
export async function deleteSession(token:string){await deleteState(sessionKey(token));}
async function changeUser<R>(id:string,change:(user:UserAccount)=>R){return mutateState<UserAccount|null,R>("user:"+id,null,user=>{if(!user)throw new Error("User not found.");const result=change(user);user.updatedAt=new Date().toISOString();return result;});}
export function updateUserCart(id:string,cart:StoredCartItem[]){const items=cartSchema.parse(cart);return changeUser(id,user=>{user.cart=items;return items;});}
export async function applyPurchaseToCart(userId:string,purchased:StoredCartItem[],sessionId:string){const userKey="user:"+userId,paidKey="paidcart:"+sessionId;await atomicStates({[userKey]:null,[paidKey]:null},rows=>{if(rows[paidKey]?.done)return;const user=rows[userKey] as UserAccount|null;if(user)user.cart=user.cart.flatMap(item=>{const count=purchased.filter(p=>sameSelection(p,item)).reduce((sum,p)=>sum+p.quantity,0);return item.quantity>count?[{...item,quantity:item.quantity-count}]:[];});rows[paidKey]={done:true};});}
function sameSelection(a:StoredCartItem,b:StoredCartItem){return a.id===b.id&&a.size===b.size&&(a.color||"")===(b.color||"")&&(a.leather||"")===(b.leather||"")&&(a.shape||"")===(b.shape||"")&&(a.monogram||"")===(b.monogram||"");}
export function updateUserProfile(id:string,updates:{name?:string;shippingAddress?:UserAccount["shippingAddress"]}){return changeUser(id,user=>{if(updates.name)user.name=updates.name.trim();if(updates.shippingAddress)user.shippingAddress=updates.shippingAddress;return user;});}
export function recordUserOrder(id:string,data:Omit<UserOrder,"orderId"|"createdAt"|"status"|"trackingCode">){return changeUser(id,user=>{const order:UserOrder={...data,orderId:"DK-"+crypto.randomUUID(),trackingCode:"",status:"Confirmed",createdAt:new Date().toISOString()};user.orders.unshift(order);user.cart=[];return order;});}
export async function googleAccount(identity:{subject:string;email:string;name:string;authoritative:boolean},administrator:boolean,linkUserId?:string){
 const googleKey=identityKey("google",identity.subject),emailKey=identityKey("email",identity.email),existingSubject=await readState<{id:string}|null>(googleKey,null);
 if(existingSubject){if(linkUserId&&linkUserId!==existingSubject.id)throw new Error("Google account already connected.");const user=await findUserById(existingSubject.id);if(!user)throw new Error("Account unavailable.");return user;}
 const existing=await findUserByEmail(identity.email);if(linkUserId&&existing?.id!==linkUserId)throw new Error("Connect the Google account with the same email as your Dioka account.");
 const id=existing?.id||crypto.randomUUID(),userKey="user:"+id,now=new Date().toISOString();
 return atomicStates({[googleKey]:null,[emailKey]:null,[userKey]:null},rows=>{
  if(rows[googleKey])throw new Error("Google identity changed. Please retry sign-in.");
  let user=rows[userKey] as UserAccount|null;
  if(user){if(user.googleSubject||(!identity.authoritative&&id!==linkUserId))throw new Error("Sign in with your password before connecting Google.");user.googleSubject=identity.subject;user.updatedAt=now;}
  else{if(rows[emailKey])throw new Error("An account already exists. Please sign in first.");if(administrator&&!identity.authoritative)throw new Error("Verify ownership before connecting this administrator email.");user={id,name:identity.name,email:identity.email,googleSubject:identity.subject,passwordHash:"",salt:"",tier:"Dioka Atelier Member",cart:[],wishlist:[],orders:[],createdAt:now,updatedAt:now};rows[userKey]=user;rows[emailKey]={id};}
  rows[googleKey]={id};return user;
 });
}
export function mergeUserCart(id:string,incoming:StoredCartItem[]){const items=cartSchema.parse(incoming);return changeUser(id,user=>{for(const item of items){const existing=user.cart.find(m=>sameSelection(m,item));if(existing)existing.quantity=Math.min(10,existing.quantity+item.quantity);else user.cart.push(item);}user.cart=user.cart.slice(0,50);return user.cart;});}
