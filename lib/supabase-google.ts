import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { setState } from "@/lib/persistence";
import { HttpError } from "@/lib/http";
import type { StoredCartItem } from "@/lib/auth-storage";

export const supabaseGoogleSelected = () => process.env.DIOKA_GOOGLE_AUTH_PROVIDER === "supabase";
export const supabaseGoogleReady = () => Boolean(
  supabaseGoogleSelected() && process.env.DIOKA_SUPABASE_GOOGLE_ENABLED === "true" &&
  (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  (process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) && process.env.DIOKA_SITE_URL
);
export function authOrigin() {
  const url = new URL(process.env.DIOKA_SITE_URL || "http://localhost:3000");
  if (url.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(url.hostname)) throw new Error("Sign-in requires HTTPS.");
  return url.origin;
}
export async function supabaseAuthClient() {
  if (!supabaseGoogleReady()) throw new HttpError(503, "Google sign-in is being connected. Please use your email for now.");
  const jar = await cookies();
  return createServerClient(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!,
    (process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!,
    {
      cookieOptions: { name: "dioka-supabase", path: "/api/auth/supabase", httpOnly: true, sameSite: "lax", secure: authOrigin().startsWith("https:"), maxAge: 600 },
      cookies: {
        getAll: () => jar.getAll(),
        setAll: updates => updates.forEach(({ name, value, options }) => jar.set(name, value, { ...options, httpOnly: true })),
      },
      global: { fetch: (input, init) => fetch(input, { ...init, signal: init?.signal || AbortSignal.timeout(10000) }) },
    },
  );
}
export async function beginSupabaseGoogle(returnTo: "/" | "/admin" | "/account", cart: StoredCartItem[], linkUserId?: string) {
  const client = await supabaseAuthClient();
  const state = randomBytes(32).toString("base64url");
  // This transaction binds the bag/link target to this browser. Supabase's separate
  // HttpOnly verifier cookie binds the authorization code through PKCE.
  await setState("oauth:" + createHash("sha256").update(state).digest("base64url"), {
    provider: "supabase", nonce: "", verifier: "", returnTo, cart, linkUserId, expiresAt: Date.now() + 600000,
  });
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: authOrigin() + "/api/auth/supabase/callback", skipBrowserRedirect: true, scopes: "openid email profile", queryParams: { prompt: "select_account" } },
  });
  if (error || !data.url) throw new HttpError(503, "Google sign-in could not be opened. Please try again.");
  return { state, url: data.url };
}
export async function clearSupabaseCookies() {
  const jar = await cookies();
  for (const item of jar.getAll()) if (item.name.startsWith("dioka-supabase")) {
    jar.set(item.name, "", { path: "/api/auth/supabase", maxAge: 0, httpOnly: true, sameSite: "lax", secure: authOrigin().startsWith("https:") });
  }
}
