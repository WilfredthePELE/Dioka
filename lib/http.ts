import { cookies } from "next/headers";
import { getUserFromSession } from "@/lib/auth-storage";
import { mutateState } from "@/lib/persistence";
import { createHash } from "node:crypto";
export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export function assertOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if ((origin && origin !== new URL(process.env.DIOKA_SITE_URL || request.url).origin) || request.headers.get("sec-fetch-site") === "cross-site") throw new HttpError(403, "Request origin is not allowed.");
}
export async function bodyJson(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 65536) throw new HttpError(413, "Request is too large.");
  const text = await request.text();
  if (Buffer.byteLength(text) > 65536) throw new HttpError(413, "Request is too large.");
  try { return JSON.parse(text); } catch { throw new HttpError(400, "Invalid JSON."); }
}
export function isAdminEmail(email: string) { return (process.env.DIOKA_ADMIN_EMAILS || "").split(",").map(x => x.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase()); }
export async function requireAdmin() {
  const user = await getUserFromSession((await cookies()).get("dioka_token")?.value);
  if (!user) throw new HttpError(401, "Please sign in.");
  if (!isAdminEmail(user.email)) throw new HttpError(403, "Administrator access required.");
  return user;
}
export function failure(error: unknown) {
  if (error instanceof HttpError) return Response.json({ error: error.message }, { status: error.status });
  console.error("Dioka request failed", error);
  return Response.json({ error: "We could not complete this request. Please try again." }, { status: 503 });
}
export async function limit(request: Request, scope: string, maximum = 30) {
  const address = process.env.DIOKA_TRUST_PROXY === "true" ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown" : "shared";
  const hash = createHash("sha256").update(address).digest("hex").slice(0, 24);
  const allowed = await mutateState(`limits:${scope}`, {} as Record<string, { count: number; reset: number }>, rows => {
    const now = Date.now();
    for (const id of Object.keys(rows)) if (rows[id].reset < now) delete rows[id];
    const entry = rows[hash] ||= { count: 0, reset: now + 60000 };
    return ++entry.count <= maximum;
  });
  if (!allowed) throw new HttpError(429, "Too many requests. Please wait a minute.");
}
