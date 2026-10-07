import Link from "next/link";
import { env } from "cloudflare:workers";

export default async function OrderConfirmation({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  const secret = (env as unknown as { STRIPE_SECRET_KEY?: string }).STRIPE_SECRET_KEY;
  let paid = false;
  if (secret && session_id?.startsWith("cs_")) {
    try {
      const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(session_id)}`, {
        headers: { Authorization: `Bearer ${secret}` },
        cache: "no-store",
      });
      if (response.ok) {
        const session = await response.json() as { payment_status?: string };
        paid = session.payment_status === "paid";
      }
    } catch (error) { console.error("Could not verify checkout session", error); }
  }
  return <main className="confirmation-page"><Link className="wordmark" href="/">DIOKA<span>®</span></Link><div className="confirmation-panel"><p className="eyebrow">DIOKA / ORDER STATUS</p><h1>{paid ? "THANK YOU FOR YOUR ORDER." : "WE COULDN’T VERIFY YOUR ORDER."}</h1><p>{paid ? "Your payment was received. Keep your confirmation email for the order details." : "Please check your payment confirmation before placing another order. If you were charged, contact the store with your receipt."}</p><Link className="dark-button" href="/">Return to the edit</Link></div></main>;
}
