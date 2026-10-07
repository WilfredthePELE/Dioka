import { getDb } from "@/db/index";
import { products } from "@/db/schema";
import { desc } from "drizzle-orm";
import type { Category } from "@/lib/products";

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
  return {
    ...p,
    sizes: JSON.parse(p.sizes),
    price: p.price,
  };
}

export async function adminListProducts() {
  const db = getDb();
  const rows = await db.select().from(products).orderBy(desc(products.createdAt));
  return rows.map(toAdmin);
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
    return { upserted: false };
  }
  await db.insert(products).values({ id: input.id, name: input.name, category: input.category, price: input.price, image: input.image, position: input.position, sizes, color: input.color, description: input.description });
  return { upserted: true };
}

export async function adminDeleteProduct(id: string) {
  const db = getDb();
  await db.delete(products).where((p) => p.id === id);
}