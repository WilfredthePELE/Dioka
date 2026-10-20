import { NextResponse } from "next/server";
import { findUserByEmail, verifyPassword, createSession, updateUserCart, cartSchema } from "@/lib/auth-storage";
import { assertOrigin, bodyJson, failure, HttpError, isAdminEmail, limit } from "@/lib/http";
import { z } from "zod";
import { customerView } from "@/lib/customer-view";
export async function POST(request: Request) {
  try {
    assertOrigin(request); await limit(request, "login", 10);
    const body = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(128), incomingCart: cartSchema.optional() }).safeParse(await bodyJson(request));
    if (!body.success) throw new HttpError(400, "Enter a valid email and password.");
    const user = await findUserByEmail(body.data.email);
    if (!user || !await verifyPassword(body.data.password, user)) throw new HttpError(401, "Email or password is incorrect.");
    if (body.data.incomingCart?.length) {
      const merged = structuredClone(user.cart);
      for (const item of body.data.incomingCart) { const existing = merged.find(m => m.id === item.id && m.size === item.size && (m.color || "") === (item.color || "") && (m.leather || "") === (item.leather || "") && (m.shape || "") === (item.shape || "") && (m.monogram || "") === (item.monogram || "")); if (existing) existing.quantity = Math.min(10, existing.quantity + item.quantity); else merged.push(item); }
      user.cart = await updateUserCart(user.id, merged.slice(0, 50));
    }
    const token = await createSession(user.id);
    const safe = await customerView(user);
    const response = NextResponse.json({ success: true, user: safe, admin: isAdminEmail(user.email) });
    response.cookies.set("dioka_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 86400, path: "/" });
    return response;
  } catch (error) { return failure(error); }
}
