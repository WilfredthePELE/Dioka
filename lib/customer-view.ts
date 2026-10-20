import {isAdminEmail} from "@/lib/http";
import { adminListProducts } from "@/lib/admin";
import { listOrders } from "@/lib/orders";
import type { StoredCartItem, UserAccount } from "@/lib/auth-storage";
export async function displayCart(items: StoredCartItem[]) {
  const products = await adminListProducts();
  return items.flatMap(item => { const product = products.find(p => p.id === item.id); return product ? [{ ...item, name: product.name, price: product.price, image: product.image, category: product.category }] : []; });
}
export async function customerView(user: UserAccount) {
  const { passwordHash: _hash, salt: _salt, googleSubject: _googleSubject, supabaseUserId: _supabaseUserId, ...safe } = user;
  const [cart, orders] = await Promise.all([displayCart(user.cart), listOrders(user.id)]);
  return { ...safe, googleConnected:Boolean(user.googleSubject), administrator:isAdminEmail(user.email), cart, orders: Object.values(orders).filter(o => o.userId === user.id).map(o => ({ orderId: o.id, items: o.items, subtotal: o.total, total: o.total, currency: o.currency, status: o.status, trackingCode: o.trackingCode, createdAt: o.createdAt })) };
}
