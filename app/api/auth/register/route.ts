import { NextRequest, NextResponse } from "next/server";
import { createUser, createSession, StoredCartItem } from "@/lib/auth-storage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, initialCart } = body as {
      name?: string;
      email?: string;
      password?: string;
      initialCart?: StoredCartItem[];
    };

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Please enter your full name." },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const user = await createUser({
      name,
      email,
      password,
      initialCart,
    });

    const token = await createSession(user.id);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tier: user.tier,
        cart: user.cart,
        wishlist: user.wishlist,
        shippingAddress: user.shippingAddress,
        ordersCount: user.orders.length,
      },
      token,
      message: `Welcome to Dioka, ${user.name}! Your specialized bag has been created.`,
    });

    // Set secure cookie
    response.cookies.set("dioka_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create account.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
