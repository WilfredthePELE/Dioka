import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { findUserByEmail, resetUserPassword } from "@/lib/auth-storage";
import { assertOrigin, bodyJson, failure, HttpError, isAdminEmail, limit } from "@/lib/http";

export async function POST(request: Request) {
  try {
    assertOrigin(request);
    await limit(request, "admin-password-recovery", 3);
    if (process.env.DIOKA_ADMIN_PASSWORD) {
      throw new HttpError(409, "The owner password is managed in Vercel. Update DIOKA_ADMIN_PASSWORD there and redeploy.");
    }

    const parsed = z.object({
      email: z.string().trim().email().max(254),
      secret: z.string().min(32).max(256),
      password: z.string().min(12).max(128),
    }).safeParse(await bodyJson(request));
    const expected = process.env.DIOKA_ADMIN_RECOVERY_SECRET || "";
    if (!parsed.success || expected.length < 32) {
      throw new HttpError(403, "Owner password recovery is unavailable or the details could not be verified.");
    }

    const supplied = Buffer.from(parsed.data.secret);
    const configured = Buffer.from(expected);
    if (supplied.length !== configured.length || !timingSafeEqual(supplied, configured) || !isAdminEmail(parsed.data.email)) {
      throw new HttpError(403, "Owner password recovery is unavailable or the details could not be verified.");
    }

    const user = await findUserByEmail(parsed.data.email);
    if (!user || !isAdminEmail(user.email)) {
      throw new HttpError(403, "Owner password recovery is unavailable or the details could not be verified.");
    }

    await resetUserPassword(user.id, parsed.data.password);
    return Response.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return failure(error);
  }
}
