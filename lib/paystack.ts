import { atomicStates, readState } from "@/lib/persistence";
import { applyPurchaseToCart } from "@/lib/auth-storage";
import { settleInventory } from "@/lib/admin";
import type { CheckoutRecord, StoreOrder } from "@/lib/orders";
import { HttpError } from "@/lib/http";

export type PaystackTransaction = {
  reference: string;
  status: string;
  amount: number;
  currency: string;
  customer?: { email?: string; first_name?: string; last_name?: string };
  metadata?: unknown;
  paid_at?: string | null;
};

export async function verifyPaystackTransaction(reference: string): Promise<PaystackTransaction> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new HttpError(503, "Online payments are not available yet.");
  if (!/^[A-Za-z0-9.=_-]{1,100}$/.test(reference)) throw new HttpError(400, "Invalid payment reference.");
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` }, cache: "no-store", signal: AbortSignal.timeout(12000),
  });
  let payload: { status?: boolean; message?: string; data?: PaystackTransaction };
  try { payload = await response.json(); } catch { throw new Error("Paystack returned an unreadable verification response."); }
  if (!response.ok || payload.status !== true || !payload.data) throw new Error("Paystack could not verify this payment reference.");
  return payload.data;
}

export async function fulfillPaystackTransaction(transaction: PaystackTransaction): Promise<StoreOrder | null> {
  if (transaction.status !== "success") return null;
  const record = await readState<CheckoutRecord | null>(`checkout:${transaction.reference}`, null);
  if (!record || record.provider !== "paystack") throw new Error("No matching Paystack checkout was found.");
  const expectedCurrency = record.currency || "USD";
  if (transaction.reference !== record.sessionId || transaction.currency.toUpperCase() !== expectedCurrency || transaction.amount !== Math.round(record.total * 100)) {
    throw new Error("The Paystack payment amount or currency does not match this order.");
  }

  await settleInventory(record.reservationId, true);
  const key = `order:${transaction.reference}`;
  const result = await atomicStates({ [key]: null }, (rows) => {
    if (rows[key]) return rows[key] as StoreOrder;
    const customerName = [transaction.customer?.first_name, transaction.customer?.last_name].filter(Boolean).join(" ");
    const shippingAddress = record.shippingAddress as { fullName?: string } | undefined;
    const order: StoreOrder = {
      id: `DK-${transaction.reference.replace(/^DK-/, "").slice(0, 40)}`,
      sessionId: transaction.reference,
      userId: record.userId,
      name: customerName || shippingAddress?.fullName || "Customer",
      email: transaction.customer?.email || record.email || "",
      total: record.total,
      currency: expectedCurrency,
      paymentStatus: "paid",
      status: "Confirmed",
      trackingCode: "",
      items: record.items,
      createdAt: transaction.paid_at || new Date().toISOString(),
      shippingAddress: record.shippingAddress || null,
    };
    rows[key] = order;
    return order;
  });
  if (record.userId) await applyPurchaseToCart(record.userId, record.items, transaction.reference);
  return result;
}

export async function verifyAndFulfillPaystack(reference: string): Promise<StoreOrder | null> {
  return fulfillPaystackTransaction(await verifyPaystackTransaction(reference));
}
