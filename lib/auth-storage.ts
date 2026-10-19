import crypto from "node:crypto";
import { promisify } from "node:util";
import { readState, mutateState } from "@/lib/persistence";
import { z } from "zod";
const scrypt = promisify(crypto.scrypt);
export interface StoredCartItem { id: string; size: string; quantity: number; addedAt?: string; color?: string; leather?: string; shape?: string; monogram?: string; itemKey?: string }
export interface UserOrder { orderId: string; items: StoredCartItem[]; subtotal: number; total: number; currency: string; shippingAddress?: UserAccount["shippingAddress"]; status: "Confirmed" | "Crafting" | "Dispatched" | "Delivered"; trackingCode: string; createdAt: string }
export interface UserAccount {
  id: string; name: string; email: string; passwordHash: string; salt: string; tier: string;
  cart: StoredCartItem[]; wishlist: string[]; orders: UserOrder[];
  shippingAddress?: { fullName?: string; street?: string; city?: string; country?: string; postalCode?: string; phone?: string };
  createdAt: string; updatedAt: string;
}
export interface DatabaseStructure { users: Record<string, UserAccount>; sessions: Record<string, { userId: string; expiresAt: number }>; processedPayments?: Record<string, boolean> }
const empty: DatabaseStructure = { users: {}, sessions: {}, processedPayments: {} };
export const cartSchema = z.array(z.object({ id: z.string().min(1).max(100), size: z.string().min(1).max(100), quantity: z.number().int().min(1).max(10), addedAt: z.string().max(100).optional(), color: z.string().max(100).optional(), leather: z.string().max(100).optional(), shape: z.string().max(100).optional(), monogram: z.string().max(3).optional(), itemKey: z.string().max(500).optional() })).max(50);
export async function hashPassword(password: string, salt: string) { return (await scrypt(password, salt, 64) as Buffer).toString("hex"); }
export async function verifyPassword(password: string, user: UserAccount) {
  const expected = Buffer.from(user.passwordHash, "hex");
  const actual = Buffer.from(await hashPassword(password, user.salt), "hex");
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}
export async function findUserByEmail(email: string) { return (await readState("accounts", empty)).users[email.trim().toLowerCase()] ?? null; }
export async function findUserById(id: string) { return Object.values((await readState("accounts", empty)).users).find(u => u.id === id) ?? null; }
export async function createUser(params: { name: string; email: string; password: string; initialCart?: StoredCartItem[] }) {
  const email = params.email.trim().toLowerCase();
  const salt = crypto.randomBytes(24).toString("hex");
  const passwordHash = await hashPassword(params.password, salt);
  const now = new Date().toISOString();
  const user: UserAccount = { id: crypto.randomUUID(), name: params.name.trim(), email, salt, passwordHash, tier: "Dioka Atelier Member", cart: cartSchema.parse(params.initialCart || []), wishlist: [], orders: [], createdAt: now, updatedAt: now };
  return mutateState("accounts", empty, db => {
    if (db.users[email]) throw new Error("An account with this email already exists.");
    db.users[email] = user; return user;
  });
}
const sessionKey = (token: string) => crypto.createHash("sha256").update(token).digest("hex");
export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  await mutateState("accounts", empty, db => {
    const now = Date.now();
    for (const key of Object.keys(db.sessions)) if (db.sessions[key].expiresAt < now) delete db.sessions[key];
    db.sessions[sessionKey(token)] = { userId, expiresAt: now + 7 * 86400000 };
  }); return token;
}
export async function getUserFromSession(token?: string | null) {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const db = await readState("accounts", empty);
  const session = db.sessions[sessionKey(token)];
  if (!session || session.expiresAt <= Date.now()) return null;
  return Object.values(db.users).find(u => u.id === session.userId) ?? null;
}
export async function deleteSession(token: string) { await mutateState("accounts", empty, db => { delete db.sessions[sessionKey(token)]; }); }
export async function updateUserCart(userId: string, cart: StoredCartItem[]) {
  const items = cartSchema.parse(cart);
  return mutateState("accounts", empty, db => {
    const user = Object.values(db.users).find(u => u.id === userId); if (!user) throw new Error("User not found.");
    user.cart = items; user.updatedAt = new Date().toISOString(); return items;
  });
}
export async function applyPurchaseToCart(userId: string, purchased: StoredCartItem[], sessionId: string) {
  await mutateState("accounts", empty, db => {
    db.processedPayments ||= {};
    if (db.processedPayments[sessionId]) return;
    const user = Object.values(db.users).find(u => u.id === userId);
    if (user) user.cart = user.cart.flatMap(item => {
      const count = purchased.filter(p => p.id === item.id && p.size === item.size && (p.color || "") === (item.color || "") && (p.leather || "") === (item.leather || "") && (p.shape || "") === (item.shape || "") && (p.monogram || "") === (item.monogram || "")).reduce((sum, p) => sum + p.quantity, 0);
      return item.quantity > count ? [{ ...item, quantity: item.quantity - count }] : [];
    });
    db.processedPayments[sessionId] = true;
  });
}
export async function updateUserProfile(userId: string, updates: { name?: string; shippingAddress?: UserAccount["shippingAddress"] }) {
  return mutateState("accounts", empty, db => {
    const user = Object.values(db.users).find(u => u.id === userId); if (!user) throw new Error("User not found.");
    if (updates.name) user.name = updates.name.trim(); if (updates.shippingAddress) user.shippingAddress = updates.shippingAddress;
    user.updatedAt = new Date().toISOString(); return user;
  });
}
export async function recordUserOrder(userId: string, orderData: Omit<UserOrder, "orderId" | "createdAt" | "status" | "trackingCode">) {
  return mutateState("accounts", empty, db => {
    const user = Object.values(db.users).find(u => u.id === userId); if (!user) throw new Error("User not found.");
    const order: UserOrder = { ...orderData, orderId: `DK-${crypto.randomUUID()}`, trackingCode: "", status: "Confirmed", createdAt: new Date().toISOString() };
    user.orders.unshift(order); user.cart = []; return order;
  });
}
