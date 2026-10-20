import { readState, mutateState, atomicStates, listStates } from "@/lib/persistence";
import { adminListProducts, adminGetProduct, settleInventory } from "@/lib/admin";
import { HttpError } from "@/lib/http";
import { z } from "zod";
import { cartSchema, applyPurchaseToCart, type StoredCartItem } from "@/lib/auth-storage";
export const checkoutSchema = z.object({ items: cartSchema.min(1).max(20) });
export interface StoreOrder { id: string; sessionId: string; userId: string | null; email: string; name: string; total: number; currency: string; paymentStatus: "paid"; status: "Confirmed" | "Crafting" | "Dispatched" | "Delivered"; trackingCode: string; items: (StoredCartItem & { name: string; price: number })[]; createdAt: string; shippingAddress: unknown }
export interface CheckoutRecord { sessionId: string; reservationId: string; userId: string | null; items: StoreOrder["items"]; total: number; createdAt: string }
export async function listOrders(userId?:string,before?:string){return Object.fromEntries((await listStates<StoreOrder>("order:",{userId,before,limit:100})).map(row=>[row.value.sessionId,row.value]));}
export function changeOrder<R>(id:string,change:(order:StoreOrder)=>R){return mutateState<StoreOrder|null,R>("order:"+id,null,order=>{if(!order)throw new Error("Order not found.");return change(order);});}
export async function validateSelections(input: unknown) {
  const parsed = checkoutSchema.safeParse(input); if (!parsed.success) throw new HttpError(400, "Please review the items in your bag.");
  const catalog = await Promise.all([...new Set(parsed.data.items.map(item=>item.id))].map(id=>adminGetProduct(id)));
  const quantities = new Map<string, number>();
  const selected = parsed.data.items.map(item => {
    const product = catalog.find(p => p?.id === item.id);
    const total = (quantities.get(item.id) || 0) + item.quantity; quantities.set(item.id, total);
    if (!product || !product.sizes.includes(item.size) || !product.inStock || (product.stockQuantity ?? 0) < total) throw new HttpError(400, "A selection is unavailable. Please review your bag.");
    return { ...item, name: product.name, price: product.price };
  }); return selected;
}
export async function fulfillPaidSession(session: { id: string; payment_status?: string; amount_total?: number; currency?: string; customer_details?: { email?: string; name?: string; address?: unknown }; shipping_details?: unknown; collected_information?: { shipping_details?: unknown } }) {
  if (session.payment_status !== "paid") return null;
  const record = await readState<CheckoutRecord | null>(`checkout:${session.id}`, null);
  if (!record || session.currency !== "usd" || session.amount_total !== Math.round(record.total * 100)) throw new Error("Payment does not match the stored checkout.");
  await settleInventory(record.reservationId, true);
  const key="order:"+session.id;
  const result = await atomicStates({[key]:null}, rows => {
    if (rows[key]) return rows[key] as StoreOrder;
    const order: StoreOrder = { id: `DK-${session.id.slice(3)}`, sessionId: session.id, userId: record.userId, name: session.customer_details?.name || "Customer", email: session.customer_details?.email || "", total: record.total, currency: "USD", paymentStatus: "paid", status: "Confirmed", trackingCode: "", items: record.items, createdAt: new Date().toISOString(), shippingAddress: session.collected_information?.shipping_details || session.shipping_details || session.customer_details?.address || null };
    rows[key] = order; return order;
  });
  if (record.userId) await applyPurchaseToCart(record.userId, record.items, session.id);
  return result;
}
