import { cookies } from "next/headers";
import { getUserFromSession } from "@/lib/auth-storage";
import { customerView } from "@/lib/customer-view";
import { failure } from "@/lib/http";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const user = await getUserFromSession((await cookies()).get("dioka_token")?.value);
    return Response.json({ authenticated: Boolean(user), user: user ? await customerView(user) : null }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) { return failure(e); }
}
