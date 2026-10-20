import { getContent } from "@/lib/site-content";
import { failure } from "@/lib/http";
import { publicJson } from "@/lib/public-cache";
export const dynamic = "force-dynamic";
export async function GET(request:Request) { try { return await publicJson(request,"content",async()=>({content:await getContent()})); } catch(e){return failure(e);} }
