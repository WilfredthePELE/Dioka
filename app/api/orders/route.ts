import { NextRequest, NextResponse } from "next/server";
import {
  getUserFromSession,
  recordUserOrder,
  StoredCartItem,
} from "@/lib/auth-storage";

export async function POST(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("dioka_token")?.value;
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;

    const user = await getUserFromSession(cookieToken || bearerToken);
    const body = await req.json();

    const { items, subtotal, total, currency, shippingAddress } = body as {
      items?: StoredCartItem[];
      subtotal?: number;
      total?: number;
      currency?: string;
      shippingAddress?: {
        fullName?: string;
        street?: string;
        city?: string;
        country?: string;
        postalCode?: string;
        phone?: string;
      };
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!user) {
      // Guest order
      const guestOrderId = `DK-G-${Math.floor(10000 + Math.random() * 90000)}`;
      return NextResponse.json({
        success: true,
        orderId: guestOrderId,
        trackingCode: `DK-EXP-${guestOrderId}-INT`,
        message: "Guest order placed successfully.",
      });
    }

    const order = await recordUserOrder(user.id, {
      items,
      subtotal: subtotal || 0,
      total: total || 0,
      currency: currency || "USD",
      shippingAddress,
    });

    return NextResponse.json({
      success: true,
      order,
      message: `Order #${order.orderId} recorded to ${user.name}'s account.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to place order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
