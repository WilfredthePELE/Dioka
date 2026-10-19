import { z } from "zod";
import { assertOrigin, bodyJson, failure, HttpError, limit } from "@/lib/http";
import { mutateState } from "@/lib/persistence";
export async function POST(request: Request) {
  try {
    assertOrigin(request); await limit(request, "newsletter", 8);
    const parsed = z.object({ email: z.string().trim().email().max(254) }).safeParse(await bodyJson(request));
    if (!parsed.success) throw new HttpError(400, "Enter a valid email address.");
    await mutateState("subscribers", {} as Record<string, string>, rows => { rows[parsed.data.email.toLowerCase()] ||= new Date().toISOString(); });
    return Response.json({ success: true });
  } catch (e) { return failure(e); }
}
