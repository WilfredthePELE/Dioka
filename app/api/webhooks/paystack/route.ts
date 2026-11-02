import { createHmac, timingSafeEqual } from "node:crypto";
import { verifyAndFulfillPaystack } from "@/lib/paystack";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return Response.json({ error: "Webhook unavailable." }, { status: 503 });
  const raw = await request.text();
  if (Buffer.byteLength(raw) > 1_048_576) return new Response(null, { status: 413 });
  const supplied = request.headers.get("x-paystack-signature") || "";
  const expected = createHmac("sha512", secret).update(raw).digest();
  let actual: Buffer;
  try { actual = Buffer.from(supplied, "hex"); } catch { return Response.json({ error: "Invalid signature." }, { status: 400 }); }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return Response.json({ error: "Invalid signature." }, { status: 400 });
  try {
    const event = JSON.parse(raw) as { event?: string; data?: { reference?: string } };
    if (event.event === "charge.success" && event.data?.reference) await verifyAndFulfillPaystack(event.data.reference);
    return Response.json({ received: true });
  } catch (error) {
    console.error("Paystack fulfillment failed", error);
    return Response.json({ error: "Fulfillment failed. Paystack will retry this event." }, { status: 500 });
  }
}
