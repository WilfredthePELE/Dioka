import { adminListProducts, adminGetProduct, adminUpsertProduct, adminDeleteProduct } from "@/lib/admin";

export default async function AdminPage() {
  const items = await adminListProducts();

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "40px 20px", fontFamily: "Arial, sans-serif", color: "#171713" }}>
      <h1 style={{ fontFamily: "Impact, Arial Narrow, sans-serif", fontSize: 48, margin: "0 0 8px" }}>DIOKA / ADMIN</h1>
      <p style={{ color: "#666", marginBottom: 32 }}>Manage products for the storefront. Changes reflect live on the site via the bridge.</p>

      <section style={{ marginBottom: 48, padding: 20, background: "#f7f8f5", borderRadius: 6 }}>
        <h2 style={{ fontFamily: "Impact, Arial Narrow, sans-serif", fontSize: 24, marginBottom: 12 }}>Add Product</h2>
        <ProductForm existing={null} />
      </section>

      <section>
        <h2 style={{ fontFamily: "Impact, Arial Narrow, sans-serif", fontSize: 24, marginBottom: 12 }}>Products ({items.length})</h2>
        {items.length === 0 ? (
          <p style={{ color: "#888" }}>No products yet. Add one above.</p>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {items.map((p) => (
              <div key={p.id} style={{ border: "1px solid #bfbab0", padding: 16, borderRadius: 6, background: "#fff" }}>
                <div style={{ display: "flex", gap: 16, alignItems: "start" }}>
                  <img src={p.image} alt={p.name} style={{ width: 80, height: 100, objectFit: "cover", background: "#d4c2aa" }} />
                  <div style={{ flex: 1 }}>
                    <strong>{p.name}</strong> · {p.category} · {formatPrice(p.price)}<br />
                    <span style={{ color: "#67645e", fontSize: 13 }}>{p.color} · {p.sizes.join(", ")}</span>
                    {p.description ? <p style={{ fontSize: 13, color: "#514f49", margin: "6px 0" }}>{p.description}</p> : null}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <ProductForm existing={p} />
                    <form action={async () => { "use server"; await adminDeleteProduct(p.id); }}>
                      <button type="submit" style={{ background: "#a32824", color: "#fff", border: 0, padding: "8px 12px", cursor: "pointer", borderRadius: 4, fontFamily: "Impact, Arial Narrow, sans-serif" }}>Delete</button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price);
}

function ProductForm({ existing }: { existing: null | Awaited<ReturnType<typeof adminGetProduct>> }) {
  return (
    <form action={async (formData) => {
      "use server";
      const id = existing?.id ?? `product-${Date.now()}`;
      await adminUpsertProduct({
        id,
        name: String(formData.get("name") ?? existing?.name ?? ""),
        category: String(formData.get("category") ?? existing?.category ?? "Bags"),
        price: Number(formData.get("price") ?? existing?.price ?? 0),
        image: String(formData.get("image") ?? existing?.image ?? ""),
        position: String(formData.get("position") ?? existing?.position ?? "center center"),
        sizes: String(formData.get("sizes") ?? existing?.sizes?.join(", ") ?? "One size").split(",").map((s: string) => s.trim()).filter(Boolean),
        color: String(formData.get("color") ?? existing?.color ?? ""),
        description: String(formData.get("description") ?? existing?.description ?? ""),
      });
    }} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "end" }}>
      <input name="name" defaultValue={existing?.name ?? ""} placeholder="Name" required style={{ padding: 8, border: "1px solid #bfbab0", borderRadius: 4 }} />
      <select name="category" defaultValue={existing?.category ?? "Bags"} style={{ padding: 8, border: "1px solid #bfbab0", borderRadius: 4 }}>
        <option value="Bags">Bags</option>
        <option value="Footwear">Footwear</option>
        <option value="Jackets">Jackets</option>
      </select>
      <input name="price" type="number" defaultValue={existing?.price ?? ""} placeholder="Price (USD)" required style={{ padding: 8, border: "1px solid #bfbab0", borderRadius: 4, width: 110 }} />
      <input name="image" defaultValue={existing?.image ?? ""} placeholder="Image path" style={{ padding: 8, border: "1px solid #bfbab0", borderRadius: 4, width: 160 }} />
      <input name="color" defaultValue={existing?.color ?? ""} placeholder="Color" style={{ padding: 8, border: "1px solid #bfbab0", borderRadius: 4 }} />
      <input name="sizes" defaultValue={existing?.sizes?.join(", ") ?? ""} placeholder="Sizes (comma sep)" style={{ padding: 8, border: "1px solid #bfbab0", borderRadius: 4, width: 180 }} />
      <input name="position" defaultValue={existing?.position ?? "center center"} placeholder="object-position" style={{ padding: 8, border: "1px solid #bfbab0", borderRadius: 4 }} />
      <input name="description" defaultValue={existing?.description ?? ""} placeholder="Description" style={{ padding: 8, border: "1px solid #bfbab0", borderRadius: 4, width: "100%" }} />
      <button type="submit" style={{ background: "#171713", color: "#fff", border: 0, padding: "8px 16px", cursor: "pointer", borderRadius: 4, fontFamily: "Impact, Arial Narrow, sans-serif", letterSpacing: ".06em" }}>
        {existing ? "Save" : "Add Product"}
      </button>
    </form>
  );
}