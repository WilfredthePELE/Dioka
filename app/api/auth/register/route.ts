import { NextResponse } from "next/server";
import { createUser, createSession, cartSchema } from "@/lib/auth-storage";
import { assertOrigin, bodyJson, failure, HttpError, isAdminEmail, limit } from "@/lib/http";
import { z } from "zod";
import { customerView } from "@/lib/customer-view";
export async function POST(request: Request) {
  try {
    assertOrigin(request); await limit(request, "register", 5);
    const body = z.object({ name: z.string().trim().min(2).max(120), email: z.string().trim().email().max(254), password: z.string().min(12).max(128), initialCart: cartSchema.optional() }).safeParse(await bodyJson(request));
    if (!body.success) throw new HttpError(400, "Enter your name, a valid email, and a password of at least 12 characters.");
    if (isAdminEmail(body.data.email)) throw new HttpError(403, "This account must be provisioned by the store owner.");
    if (await import("@/lib/auth-storage").then(m => m.findUserByEmail(body.data.email))) throw new HttpError(409, "An account with this email already exists.");
    const user = await createUser(body.data); const token = await createSession(user.id);
    const safe = await customerView(user);
    const response = NextResponse.json({ success: true, user: safe });
    response.cookies.set("dioka_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 86400, path: "/" }); return response;
  } catch (error) { return failure(error); }
}
