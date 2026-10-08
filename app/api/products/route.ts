import { NextResponse } from "next/server";
import {
  adminListProducts,
  adminUpsertProduct,
  adminUpdatePriceAndQuantity,
  adminDeleteProduct,
  AdminProduct,
} from "@/lib/admin";

export async function GET() {
  const products = await adminListProducts();
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as AdminProduct;
    if (!data.id || !data.name || !data.price) {
      return NextResponse.json({ error: "Missing required product fields" }, { status: 400 });
    }
    const result = await adminUpsertProduct(data);
    const updatedList = await adminListProducts();
    return NextResponse.json({ success: true, result, products: updatedList });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save product" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, price, stockQuantity } = (await request.json()) as {
      id: string;
      price: number;
      stockQuantity: number;
    };
    if (!id || price === undefined || stockQuantity === undefined) {
      return NextResponse.json({ error: "id, price, and stockQuantity are required" }, { status: 400 });
    }
    const updated = await adminUpdatePriceAndQuantity(id, price, stockQuantity);
    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const updatedList = await adminListProducts();
    return NextResponse.json({ success: true, product: updated, products: updatedList });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }
    await adminDeleteProduct(id);
    const updatedList = await adminListProducts();
    return NextResponse.json({ success: true, products: updatedList });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete product" }, { status: 500 });
  }
}
