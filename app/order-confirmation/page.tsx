import Link from "next/link";
import { CheckCircle2, Clock3, ArrowUpRight } from "lucide-react";
import { fulfillPaidSession } from "@/lib/orders";
import { ClearPaidCart } from "@/components/ClearPaidCart";
export const dynamic = "force-dynamic";
export default async function OrderConfirmation({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  let order = null;
  if (process.env.STRIPE_SECRET_KEY && session_id && /^cs_[a-zA-Z0-9_]+$/.test(session_id)) {
    try {
      const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(session_id)}`, { headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` }, cache: "no-store", signal: AbortSignal.timeout(15000) });
      if (response.ok) order = await fulfillPaidSession(await response.json());
    } catch (error) { console.error("Receipt verification failed", error); }
  }
  return <main style={{ minHeight: "100vh", background: "#f7f5ef", color: "#123d32", padding: "40px 6%" }}><header style={{ paddingBottom: 25, borderBottom: "1px solid #dcded3" }}><Link href="/" style={{ color: "inherit", textDecoration: "none", font: "bold 32px Georgia,serif", letterSpacing: 3 }}>DIOKA<sup style={{ fontSize: 10 }}>®</sup></Link></header><section style={{ maxWidth: 700, margin: "70px auto", padding: "40px 25px", border: "1px solid #dcded3", background: "#fcfbf7" }}>
    {order ? <><ClearPaidCart sessionId={order.sessionId}/><CheckCircle2 size={32}/><p style={{ font: "10px Arial", letterSpacing: 2, marginTop: 24 }}>PAYMENT VERIFIED</p><h1 style={{ fontSize: "clamp(40px,6vw,62px)", fontWeight: 400, lineHeight: 1.05, margin: "15px 0 25px" }}>A beautiful choice.<br/><em>Thank you.</em></h1><p style={{ font: "14px/1.8 Arial", color: "#66775f" }}>Your payment is confirmed and your order has been saved. Our team will update its progress as your pieces are prepared.</p><dl style={{ font: "13px/2 Arial", overflowWrap: "anywhere" }}><dt>Order reference</dt><dd style={{ margin: "0 0 20px" }}>{order.id}</dd><dt>Total paid</dt><dd style={{ margin: "0 0 20px" }}>{new Intl.NumberFormat("en", { style: "currency", currency: "USD" }).format(order.total)}</dd><dt>Current status</dt><dd style={{ margin: 0 }}>{order.status}</dd></dl></> : <><Clock3 size={32}/><h1 style={{ fontSize: 48, fontWeight: 400, lineHeight: 1.1 }}>We are checking<br/><em>your payment.</em></h1><p style={{ font: "14px/1.8 Arial" }}>A payment has not been verified on this page. If you just completed checkout, refresh shortly. Your bag stays available until payment is confirmed. Contact our team if you need help.</p></>}
    <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 20, marginTop: 35, padding: "15px 22px", color: "#fff", background: "#123d32", textDecoration: "none", font: "12px Arial" }}>Return to the collection <ArrowUpRight size={16}/></Link>
  </section></main>;
}
