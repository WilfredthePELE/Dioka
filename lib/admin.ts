import { products, type Category, type Product } from "@/lib/products";
import { mutateState, readState } from "@/lib/persistence";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { HttpError } from "@/lib/http";
export type { Category };
export type AdminProduct = Product;
const initial: Product[] = products.map(p => ({ ...p, version: 1, stockQuantity: p.stockQuantity ?? 12, inStock: p.inStock ?? true }));
type Reservation = { items: { id: string; quantity: number }[]; expiresAt: number; status: "pending" | "paid" | "released" };
type Catalogue = { products: Product[]; reservations: Record<string, Reservation> };
const initialCatalogue: Catalogue = { products: initial, reservations: {} };
const catalogueKey = "catalogue-v1";
function releaseExpired(state: Catalogue) {
  for (const reservation of Object.values(state.reservations)) {
    if (reservation.status !== "pending" || reservation.expiresAt > Date.now()) continue;
    for (const item of reservation.items) { const p = state.products.find(p => p.id === item.id); if (p) { p.stockQuantity = (p.stockQuantity || 0) + item.quantity; p.inStock = p.stockQuantity > 0; p.version = (p.version || 0) + 1; } }
    reservation.status = "released";
  }
}
export const productSchema = z.object({
  version: z.number().int().min(0).optional(),
  id: z.string().regex(/^[a-z0-9-]+$/).max(100), name: z.string().trim().min(2).max(160),
  category: z.enum(["Bags", "Footwear", "Jackets"]), price: z.number().finite().positive().multipleOf(0.01).max(1000000),
  image: z.string().max(2000).refine(v => /^\/(?!\/)/.test(v) || /^https:\/\//.test(v), "Use a local path or HTTPS image URL"),
  position: z.string().max(60).default("center"), sizes: z.array(z.string().trim().min(1).max(60)).min(1).max(30),
  color: z.string().max(100), description: z.string().trim().min(5).max(5000),
  subtitle: z.string().max(300).optional(), materials: z.string().max(1000).optional(), dimensions: z.string().max(500).optional(), care: z.string().max(2000).optional(),
  details: z.array(z.string().max(1000)).max(30).optional(), bagType: z.enum(["Shoulder Bags", "Crossbody Bags", "Travel & Duffle Bags"]).optional(),
  stockQuantity: z.number().int().min(0).max(1000000), inStock: z.boolean().optional(), rating: z.number().min(0).max(5).optional(), reviews: z.number().int().min(0).optional(),
});
export async function adminListProducts(): Promise<AdminProduct[]> {
  const state = await readState(catalogueKey, initialCatalogue);
  if (Object.values(state.reservations).some(r => r.status === "pending" && r.expiresAt <= Date.now())) return mutateState(catalogueKey, initialCatalogue, fresh => { releaseExpired(fresh); return fresh.products; });
  return state.products;
}
export async function adminGetProduct(id: string) { return (await adminListProducts()).find(p => p.id === id) ?? null; }
export async function adminUpsertProduct(input: AdminProduct) {
  const product = productSchema.parse(input);
  if (product.category === "Bags" && !product.bagType) product.bagType = "Shoulder Bags";
  return mutateState(catalogueKey, initialCatalogue, state => {
    releaseExpired(state); const list = state.products;
    const index = list.findIndex(p => p.id === product.id);
    if (index >= 0 && (product.version ?? 0) !== (list[index].version ?? 0)) throw new HttpError(409, "This piece changed while you were editing. Close the editor and reopen it to load the current stock.");
    const updated = { ...product, version: (index >= 0 ? list[index].version || 0 : 0) + 1, inStock: product.stockQuantity > 0 };
    if (index < 0) list.push(updated); else list[index] = updated;
    return { upserted: index < 0 };
  });
}
export async function adminUpdatePriceAndQuantity(id: string, price: number, stockQuantity: number, version?: number) {
  z.object({ id: z.string().min(1), price: z.number().finite().positive().multipleOf(0.01), stockQuantity: z.number().int().min(0) }).parse({ id, price, stockQuantity });
  return mutateState(catalogueKey, initialCatalogue, state => {
    releaseExpired(state); const list = state.products;
    const product = list.find(p => p.id === id);
    if (!product) return null;
    if ((version ?? 0) !== (product.version ?? 0)) throw new HttpError(409, "This piece changed. Reload before saving.");
    Object.assign(product, { price, stockQuantity, inStock: stockQuantity > 0, version: (product.version || 0) + 1 }); return product;
  });
}
export async function adminDeleteProduct(id: string) { return mutateState(catalogueKey, initialCatalogue, state => {
  releaseExpired(state);
  if (Object.values(state.reservations).some(r => r.status === "pending" && r.items.some(i => i.id === id))) throw new Error("This piece has an active checkout. Try again after it completes or expires.");
  const i = state.products.findIndex(p => p.id === id); if (i >= 0) state.products.splice(i, 1);
}); }
export async function reserveInventory(items: { id: string; quantity: number; price: number }[]) {
  const id = randomUUID();
  await mutateState(catalogueKey, initialCatalogue, state => {
    releaseExpired(state);
    for (const item of items) {
      const product = state.products.find(p => p.id === item.id);
      if (!product || product.price !== item.price || !product.inStock || (product.stockQuantity || 0) < item.quantity) throw new HttpError(400, "A selection changed or sold out. Please review your bag.");
      product.stockQuantity = (product.stockQuantity || 0) - item.quantity; product.inStock = product.stockQuantity > 0;
      product.version = (product.version || 0) + 1;
    }
    // Stripe expires this checkout after 30 minutes; the extra ten minutes allow
    // delayed completion webhooks to arrive before a reservation is released.
    state.reservations[id] = { items: items.map(i => ({ id: i.id, quantity: i.quantity })), expiresAt: Date.now() + 40 * 60000, status: "pending" };
  }); return id;
}
export async function settleInventory(id: string, paid: boolean) {
  await mutateState(catalogueKey, initialCatalogue, state => {
    const reservation = state.reservations[id]; if (!reservation) throw new Error("Reservation not found.");
    if (paid) {
      if (reservation.status === "released") {
        // A delayed but verified payment must still consume the sold inventory.
        for (const item of reservation.items) { const p = state.products.find(p => p.id === item.id); if (p) { p.stockQuantity = Math.max(0, (p.stockQuantity || 0) - item.quantity); p.inStock = p.stockQuantity > 0; p.version = (p.version || 0) + 1; } }
      }
      reservation.status = "paid";
    } else if (reservation.status === "pending") {
      reservation.expiresAt = 0; releaseExpired(state);
    }
  });
}
