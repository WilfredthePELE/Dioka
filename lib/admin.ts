import { products as initialProducts, type Category, type Product } from "@/lib/products";

export type { Category };
export type AdminProduct = Product;

// In-memory product storage for the application
const inMemoryProducts: Map<string, AdminProduct> = new Map(
  initialProducts.map((p) => [
    p.id,
    {
      ...p,
      stockQuantity: p.stockQuantity ?? (p.category === "Jackets" ? 8 : p.category === "Footwear" ? 15 : 12),
      inStock: true,
    },
  ])
);

export async function adminListProducts(): Promise<AdminProduct[]> {
  return Array.from(inMemoryProducts.values());
}

export async function adminGetProduct(id: string): Promise<AdminProduct | null> {
  return inMemoryProducts.get(id) ?? null;
}

export async function adminUpsertProduct(input: AdminProduct) {
  const existing = inMemoryProducts.get(input.id);
  const stockQuantity = Number(input.stockQuantity ?? existing?.stockQuantity ?? 10);
  const updated: AdminProduct = {
    ...existing,
    ...input,
    price: Number(input.price),
    stockQuantity,
    inStock: stockQuantity > 0,
  };
  inMemoryProducts.set(input.id, updated);
  return { upserted: !existing };
}

export async function adminUpdatePriceAndQuantity(id: string, price: number, stockQuantity: number) {
  const existing = inMemoryProducts.get(id);
  if (!existing) return null;
  existing.price = Number(price);
  existing.stockQuantity = Number(stockQuantity);
  existing.inStock = Number(stockQuantity) > 0;
  inMemoryProducts.set(id, { ...existing });
  return existing;
}

export async function adminDeleteProduct(id: string) {
  inMemoryProducts.delete(id);
}
