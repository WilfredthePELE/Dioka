import { getDb } from "@/db/index";
import { products } from "@/db/schema";
import { desc } from "drizzle-orm";
import type { Category, Product } from "@/lib/products";

export type AdminProduct = {
  id: string;
  name: string;
  category: Category;
  price: number;
  image: string;
  position: string;
  sizes: string[];
  color: string;
  description: string;
};

function toAdmin(p: typeof products.$inferSelect): AdminProduct {
  return { ...p, sizes: JSON.parse(p.sizes), price: p.price };
}
function toProduct(p: typeof products.$inferSelect): Product {
  return { ...p, sizes: JSON.parse(p.sizes), price: p.price };
}

export async function getProductsBridge() {
  const db = getDb();
  const rows = await db.select().from(products).orderBy(desc(products.createdAt));
  if (rows.length > 0) return rows.map(toProduct);
  return null;
}

export async function getProductBridge(id: string) {
  const db = getDb();
  const [row] = await db.select().from(products).where((p) => p.id === id).limit(1);
  return row ? toProduct(row) : null;
}

export async function adminListProducts() {
  const db = getDb();
  return (await db.select().from(products).orderBy(desc(products.createdAt))).map(toAdmin);
}

export async function adminGetProduct(id: string) {
  const db = getDb();
  const [row] = await db.select().from(products).where((p) => p.id === id).limit(1);
  return row ? toAdmin(row) : null;
}

export async function adminUpsertProduct(input: AdminProduct) {
  const db = getDb();
  const sizes = JSON.stringify(input.sizes);
  const existing = await adminGetProduct(input.id);
  if (existing) {
    await db.update(products).set({ name: input.name, category: input.category, price: input.price, image: input.image, position: input.position, sizes, color: input.color, description: input.description }).where((p) => p.id === input.id);
    return { upserted: false } as const;
  }
  await db.insert(products).values({ id: input.id, name: input.name, category: input.category, price: input.price, image: input.image, position: input.position, sizes, color: input.color, description: input.description });
  return { upserted: true } as const;
}

export async function adminDeleteProduct(id: string) {
  const db = getDb();
  await db.delete(products).where((p) => p.id === id);
}