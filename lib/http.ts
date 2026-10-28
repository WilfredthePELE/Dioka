import { cookies } from "next/headers";
import { getUserFromSession } from "@/lib/auth-storage";
import { incrementLimit } from "@/lib/persistence";
import { createHash } from "node:crypto";
import { siteOrigin } from "@/lib/site-origin";
export class HttpError extends Error { constructor(public status: number, message: string, public retryAfter = 0) { super(message); } }
export function assertOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if ((origin && origin !== siteOrigin()) || request.headers.get("sec-fetch-site") === "cross-site") throw new HttpError(403, "Request origin is not allowed.");
}
export async function bodyJson(request:Request,maximum=65536){
 if(Number(request.headers.get("content-length")||0)>maximum)throw new HttpError(413,"Request is too large.");
 if(!request.body)throw new HttpError(400,"Invalid JSON.");
 const reader=request.body.getReader(),chunks:Uint8Array[]=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maximum){await reader.cancel();throw new HttpError(413,"Request is too large.");}chunks.push(value);}}finally{reader.releaseLock();}
 try{return JSON.parse(Buffer.concat(chunks).toString("utf8"));}catch{throw new HttpError(400,"Invalid JSON.");}
}

export function isAdminEmail(email: string) { return (process.env.DIOKA_ADMIN_EMAILS || "").split(",").map(x => x.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase()); }
export async function requireAdmin() {
  const user = await getUserFromSession((await cookies()).get("dioka_token")?.value);
  if (!user) throw new HttpError(401, "Please sign in.");
  if (!isAdminEmail(user.email)) throw new HttpError(403, "Administrator access required.");
  return user;
}
export function failure(error: unknown) {
  if (error instanceof HttpError) return Response.json({ error: error.message }, { status: error.status, headers: error.retryAfter ? { "Retry-After": String(error.retryAfter) } : {} });
  console.error("Dioka request failed", error);
  return Response.json({ error: "We could not complete this request. Please try again." }, { status: 503 });
}
export async function limit(request: Request, scope: string, maximum = 30) {
  const address = process.env.DIOKA_TRUST_PROXY === "true" ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown" : "shared";
  const hash = createHash("sha256").update(address).digest("hex").slice(0, 24);
  const allowed = await incrementLimit("limit:"+scope+":"+Math.floor(Date.now()/60000)+":"+hash,maximum);
  if (!allowed) throw new HttpError(429, "Too many requests. Please wait a minute.",60);
}
