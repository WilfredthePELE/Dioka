import { assertOrigin, requireAdmin, failure, HttpError } from "@/lib/http";
import { listStates, mutateState } from "@/lib/persistence";
import { fulfillPaidSession, type CheckoutRecord } from "@/lib/orders";
import { settleInventory } from "@/lib/admin";
import { fulfillPaystackTransaction, verifyPaystackTransaction } from "@/lib/paystack";
import type { CheckoutAttempt } from "@/lib/checkout";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    assertOrigin(request);
    await requireAdmin();
    const provider = process.env.DIOKA_PAYMENT_PROVIDER || "stripe";
    if (provider === "paystack") {
      if (!process.env.PAYSTACK_SECRET_KEY) throw new HttpError(503, "Configure Paystack before checking pending payments.");
      const records = (await listStates<CheckoutRecord>("checkout:", { limit: 100 })).filter(({ value }) => value.provider === "paystack").slice(0, 10);
      let paid = 0, released = 0, pending = 0, errors = 0;
      for (const { value: record } of records) {
        try {
          const transaction = await verifyPaystackTransaction(record.sessionId);
          if (transaction.status === "success") { await fulfillPaystackTransaction(transaction); paid++; }
          else if (["failed", "abandoned"].includes(transaction.status)) {
            await settleInventory(record.reservationId, false);
            if (record.attemptKey) await mutateState<CheckoutAttempt | null, void>(record.attemptKey, null, attempt => { if (attempt) attempt.status = "failed"; });
            released++;
          } else pending++;
        } catch { errors++; }
      }
      return Response.json({ paid, released, pending, errors, reviewed: records.length, note: "Paystack status is verified directly. Unknown or pending payments keep their stock reserved." }, { headers: { "Cache-Control": "no-store" } });
    }
    if (provider !== "stripe" || !process.env.STRIPE_SECRET_KEY) throw new HttpError(503, "Configure the selected payment provider before checking pending payments.");
    const records = await listStates<CheckoutRecord>("checkout:", { limit: 10 });
    let paid = 0, released = 0, pending = 0, errors = 0;
    for (const { value: record } of records) {
      try {
        const response = await fetch("https://api.stripe.com/v1/checkout/sessions/" + encodeURIComponent(record.sessionId), { headers: { Authorization: "Bearer " + process.env.STRIPE_SECRET_KEY }, signal: AbortSignal.timeout(5000) });
        if (!response.ok) { errors++; continue; }
        const session = await response.json();
        if (session.payment_status === "paid") { await fulfillPaidSession(session); paid++; }
        else if (session.status === "expired") { await settleInventory(record.reservationId, false); released++; }
        else pending++;
      } catch { errors++; }
    }
    return Response.json({ paid, released, pending, errors, reviewed: records.length, note: "Reviews the latest 10 checkout records. Unknown payments retain their stock until verified." }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return failure(error); }
}
