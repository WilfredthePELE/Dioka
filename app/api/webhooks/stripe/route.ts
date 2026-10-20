import { createHmac, timingSafeEqual } from "node:crypto";
import { fulfillPaidSession } from "@/lib/orders";
import { settleInventory } from "@/lib/admin";
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET; if (!secret) return Response.json({ error: "Webhook unavailable." }, { status: 503 });
  const payload = await request.text(); if (Buffer.byteLength(payload) > 1048576) return new Response(null, { status: 413 });
  const fields = (request.headers.get("stripe-signature") || "").split(",");
  const timestamp = fields.find(f => f.startsWith("t="))?.slice(2) || "";
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest();
  const valid = Math.abs(Date.now() / 1000 - Number(timestamp)) < 300 && fields.filter(f => f.startsWith("v1=")).some(f => { const actual = Buffer.from(f.slice(3), "hex"); return actual.length === expected.length && timingSafeEqual(actual, expected); });
  if (!valid) return Response.json({ error: "Invalid signature." }, { status: 400 });
  try {
    const event = JSON.parse(payload);
    if (["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) await fulfillPaidSession(event.data.object);
    if (event.type === "checkout.session.expired" && event.data.object.metadata?.dioka_reservation) await settleInventory(event.data.object.metadata.dioka_reservation, false);
    return Response.json({ received: true });
  } catch (error) { console.error("Stripe fulfillment failed", error); return Response.json({ error: "Fulfillment failed. Retry required." }, { status: 500 }); }
}
