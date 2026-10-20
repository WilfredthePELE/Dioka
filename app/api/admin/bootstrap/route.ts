import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { createUser, findUserByEmail } from "@/lib/auth-storage";
import { assertOrigin, bodyJson, failure, HttpError, isAdminEmail, limit } from "@/lib/http";
export async function POST(request: Request) {
  try {
    assertOrigin(request); await limit(request, "bootstrap", 3);
    const parsed = z.object({ secret: z.string().min(32).max(256), email: z.string().email(), name: z.string().min(2).max(120), password: z.string().min(12).max(128) }).safeParse(await bodyJson(request));
    const expected = process.env.DIOKA_BOOTSTRAP_SECRET || "";
    if (!parsed.success || expected.length < 32) throw new HttpError(403, "Administrator provisioning is unavailable.");
    const actual = Buffer.from(parsed.data.secret); const wanted = Buffer.from(expected);
    if (actual.length !== wanted.length || !timingSafeEqual(actual, wanted) || !isAdminEmail(parsed.data.email)) throw new HttpError(403, "Administrator provisioning is unavailable.");
    if (await findUserByEmail(parsed.data.email)) throw new HttpError(409, "This administrator already exists. Sign in instead.");
    await createUser(parsed.data); return Response.json({ success: true });
  } catch (e) { return failure(e); }
}
