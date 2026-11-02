import { cookies } from "next/headers";
import { createHash, randomUUID } from "node:crypto";
import { assertOrigin, bodyJson, failure, HttpError, limit } from "@/lib/http";
import { getUserFromSession } from "@/lib/auth-storage";
import { checkoutSchema, validateSelections, type CheckoutRecord } from "@/lib/orders";
import { readState, atomicStates, mutateState, incrementLimit, remote, setState } from "@/lib/persistence";
import { reserveInventory, settleInventory } from "@/lib/admin";
import { checkoutParameters, type CheckoutAttempt } from "@/lib/checkout";
import { siteOrigin } from "@/lib/site-origin";

function paymentProvider(): "stripe" | "paystack" | null {
  const configured = process.env.DIOKA_PAYMENT_PROVIDER || "stripe";
  return configured === "stripe" || configured === "paystack" ? configured : null;
}
function ready(provider: "stripe" | "paystack" | null) {
  const credentialsReady = provider === "paystack"
    ? Boolean(process.env.PAYSTACK_SECRET_KEY)
    : provider === "stripe" && Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
  return Boolean(provider && credentialsReady && process.env.DIOKA_SITE_URL && process.env.DIOKA_STORE_LIVE === "true" && (process.env.DIOKA_SCALE_MODE !== "true" || (remote && process.env.DIOKA_TRUST_PROXY === "true")));
}

