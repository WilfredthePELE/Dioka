import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { conversationId, getInbox, sendCustomerMessage } from "@/lib/chat";
import { assertOrigin, bodyJson, failure, HttpError, limit } from "@/lib/http";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const token = (await cookies()).get("dioka_chat")?.value;
    const conversation = token && /^[a-f0-9]{64}$/.test(token) ? (await getInbox())[conversationId(token)] : null;
    return Response.json({ conversation: conversation || null }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) { return failure(e); }
}
export async function POST(request: Request) {
  try {
    assertOrigin(request); await limit(request, "chat", 40);
    const parsed = z.object({ id: z.string().uuid(), text: z.string().trim().min(1).max(4000), name: z.string().trim().max(100).optional(), email: z.union([z.string().email().max(254), z.literal("")]).optional() }).safeParse(await bodyJson(request));
    if (!parsed.success) throw new HttpError(400, "Enter a message and a valid contact email, if provided.");
    const existing = (await cookies()).get("dioka_chat")?.value;
    const token = existing && /^[a-f0-9]{64}$/.test(existing) ? existing : randomBytes(32).toString("hex");
    const conversation = await sendCustomerMessage(conversationId(token), parsed.data);
    const response = NextResponse.json({ conversation });
    response.cookies.set("dioka_chat", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 30 * 86400 }); return response;
  } catch (e) { return failure(e); }
}
