import {
  adminListProducts,
  adminGetProduct,
  adminUpsertProduct,
  adminDeleteProduct,
  type AdminProduct,
} from "@/lib/admin";
import type { Product } from "@/lib/products";

export type { AdminProduct };

export async function getProductsBridge(): Promise<Product[] | null> {
  const list = await adminListProducts();
  return list.length > 0 ? list : null;
}

export async function getProductBridge(id: string): Promise<Product | null> {
  return adminGetProduct(id);
}

export {
  adminListProducts,
  adminGetProduct,
  adminUpsertProduct,
  adminDeleteProduct,
};
