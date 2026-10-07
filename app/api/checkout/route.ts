import { env } from "cloudflare:workers";
import { products } from "@/lib/products";

type RequestedItem = { id: string; size: string; quantity: number };

function checkoutIsReady() {
  const settings = env as unknown as { STRIPE_SECRET_KEY?: string; DIOKA_STORE_LIVE?: string };
  return Boolean(settings.STRIPE_SECRET_KEY) && settings.DIOKA_STORE_LIVE === "true";
}

export async function GET() {
  return Response.json({ available: checkoutIsReady() });
}

export async function POST(request: Request) {
  const secret = (env as unknown as { STRIPE_SECRET_KEY?: string }).STRIPE_SECRET_KEY;
  if (!secret || !checkoutIsReady()) {
    return Response.json({ error: "Online checkout is being connected. Please try again later." }, { status: 503 });
  }

  let items: RequestedItem[];
  try {
    const body = await request.json() as { items?: RequestedItem[] };
    items = Array.isArray(body.items) ? body.items : [];
  } catch {
    return Response.json({ error: "Please review your bag and try again." }, { status: 400 });
  }
  if (items.length === 0 || items.length > 20) {
    return Response.json({ error: "Please add a piece to your bag." }, { status: 400 });
  }
  const validated = items.map((item) => {
    const product = products.find((p) => p.id === item.id);
    if (!product || !product.sizes.includes(item.size) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) return null;
    return { product, size: item.size, quantity: item.quantity };
  });
  if (validated.some((item) => item === null)) {
    return Response.json({ error: "One of your selections changed. Please review your bag." }, { status: 400 });
  }

  const requestOrigin = new URL(request.url).origin;
  const origin = requestOrigin.startsWith("http://127.0.0.1:") || requestOrigin.startsWith("http://localhost:")
    ? requestOrigin : "https://dioka-atelier.dwilfred058.chatgpt.site";
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", `${origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${origin}/?checkout=cancelled#shop`);
  params.set("billing_address_collection", "required");
  params.set("phone_number_collection[enabled]", "true");
  params.set("shipping_address_collection[allowed_countries][0]", "US");
  params.set("shipping_address_collection[allowed_countries][1]", "GB");
  params.set("shipping_address_collection[allowed_countries][2]", "NG");
  params.set("shipping_address_collection[allowed_countries][3]", "CA");
  params.set("shipping_address_collection[allowed_countries][4]", "AU");
  params.set("customer_creation", "always");
  validated.forEach((item, index) => {
    if (!item) return;
    params.set(`line_items[${index}][price_data][currency]`, "usd");
    params.set(`line_items[${index}][price_data][unit_amount]`, String(item.product.price * 100));
    params.set(`line_items[${index}][price_data][product_data][name]`, `${item.product.name} · ${item.size}`);
    params.set(`line_items[${index}][quantity]`, String(item.quantity));
  });
  try {
    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
    const data = await stripeResponse.json() as { url?: string; error?: { message?: string } };
    if (!stripeResponse.ok || !data.url) {
      console.error("Stripe Checkout rejected session", stripeResponse.status, data.error?.message);
      return Response.json({ error: "Checkout is temporarily unavailable. Please try again later." }, { status: 502 });
    }
    return Response.json({ url: data.url });
  } catch (error) {
    console.error("Stripe Checkout connection failed", error);
    return Response.json({ error: "Checkout is temporarily unavailable. Please try again later." }, { status: 502 });
  }
}
