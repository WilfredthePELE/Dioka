import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { assertOrigin, bodyJson, failure, HttpError, limit } from "@/lib/http";
import { getUserFromSession } from "@/lib/auth-storage";
import { validateSelections, type CheckoutRecord } from "@/lib/orders";
import { mutateState } from "@/lib/persistence";
import { reserveInventory, settleInventory } from "@/lib/admin";
const ready = () => Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET && process.env.DIOKA_SITE_URL && process.env.DIOKA_STORE_LIVE === "true");
export async function GET() { return Response.json({ available: ready() }); }
export async function POST(request: Request) {
  let reservationId: string | undefined;
  try {
    assertOrigin(request); await limit(request, "checkout", 15);
    if (!ready()) throw new HttpError(503, "Online payments are not available yet. Please contact our team.");
    const items = await validateSelections(await bodyJson(request));
    reservationId = await reserveInventory(items);
    const origin = new URL(process.env.DIOKA_SITE_URL!).origin;
    const user = await getUserFromSession((await cookies()).get("dioka_token")?.value);
    const params = new URLSearchParams({ mode: "payment", success_url: `${origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${origin}/cart?checkout=cancelled`, billing_address_collection: "required", "phone_number_collection[enabled]": "true" });
    params.set("expires_at", String(Math.floor(Date.now() / 1000) + 1800));
    params.set("metadata[dioka_reservation]", reservationId);
    params.set("payment_method_types[0]", "card");
    if (user) { params.set("customer_email", user.email); params.set("client_reference_id", user.id); }
    ["US", "GB", "NG", "CA", "AU", "IT", "FR", "DE"].forEach((country, i) => params.set(`shipping_address_collection[allowed_countries][${i}]`, country));
    items.forEach((item, i) => {
      params.set(`line_items[${i}][price_data][currency]`, "usd"); params.set(`line_items[${i}][price_data][unit_amount]`, String(Math.round(item.price * 100)));
      params.set(`line_items[${i}][price_data][product_data][name]`, `${item.name} · ${item.size}`); params.set(`line_items[${i}][quantity]`, String(item.quantity));
      const details = [item.color, item.leather, item.shape, item.monogram ? `Monogram: ${item.monogram}` : ""].filter(Boolean).join(" · ");
      if (details) params.set(`line_items[${i}][price_data][product_data][description]`, details);
    });
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded", "Idempotency-Key": randomUUID() }, body: params, signal: AbortSignal.timeout(20000) });
    const session = await response.json(); if (!response.ok || !session.id || !session.url) throw new HttpError(502, "Payment checkout is temporarily unavailable.");
    const record: CheckoutRecord = { sessionId: session.id, reservationId, userId: user?.id || null, items, total: items.reduce((sum, i) => sum + Math.round(i.price * 100) * i.quantity, 0) / 100, createdAt: new Date().toISOString() };
    await mutateState(`checkout:${session.id}`, {} as CheckoutRecord, saved => Object.assign(saved, record));
    return Response.json({ url: session.url, sessionId: session.id });
  } catch (e) {
    if (reservationId) try { await settleInventory(reservationId, false); } catch (releaseError) { console.error("Could not release inventory reservation", releaseError); }
    return failure(e);
  }
}
