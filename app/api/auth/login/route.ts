import { NextRequest, NextResponse } from "next/server";
import {
  findUserByEmail,
  hashPasswordWithSalt,
  createSession,
  updateUserCart,
  StoredCartItem,
} from "@/lib/auth-storage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, incomingCart } = body as {
      email?: string;
      password?: string;
      incomingCart?: StoredCartItem[];
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email. Please check or sign up." },
        { status: 401 }
      );
    }

    const computedHash = hashPasswordWithSalt(password, user.salt);
    if (computedHash !== user.passwordHash) {
      return NextResponse.json(
        { error: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    // If guest had items in their cart, merge into user's specialized cart
    if (incomingCart && Array.isArray(incomingCart) && incomingCart.length > 0) {
      const mergedCart = [...user.cart];
      for (const item of incomingCart) {
        const existingIdx = mergedCart.findIndex(
          (m) => m.id === item.id && m.size === item.size
        );
        if (existingIdx >= 0) {
          mergedCart[existingIdx].quantity = Math.min(
            10,
            mergedCart[existingIdx].quantity + item.quantity
          );
        } else {
          mergedCart.push(item);
        }
      }
      user.cart = await updateUserCart(user.id, mergedCart);
    }

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
        orders: user.orders,
      },
      token,
      message: `Welcome back, ${user.name}! Your specialized bag has been synchronized.`,
    });

    response.cookies.set("dioka_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
