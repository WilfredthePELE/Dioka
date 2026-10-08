import { NextRequest, NextResponse } from "next/server";
import {
  getUserFromSession,
  updateUserCart,
  StoredCartItem,
} from "@/lib/auth-storage";

export async function GET(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("dioka_token")?.value;
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;

    const user = await getUserFromSession(cookieToken || bearerToken);

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        cart: [],
        message: "Guest mode. Items saved locally.",
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: { id: user.id, name: user.name, email: user.email },
      cart: user.cart,
      message: `${user.name}'s specialized bag loaded from Dioka Atelier cloud.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Cart fetch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("dioka_token")?.value;
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;

    const user = await getUserFromSession(cookieToken || bearerToken);
    const body = await req.json();
    const { items } = body as { items?: StoredCartItem[] };

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid cart items" }, { status: 400 });
    }

    if (!user) {
      // Guest mode
      return NextResponse.json({
        authenticated: false,
        cart: items,
        message: "Guest cart updated.",
      });
    }

    const updatedCart = await updateUserCart(user.id, items);

    return NextResponse.json({
      authenticated: true,
      userId: user.id,
      cart: updatedCart,
      message: `Synchronized ${updatedCart.length} item(s) to ${user.name}'s specialized bag.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Cart update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
