import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth-storage";
import { assertOrigin, failure } from "@/lib/http";

export async function POST(req: NextRequest) {
  try {
    assertOrigin(req);
    const cookieToken = req.cookies.get("dioka_token")?.value;
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;

    const token = cookieToken || bearerToken;
    let sessionError: unknown;
    if (token) {
      try {
        await deleteSession(token);
      } catch (error) {
        // Clear the browser session even if the backing store is temporarily
        // unavailable, and tell the client that server-side revocation was not confirmed.
        sessionError = error;
      }
    }

    if (sessionError) console.error("Dioka sign-out could not revoke the stored session.", sessionError);
    const response = NextResponse.json({
      success: true,
      serverSessionRevoked: !sessionError,
      message: sessionError ? "Signed out in this browser; server session revocation could not be confirmed." : "Signed out successfully.",
    });
    const secure = req.nextUrl.protocol === "https:";
    response.cookies.set("dioka_token", "", { httpOnly: true, secure, sameSite: "lax", maxAge: 0, path: "/" });
    response.cookies.set("dioka_google_state", "", { secure, sameSite: "lax", maxAge: 0, path: "/" });
    for (const { name } of req.cookies.getAll()) {
      if (name.startsWith("dioka-supabase")) {
        response.cookies.set(name, "", { httpOnly: true, secure, sameSite: "lax", maxAge: 0, path: "/api/auth/supabase" });
      }
    }
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (err: unknown) {
    return failure(err);
  }
}
