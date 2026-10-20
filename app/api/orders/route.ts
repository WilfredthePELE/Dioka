import { cookies } from "next/headers";
import { getUserFromSession } from "@/lib/auth-storage";
import { listOrders } from "@/lib/orders";
import { failure, HttpError } from "@/lib/http";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const user = await getUserFromSession((await cookies()).get("dioka_token")?.value);
    if (!user) throw new HttpError(401, "Sign in to view your orders. Guests can contact our team with their order reference.");
    const id = new URL(request.url).searchParams.get("id");
    const orders = Object.values(await listOrders(user.id)).filter(order => order.userId === user.id && (!id || order.id.toLowerCase() === id.toLowerCase() || order.trackingCode.toLowerCase() === id.toLowerCase()));
    return Response.json({ orders }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) { return failure(e); }
}
export async function POST() { return Response.json({ error: "Complete payment through secure checkout. Orders are recorded after payment verification." }, { status: 405 }); }
