import { createHash, randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { z } from "zod";
import { readState, atomicStates, setState } from "@/lib/persistence";
import { HttpError } from "@/lib/http";
import type { StoredCartItem } from "@/lib/auth-storage";
export const googleReady = () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.DIOKA_SITE_URL);
export function googleConfig() {
  if (!googleReady()) throw new HttpError(503, "Google sign-in needs the store owner's Google configuration.");
  const origin = new URL(process.env.DIOKA_SITE_URL!);
  if (origin.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(origin.hostname)) throw new Error("Google sign-in requires HTTPS.");
  return { clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET!, origin: origin.origin, redirectUri: origin.origin + "/api/auth/google/callback" };
}
interface Transaction { nonce: string; verifier: string; returnTo: "/" | "/admin"; expiresAt: number; cart: StoredCartItem[]; linkUserId?: string }
type Transactions = Record<string, Transaction>;
const hash = (value: string) => createHash("sha256").update(value).digest("base64url");
export async function beginGoogle(returnTo: "/" | "/admin", cart: StoredCartItem[], linkUserId?: string) {
  const config = googleConfig();
  const state = randomBytes(32).toString("base64url"), verifier = randomBytes(48).toString("base64url"), nonce = randomBytes(32).toString("base64url");
  await setState("oauth:"+hash(state),{nonce,verifier,returnTo,cart,linkUserId,expiresAt:Date.now()+600000});
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({ client_id: config.clientId, redirect_uri: config.redirectUri, response_type: "code", scope: "openid email profile", state, nonce, code_challenge: hash(verifier), code_challenge_method: "S256", prompt: "select_account" }).toString();
  return { state, url: url.toString() };
}
export async function consumeGoogle(state: string, cookie?: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(state) || cookie !== state) throw new HttpError(400, "Google sign-in expired. Please try again.");
  const id="oauth:"+hash(state);return atomicStates({[id]:null},rows=>{const transaction=rows[id] as Transaction|null;rows[id]=null;return transaction&&transaction.expiresAt>Date.now()?transaction:null;});
}
const keys = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"), { timeoutDuration: 10000 });
export async function verifyGoogleToken(token: string, nonce: string) {
  const { payload } = await jwtVerify(token, keys, { audience: googleConfig().clientId, issuer: ["https://accounts.google.com", "accounts.google.com"], algorithms: ["RS256"], requiredClaims: ["sub", "iat", "exp", "nonce", "email", "email_verified"] });
  if (payload.nonce !== nonce || payload.email_verified !== true || (payload.azp && payload.azp !== googleConfig().clientId)) throw new Error("Google identity could not be verified.");
  const identity = z.object({ sub: z.string().min(1).max(255), email: z.string().email().max(254), name: z.string().max(200).optional(), hd: z.string().max(254).optional() }).parse(payload);
  return { subject: identity.sub, email: identity.email.toLowerCase(), name: identity.name || identity.email.split("@")[0], authoritative: /@(gmail|googlemail)\.com$/i.test(identity.email) || Boolean(identity.hd) };
}
export async function exchangeGoogle(code: string, transaction: Transaction) {
  const config = googleConfig();
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: config.clientId, client_secret: config.clientSecret, redirect_uri: config.redirectUri, grant_type: "authorization_code", code_verifier: transaction.verifier }), signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error("Google authorization failed.");
  const data = await response.json();
  if (typeof data.id_token !== "string" || data.id_token.length > 20000) throw new Error("Google did not return an identity token.");
  return verifyGoogleToken(data.id_token, transaction.nonce);
}
