import Link from "next/link";
import { CheckCircle2, PackageCheck, Truck, ShieldCheck, ArrowRight, Printer } from "lucide-react";

export default async function OrderConfirmation({
  searchParams,
}: {
  searchParams: Promise<{
    session_id?: string;
    order_id?: string;
    name?: string;
    email?: string;
    total?: string;
    items_count?: string;
  }>;
}) {
  const { session_id, order_id, name, email, total, items_count } = await searchParams;
  const secret = process.env.STRIPE_SECRET_KEY;
  let isPaymentVerified = Boolean(order_id);

  if (secret && session_id?.startsWith("cs_")) {
    try {
      const response = await fetch(
        `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(session_id)}`,
        {
          headers: { Authorization: `Bearer ${secret}` },
          cache: "no-store",
        }
      );
      if (response.ok) {
        const session = (await response.json()) as { payment_status?: string };
        isPaymentVerified = session.payment_status === "paid";
      }
    } catch (error) {
      console.error("Could not verify checkout session", error);
    }
  }

  const displayOrderId = order_id || (session_id ? `DIOKA-${session_id.slice(-6).toUpperCase()}` : "DIOKA-849201");
  const customerName = name || "Valued Client";
  const customerEmail = email || "client@dioka-atelier.com";

  return (
    <main className="confirmation-page" style={{ minHeight: "100vh", padding: "40px 6%", background: "#fbfaf7", color: "#171713" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #dcd7ce", paddingBottom: "24px" }}>
        <Link className="wordmark" href="/" style={{ textDecoration: "none", color: "#123d32", fontSize: "36px", fontWeight: "700", letterSpacing: "0.08em" }}>
          DIOKA<span>®</span>
        </Link>
        <span style={{ fontSize: "13px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#5b1f2b", fontWeight: "600" }}>
          Order Receipt & Tracking
        </span>
      </header>

      <div style={{ maxWidth: "840px", margin: "48px auto", background: "#fff", border: "1px solid #dcd7ce", padding: "48px 40px", boxShadow: "0 12px 32px rgba(18, 61, 50, 0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#123d32", marginBottom: "16px" }}>
          <CheckCircle2 size={32} strokeWidth={1.5} color="#123d32" />
          <span style={{ fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: "700" }}>
            Order Confirmed
          </span>
        </div>

        <h1 style={{ fontSize: "clamp(34px, 4.5vw, 52px)", lineHeight: "1.1", margin: "0 0 16px", color: "#123d32", fontWeight: "600" }}>
          Thank you for your order, {customerName}!
        </h1>

        <p style={{ fontSize: "17px", color: "#596f64", lineHeight: "1.6", margin: "0 0 36px" }}>
          We have received your order and our team is getting it packaged for dispatch. A copy of your receipt and real-time tracking details have been sent to <strong>{customerEmail}</strong>.
        </p>

        {/* Order Details Card */}
        <div style={{ background: "#f8f7f3", border: "1px solid #e2ddd4", padding: "28px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "24px", marginBottom: "36px" }}>
          <div>
            <span style={{ display: "block", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#777167", marginBottom: "6px" }}>Order Number</span>
            <strong style={{ fontSize: "16px", color: "#123d32", letterSpacing: "0.05em" }}>{displayOrderId}</strong>
          </div>
          <div>
            <span style={{ display: "block", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#777167", marginBottom: "6px" }}>Shipping Status</span>
            <strong style={{ fontSize: "16px", color: "#5b1f2b" }}>Preparing to Ship</strong>
          </div>
          <div>
            <span style={{ display: "block", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#777167", marginBottom: "6px" }}>Estimated Delivery</span>
            <strong style={{ fontSize: "16px", color: "#123d32" }}>2–4 Business Days</strong>
          </div>
          {total && (
            <div>
              <span style={{ display: "block", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#777167", marginBottom: "6px" }}>Order Total</span>
              <strong style={{ fontSize: "18px", color: "#5b1f2b" }}>{total}</strong>
            </div>
          )}
          {items_count && (
            <div>
              <span style={{ display: "block", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#777167", marginBottom: "6px" }}>Items Ordered</span>
              <strong style={{ fontSize: "16px", color: "#123d32" }}>{items_count} {items_count === "1" ? "Item" : "Items"}</strong>
            </div>
          )}
          <div>
            <span style={{ display: "block", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#777167", marginBottom: "6px" }}>Payment Status</span>
            <strong style={{ fontSize: "16px", color: isPaymentVerified ? "#123d32" : "#5b1f2b" }}>
              {isPaymentVerified ? "Confirmed & Paid" : "Payment Processing"}
            </strong>
          </div>
        </div>

        {/* Steps */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px", marginBottom: "40px" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <PackageCheck size={24} color="#123d32" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <h4 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "600" }}>1. Packaging & Inspection</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#596f64", lineHeight: "1.5" }}>Inspected for quality and placed in a protective dust bag.</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <Truck size={24} color="#123d32" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <h4 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "600" }}>2. Express Courier Dispatch</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#596f64", lineHeight: "1.5" }}>Handed to DHL Express with real-time tracking provided.</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <ShieldCheck size={24} color="#123d32" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <h4 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "600" }}>3. 30-Day Easy Returns</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#596f64", lineHeight: "1.5" }}>Try it on at home. Hassle-free exchanges or full refunds.</p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", borderTop: "1px solid #e2ddd4", paddingTop: "32px" }}>
          <Link
            className="dark-button"
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "18px",
              background: "#123d32",
              color: "#fff",
              padding: "16px 28px",
              textDecoration: "none",
              fontSize: "14px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: "600",
            }}
          >
            Return to Storefront <ArrowRight size={18} />
          </Link>
          <button
            onClick={() => {}}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "none",
              border: "1px solid #123d32",
              color: "#123d32",
              padding: "15px 22px",
              fontSize: "14px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            <Printer size={16} /> Print Receipt
          </button>
        </div>
      </div>
    </main>
  );
}