export async function GET() {
  const provider = paymentProvider();
  return Response.json({ available: ready(provider), provider }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  let claim: CheckoutAttempt | undefined, attemptKey = "", providerStarted = false, reserved = false, definitive = false;
  const lease = randomUUID();
  try {
    assertOrigin(request);
    await limit(request, "checkout", 15);
    const provider = paymentProvider();
    if (!provider || !ready(provider)) throw new HttpError(503, "Online payments are not available yet. Please contact our team.");
    const parsed = checkoutSchema.safeParse(await bodyJson(request));
    if (!parsed.success) throw new HttpError(400, "Please review your contact details and bag.");
    const header = request.headers.get("idempotency-key");
    if (header && !/^[a-f0-9-]{36}$/i.test(header)) throw new HttpError(400, "Invalid checkout request identifier.");
    const user = await getUserFromSession((await cookies()).get("dioka_token")?.value);
    const email = user?.email || parsed.data.email || "";
    if (provider === "paystack" && !email) throw new HttpError(400, "Enter a valid email address to continue to Paystack.");
    const fingerprint = createHash("sha256").update(JSON.stringify({ items: parsed.data.items, email, shippingAddress: parsed.data.shippingAddress, provider })).digest("hex");
    attemptKey = "attempt:" + createHash("sha256").update((user?.id || "guest") + ":" + (header || randomUUID())).digest("hex");
    const previous = await readState<CheckoutAttempt | null>(attemptKey, null);
    if (previous?.fingerprint && previous.fingerprint !== fingerprint) { definitive = true; throw new HttpError(409, "Your bag or checkout details changed. Please start a new checkout."); }
    if (previous?.provider && previous.provider !== provider) { definitive = true; throw new HttpError(409, "Payment settings changed. Please start a new checkout."); }
    if (previous?.status === "ready") {
      if (previous.expiresAt < Date.now()) { definitive = true; throw new HttpError(409, "This checkout expired. Please start a new checkout."); }
      return Response.json({ url: previous.url, sessionId: previous.sessionId });
    }
    if (previous?.status === "failed") { definitive = true; throw new HttpError(409, "Please start a new checkout for this bag."); }
    if (previous?.status === "processing" && Date.now() - previous.updatedAt < 40000) throw new HttpError(429, "Your checkout is already being prepared. Please retry shortly.", 2);

    const capacity = Math.max(1, Math.min(1000, Number(process.env.DIOKA_CHECKOUT_RATE || 20)));
    if (!await incrementLimit("limit:checkout-admission:" + Math.floor(Date.now() / 1000), capacity)) throw new HttpError(429, "The atelier is busy. Your bag is safe; please retry shortly.", 2);
    const items = previous?.items || await validateSelections(parsed.data);
    const now = Date.now();
    claim = await atomicStates({ [attemptKey]: null }, rows => {
      const existing = rows[attemptKey] as CheckoutAttempt | null;
      if (existing?.status === "ready") return existing;
      if (existing?.status === "processing" && Date.now() - existing.updatedAt < 40000) throw new HttpError(429, "Your checkout is being prepared. Please retry shortly.", 2);
      const value: CheckoutAttempt = {
        ...(existing || { fingerprint, items, userId: user?.id || null, email, shippingAddress: parsed.data.shippingAddress, provider, reservationId: randomUUID(), createdAt: now, expiresAt: now + 1800000 }),
        status: "processing", lease, updatedAt: now,
      };
      rows[attemptKey] = value;
      return value;
    });
    if (claim.status === "ready") return Response.json({ url: claim.url, sessionId: claim.sessionId });

    await reserveInventory(claim.items, claim.reservationId);
    reserved = true;
    if (provider === "stripe") {
      claim.stripeBody ||= checkoutParameters(claim);
      await mutateState<CheckoutAttempt | null, void>(attemptKey, null, value => { if (value?.lease === lease) value.stripeBody = claim!.stripeBody; });
      providerStarted = true;
      const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST", headers: { Authorization: "Bearer " + process.env.STRIPE_SECRET_KEY, "Content-Type": "application/x-www-form-urlencoded", "Idempotency-Key": attemptKey },
        body: claim.stripeBody, signal: AbortSignal.timeout(20000),
      });
      const session = await response.json();
      if (!response.ok) { definitive = response.status >= 400 && response.status < 500 && response.status !== 409; throw new HttpError(response.status === 429 ? 429 : 502, "Payment checkout is busy. Please retry shortly.", response.status === 429 ? 3 : 0); }
      if (!session.id || !session.url) throw new Error("Payment provider response was incomplete.");
      const record: CheckoutRecord = { sessionId: session.id, provider: "stripe", currency: "USD", attemptKey, reservationId: claim.reservationId, userId: claim.userId, email: claim.email, shippingAddress: claim.shippingAddress, items: claim.items, total: claim.items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0) / 100, createdAt: new Date().toISOString() };
      await setState("checkout:" + session.id, record);
      await mutateState<CheckoutAttempt | null, void>(attemptKey, null, value => { if (value && value.lease === lease) Object.assign(value, { status: "ready", sessionId: session.id, url: session.url, updatedAt: Date.now() }); });
      return Response.json({ url: session.url, sessionId: session.id });
    }

    let paymentBody = claim.paystackBody;
    if (!paymentBody) {
      const reference = "DK-" + randomUUID();
      const total = claim.items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0);
      paymentBody = JSON.stringify({ email: claim.email, amount: String(total), currency: "USD", reference, callback_url: siteOrigin() + "/order-confirmation?provider=paystack", metadata: JSON.stringify({ dioka_reservation: claim.reservationId, customer_name: (claim.shippingAddress as { fullName?: string } | undefined)?.fullName || "" }) });
      claim.paystackBody = paymentBody;
      await mutateState<CheckoutAttempt | null, void>(attemptKey, null, value => { if (value?.lease === lease) { value.paystackBody = paymentBody; value.sessionId = reference; } });
    }
    const paystackRequest = JSON.parse(paymentBody) as { email: string; amount: string; currency: string; reference: string; callback_url: string; metadata: string };
    providerStarted = true;
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST", headers: { Authorization: "Bearer " + process.env.PAYSTACK_SECRET_KEY, "Content-Type": "application/json", "Cache-Control": "no-cache" },
      body: paymentBody, signal: AbortSignal.timeout(20000),
    });
    const initialized = await response.json();
    const duplicateReference = /reference.{0,40}(already|exist|duplicate)/i.test(String(initialized.message || ""));
    if (!response.ok || initialized.status !== true || !initialized.data?.authorization_url || initialized.data.reference !== paystackRequest.reference) {
      definitive = response.status >= 400 && response.status < 500 && !duplicateReference || response.ok && initialized.status === false && !duplicateReference;
      throw new HttpError(response.status === 429 ? 429 : 502, duplicateReference ? "This payment is still being checked. Please retry shortly or contact our team." : "Paystack could not start checkout. Please retry shortly.", response.status === 429 ? 3 : 0);
    }
    const reference = initialized.data.reference as string;
    const total = claim.items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0) / 100;
    const record: CheckoutRecord = { sessionId: reference, provider: "paystack", currency: "USD", attemptKey, reservationId: claim.reservationId, userId: claim.userId, email: claim.email, shippingAddress: claim.shippingAddress, items: claim.items, total, createdAt: new Date().toISOString() };
    await setState("checkout:" + reference, record);
    await mutateState<CheckoutAttempt | null, void>(attemptKey, null, value => { if (value && value.lease === lease) Object.assign(value, { status: "ready", sessionId: reference, url: initialized.data.authorization_url, updatedAt: Date.now() }); });
    return Response.json({ url: initialized.data.authorization_url, sessionId: reference });
  } catch (error) {
    if (claim?.lease === lease) {
      if (reserved && (!providerStarted || definitive)) try { await settleInventory(claim.reservationId, false); } catch (releaseError) { console.error("Reservation release requires reconciliation", releaseError); }
      try { await mutateState<CheckoutAttempt | null, void>(attemptKey, null, value => { if (value?.lease === lease && value.status !== "ready") { value.status = providerStarted && !definitive ? "retry" : "failed"; value.updatedAt = Date.now(); } }); } catch (saveError) { console.error("Checkout recovery needs reconciliation", saveError); }
    }
    const response = failure(error);
    if (definitive || (claim && !providerStarted)) response.headers.set("X-Checkout-Reset", "1");
    return response;
  }
}
