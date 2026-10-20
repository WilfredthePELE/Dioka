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
    return failure(err);
  }
}
