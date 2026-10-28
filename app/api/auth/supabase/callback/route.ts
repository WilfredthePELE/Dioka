import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { consumeGoogle } from "@/lib/google-auth";
import { authOrigin, supabaseAuthClient, clearSupabaseCookies } from "@/lib/supabase-google";
import { googleAccount, createSession, deleteSession, getUserFromSession, mergeUserCart, linkSupabaseAccount } from "@/lib/auth-storage";
import { isAdminEmail } from "@/lib/http";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  let returnTo = "/account";
  let stage = "read-state";
  try {
    const jar = await cookies(), url = new URL(request.url), state = jar.get("dioka_google_state")?.value || "";
    const transaction = await consumeGoogle(state, state);
    if (!transaction || transaction.provider !== "supabase" || url.searchParams.has("error")) throw new Error("Sign-in expired or was cancelled.");
    returnTo = transaction.returnTo;
    const code = url.searchParams.get("code");
    if (!code || code.length > 4000) throw new Error("Invalid authorization code.");
    stage = "exchange-code";
    const client = await supabaseAuthClient();
    const exchanged = await client.auth.exchangeCodeForSession(code);
    if (exchanged.error || !exchanged.data.session) throw new Error("Code exchange failed.");
    // Validate against the Auth server; never authorize from getSession() or user_metadata.
    stage = "verify-identity";
    const verified = await client.auth.getUser(exchanged.data.session.access_token);
    if (verified.error || !verified.data.user?.email_confirmed_at) throw new Error("Identity verification failed.");
    const authUser = verified.data.user;
    const provider = authUser.identities?.find(identity => identity.provider === "google");
    const claims = z.object({ sub: z.string().min(1).max(255), email: z.string().email().max(254), email_verified: z.literal(true), name: z.string().max(200).optional(), hd: z.string().max(254).optional() }).parse(provider?.identity_data);
    if (claims.email.toLowerCase() !== authUser.email?.toLowerCase()) throw new Error("Identity email mismatch.");
    const token = jar.get("dioka_token")?.value;
    const current = transaction.linkUserId ? await getUserFromSession(token) : null;
    if (transaction.linkUserId && transaction.linkUserId !== current?.id) throw new Error("Account linking session changed.");
    const identity = { subject: claims.sub, email: claims.email.toLowerCase(), name: claims.name || claims.email.split("@")[0], authoritative: /@(gmail|googlemail)\.com$/i.test(claims.email) || Boolean(claims.hd) };
    stage = "save-account";
    const user = await googleAccount(identity, isAdminEmail(identity.email), current?.id);
    if (returnTo === "/admin" && !isAdminEmail(user.email)) throw new Error("Owner access required.");
    await linkSupabaseAccount(user.id, authUser.id, identity.subject);
    if (transaction.cart.length) await mergeUserCart(user.id, transaction.cart);
    const session = await createSession(user.id);
    stage = "verify-session";
    if ((await getUserFromSession(session))?.id !== user.id) throw new Error("The new session could not be read back.");
    if (token) await deleteSession(token);
    // The website uses its own server-checked opaque session. Do not retain a
    // second browser-readable Supabase session or expose provider access tokens.
    await client.auth.signOut({ scope: "local" });
    await clearSupabaseCookies();
    const response = NextResponse.redirect(new URL(returnTo, authOrigin()), 303);
    response.cookies.set("dioka_token", session, { httpOnly: true, secure: authOrigin().startsWith("https:"), sameSite: "lax", maxAge: 7 * 86400, path: "/" });
    response.cookies.set("dioka_google_state", "", { path: "/", maxAge: 0 });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("Dioka Google sign-in callback failed", { stage, errorType: error instanceof Error ? error.name : "unknown" });
    await clearSupabaseCookies();
    const response = NextResponse.redirect(new URL("/auth/result?returnTo=" + encodeURIComponent(returnTo), authOrigin()), 303);
    response.cookies.set("dioka_google_state", "", { path: "/", maxAge: 0 });
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
}
