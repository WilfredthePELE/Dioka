import { z } from "zod";
import { assertOrigin, bodyJson, failure, HttpError, limit } from "@/lib/http";
import { mutateState, identityKey } from "@/lib/persistence";
export async function POST(request: Request) {
  try {
    assertOrigin(request); await limit(request, "newsletter", 8);
    const parsed = z.object({ email: z.string().trim().email().max(254) }).safeParse(await bodyJson(request));
    if (!parsed.success) throw new HttpError(400, "Enter a valid email address.");
    const email=parsed.data.email.toLowerCase();
    await mutateState(identityKey("subscriber",email),{email,createdAt:new Date().toISOString()},()=>undefined);
    return Response.json({ success: true });
  } catch (e) { return failure(e); }
}
