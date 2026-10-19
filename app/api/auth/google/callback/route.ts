import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { consumeGoogle, exchangeGoogle, googleConfig, googleReady } from "@/lib/google-auth";
import { googleAccount, createSession, deleteSession, getUserFromSession, mergeUserCart } from "@/lib/auth-storage";
import { isAdminEmail } from "@/lib/http";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  if (!googleReady()) return Response.json({ error: "Google sign-in is not configured." }, { status: 503 });
  const config = googleConfig();
  let returnTo = "/";
  try {
    const url = new URL(request.url), jar = await cookies();
    const transaction = await consumeGoogle(url.searchParams.get("state") || "", jar.get("dioka_google_state")?.value);
    if (!transaction) throw new Error("expired");
    returnTo = transaction.returnTo;
    if (url.searchParams.has("error")) throw new Error("cancelled");
    const code = url.searchParams.get("code"); if (!code || code.length > 4000) throw new Error("invalid");
    const identity = await exchangeGoogle(code, transaction);
    const currentToken = jar.get("dioka_token")?.value;
    const currentUser = transaction.linkUserId ? await getUserFromSession(currentToken) : null;
    if (transaction.linkUserId && currentUser?.id !== transaction.linkUserId) throw new Error("link");
    const user = await googleAccount(identity, isAdminEmail(identity.email), currentUser?.id);
    if (returnTo === "/admin" && !isAdminEmail(user.email)) throw new Error("administrator");
    if (transaction.cart.length) await mergeUserCart(user.id, transaction.cart);
    if (currentToken) await deleteSession(currentToken);
    const response = NextResponse.redirect(new URL(returnTo, config.origin), 303);
    response.cookies.set("dioka_token", await createSession(user.id), { httpOnly: true, secure: config.origin.startsWith("https:"), sameSite: "lax", maxAge: 7 * 86400, path: "/" });
    response.cookies.set("dioka_google_state", "", { path: "/", maxAge: 0 });
    response.headers.set("Cache-Control", "no-store"); return response;
  } catch {
    const response = NextResponse.redirect(new URL("/auth/result?returnTo=" + encodeURIComponent(returnTo), config.origin), 303);
    response.cookies.set("dioka_google_state", "", { path: "/", maxAge: 0 });
    response.headers.set("Cache-Control", "no-store"); return response;
  }
}
