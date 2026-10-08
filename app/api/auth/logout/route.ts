import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth-storage";

export async function POST(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("dioka_token")?.value;
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;

    const token = cookieToken || bearerToken;
    if (token) {
      await deleteSession(token);
    }

    const response = NextResponse.json({
      success: true,
      message: "Signed out successfully.",
    });

    response.cookies.delete("dioka_token");
    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Logout error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
