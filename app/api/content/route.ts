import { getContent } from "@/lib/site-content";
import { failure } from "@/lib/http";
export const dynamic = "force-dynamic";
export async function GET() { try { return Response.json({ content: await getContent() }, { headers: { "Cache-Control": "no-store" } }); } catch(e) { return failure(e); } }
