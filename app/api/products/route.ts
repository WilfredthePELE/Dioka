import { adminListProducts, adminUpsertProduct, adminDeleteProduct, adminUpdatePriceAndQuantity } from "@/lib/admin";
import { assertOrigin, bodyJson, failure, requireAdmin } from "@/lib/http";
import { ZodError } from "zod";
import { publicJson, invalidatePublicCache } from "@/lib/public-cache";
export const dynamic = "force-dynamic";
export async function GET(request:Request) { try { return await publicJson(request,"products",async()=>({products:await adminListProducts()})); } catch(e){return failure(e);} }
async function write(request: Request, method: string) {
  try {
    assertOrigin(request); await requireAdmin();
    if (method === "DELETE") {
      const id = new URL(request.url).searchParams.get("id");
      if (!id) return Response.json({ error: "Product ID required." }, { status: 400 });
      await adminDeleteProduct(id);
    } else {
      const data = await bodyJson(request);
      if (method === "POST") await adminUpsertProduct(data);
      else if (!await adminUpdatePriceAndQuantity(data.id, data.price, data.stockQuantity, data.version)) return Response.json({ error: "Product not found." }, { status: 404 });
    }
    invalidatePublicCache();
    return Response.json({ success: true, products: await adminListProducts() });
  } catch (e) {
    if (e instanceof ZodError) return Response.json({ error: e.issues[0]?.message || "Invalid product." }, { status: 400 });
    return failure(e);
  }
}
export const POST = (r: Request) => write(r, "POST");
export const PATCH = (r: Request) => write(r, "PATCH");
export const DELETE = (r: Request) => write(r, "DELETE");
