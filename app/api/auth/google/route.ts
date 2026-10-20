import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { beginGoogle, googleReady, googleConfig } from "@/lib/google-auth";
import { assertOrigin, bodyJson, failure, limit, HttpError } from "@/lib/http";
import { cartSchema, getUserFromSession } from "@/lib/auth-storage";
import { beginSupabaseGoogle, supabaseGoogleSelected, supabaseGoogleReady, authOrigin } from "@/lib/supabase-google";
export const dynamic = "force-dynamic";
export function GET() { return Response.json({ google: supabaseGoogleSelected() ? supabaseGoogleReady() : googleReady() }, { headers: { "Cache-Control": "no-store" } }); }
export async function POST(request: Request) {
  try {
    assertOrigin(request); await limit(request, "google-start", 10);
    const data = z.object({ returnTo: z.enum(["/", "/admin", "/account"]).default("/"), cart: cartSchema.default([]), connect: z.boolean().default(false) }).parse(await bodyJson(request));
    const user = data.connect ? await getUserFromSession((await cookies()).get("dioka_token")?.value) : null;
    if (data.connect && !user) throw new HttpError(401, "Sign in before connecting Google.");
    const result = await (supabaseGoogleSelected() ? beginSupabaseGoogle : beginGoogle)(data.returnTo, data.cart, user?.id);
    const response = NextResponse.json({ url: result.url });
    response.cookies.set("dioka_google_state", result.state, { httpOnly: true, sameSite: "lax", secure: authOrigin().startsWith("https:"), path: "/", maxAge: 600 });
    return response;
  } catch (error) { return failure(error); }
}
