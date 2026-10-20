import { readState } from "@/lib/persistence";
export const dynamic = "force-dynamic";
export async function GET() {
  try { await readState("health", null); return Response.json({ status: "ok" }); }
  catch { return Response.json({ status: "unavailable" }, { status: 503 }); }
}
