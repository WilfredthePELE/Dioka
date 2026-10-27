"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Eye, EyeOff, LogOut, Package, ShoppingBag, ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { GoogleSignIn } from "@/components/GoogleSignIn";
import { CmsText } from "@/components/SiteControls";
import "./account-page.css";

export function AccountPage({ mode = "login" }: { mode?: "login" | "register" | "profile" }) {
  const router = useRouter();
  const { user, authLoading, isAuthenticated, login, register, logout, cartCount, subtotal, formatPrice } = useStore();
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [name, setName] = useState("");
  const [visible, setVisible] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const joining = mode === "register";
  useEffect(() => {
    if (!authLoading && isAuthenticated && mode !== "profile") router.replace("/account");
    if (!authLoading && !isAuthenticated && mode === "profile") router.replace("/sign-in");
  }, [authLoading, isAuthenticated, mode, router]);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError("");
    try {
      const result = joining ? await register(name, email, password) : await login(email, password);
      if (!result.success) setError(result.error || "We couldn’t sign you in. Please try again.");
      else { setPassword(""); router.replace("/account"); }
    } finally { setBusy(false); }
  }
  return <main className="dioka-account-page">
    <section className="dioka-account-story" aria-label="Dioka atelier">
      <Link className="dioka-account-wordmark" href="/" aria-label="Dioka home">DIOKA</Link>
      <div className="dioka-account-portrait"><Image src="/dioka-white-studio-shoemaker.webp" alt="A silver-haired shoemaker carefully stitching a cognac leather shoe in a white studio" fill sizes="(max-width: 800px) 100vw, 48vw" priority/></div>
      <div className="dioka-account-story-copy"><span><CmsText field="account-story-label" fallback="A PERSONAL CONNECTION"/></span><h2><CmsText field="account-story-title" fallback="Considered craft. A place of your own."/></h2><p><CmsText field="account-story-copy" fallback="Your favourite pieces, your saved bag and every step of your order. All together, at your atelier."/></p></div>
      <span className="dioka-account-edition" aria-hidden="true">DIOKA ATELIER / EVERY DETAIL, CONSIDERED</span>
    </section>
    <section className="dioka-account-main" aria-label="Your Dioka account">
      <header><Link href="/" className="dioka-account-back"><ArrowLeft size={15}/> Back to the collection</Link><span>YOUR DIOKA</span></header>
      <div className="dioka-account-form-wrap">
        {authLoading ? <div className="dioka-account-loading" role="status">Opening your atelier…</div> : isAuthenticated && user ? <>
          <span className="dioka-account-eyebrow">YOUR PRIVATE ATELIER</span><h1>At home,<br/><em>{user.name.split(" ")[0]}.</em></h1><p className="dioka-account-intro">{user.email}</p>
          <div className="dioka-account-summary"><ShoppingBag size={22}/><div><strong>Your saved bag</strong><p>{cartCount} {cartCount===1?"piece":"pieces"} · {formatPrice(subtotal)}</p></div><Link href="/cart" aria-label="Open your saved bag"><ArrowUpRight size={22}/></Link></div>
          <div className="dioka-account-orders"><h2><Package size={18}/> Your orders</h2>{user.orders?.length ? user.orders.map(order=><article key={order.orderId}><div><strong>{order.orderId}</strong><p>{new Date(order.createdAt).toLocaleDateString()} · {formatPrice(order.total)}</p>{order.trackingCode&&<small>Tracking: {order.trackingCode}</small>}</div><span>{order.status}</span></article>):<p>Your purchases will appear here once payment is verified.</p>}</div>
          {user.googleConnected?<p className="dioka-account-connected"><ShieldCheck size={16}/> Google is connected to your account.</p>:<GoogleSignIn connect/>}
          {user.administrator&&<Link className="dioka-account-owner" href="/admin">Open website administration <ArrowUpRight size={16}/></Link>}
          <button className="dioka-account-signout" disabled={busy} onClick={async()=>{setBusy(true);await logout();router.replace("/sign-in");setBusy(false);}}><LogOut size={16}/> Sign out</button>
        </>:<>
          <span className="dioka-account-eyebrow"><CmsText field="account-welcome-label" fallback="THE ATELIER IS YOURS"/></span>
          <h1>{joining?<CmsText field="account-join-title" fallback="Make yourself at home."/>:<CmsText field="account-login-title" fallback="Welcome back."/>}</h1>
          <p className="dioka-account-intro">{joining?<CmsText field="account-join-copy" fallback="A little closer to the things you love. Create your personal Dioka account."/>:<CmsText field="account-login-copy" fallback="Good to see you again. Your collection is right where you left it."/>}</p>
          <GoogleSignIn/>
          <div className="dioka-account-divider"><span>OR CONTINUE WITH EMAIL</span></div>
          <form onSubmit={submit} className="dioka-account-form">
            {joining&&<label htmlFor="account-name">Full name<input id="account-name" name="name" autoComplete="name" required maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></label>}
            <label htmlFor="account-email">Email address<input id="account-email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label>
            <label htmlFor="account-password">{joining?"Create a password":"Password"}<span className="dioka-account-password"><input id="account-password" aria-label={joining?"Create a password":"Password"} name="password" type={visible?"text":"password"} autoComplete={joining?"new-password":"current-password"} required minLength={joining?12:undefined} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} placeholder={joining?"At least 12 characters":"Enter your password"}/><button type="button" aria-label={visible?"Hide password":"Show password"} aria-pressed={visible} onClick={()=>setVisible(v=>!v)}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></span></label>
            {error&&<p role="alert" className="dioka-account-error">{error}</p>}
            <button className="dioka-account-submit" disabled={busy} type="submit">{busy?"Just a moment…":joining?"Create my account":"Sign in"}<ArrowUpRight size={18}/></button>
          </form>
          <p className="dioka-account-switch">{joining?"Already part of the atelier?":"New to Dioka?"} <Link href={joining?"/sign-in":"/join"}>{joining?"Sign in":"Create an account"}</Link></p>
          <p className="dioka-account-reassurance"><ShieldCheck size={15}/> Your bag and order history stay with your account.</p>
        </>}
      </div>
      <footer><span>© {new Date().getFullYear()} DIOKA</span><a href="mailto:contactus@diokacraft.com">A little help? Contact us <ArrowUpRight size={13}/></a></footer>
    </section>
  </main>;
}
