import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/auth-storage";

export async function GET(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("dioka_token")?.value;
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;

    const token = cookieToken || bearerToken;
    const user = await getUserFromSession(token);

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tier: user.tier,
        cart: user.cart,
        wishlist: user.wishlist,
        shippingAddress: user.shippingAddress,
        orders: user.orders,
        createdAt: user.createdAt,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Session error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
