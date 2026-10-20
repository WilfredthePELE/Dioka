"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store-context";
type Options = { admin?: boolean; connect?: boolean };
export function GoogleSignIn(props: Options) {
  return props.admin ? <GoogleButton {...props} cart={[]} isAuthenticated={false}/> : <CustomerGoogle {...props}/>;
}
function CustomerGoogle(props: Options) {
  const { cart, isAuthenticated } = useStore();
  return <GoogleButton {...props} cart={cart} isAuthenticated={isAuthenticated}/>;
}
function GoogleButton({ admin = false, connect = false, cart, isAuthenticated }: Options & { cart: import("@/lib/auth-storage").StoredCartItem[]; isAuthenticated: boolean }) {
  const [enabled, setEnabled] = useState(false), [ready, setReady] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState("");
  useEffect(() => { let active = true; fetch("/api/auth/google").then(r => r.json()).then(data => { if (active) setEnabled(data.google === true); }).catch(() => {}).finally(() => { if (active) setReady(true); }); return () => { active = false; }; }, []);
  async function begin() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/auth/google", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ returnTo: admin ? "/admin" : "/account", cart: isAuthenticated || admin ? [] : cart, connect }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to open Google sign-in.");
      window.location.assign(data.url);
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again."); setBusy(false); }
  }
  return <div className="dioka-google-wrap" style={{ margin: "18px 0" }}><button className="dioka-google-button" type="button" disabled={!enabled || busy} onClick={begin} style={{ width: "100%", display:"flex", alignItems:"center", justifyContent:"center", gap:12, minHeight: 44, border: "1px solid #b8c5bc", background: "#fff", color: "#123d32", padding: "12px 18px", borderRadius: 4, cursor: enabled ? "pointer" : "not-allowed", fontSize: 14, fontWeight: 600, opacity: enabled ? 1 : .65 }}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M43.6 20.5H42V20H24v8h11.3A12 12 0 1 1 32 14.6l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.4-.4-3.5Z"/><path fill="#34A853" d="m6.3 14.7 6.6 4.8A12 12 0 0 0 24 36c3 0 5.8-1.1 7.9-2.9l6.2 5.2A20 20 0 0 1 4 24c0-3.4.8-6.5 2.3-9.3Z"/><path fill="#FBBC05" d="m12.9 28.5-6.6 5A20 20 0 0 1 6.3 14.7l6.6 4.8a12 12 0 0 0 0 9Z"/><path fill="#EA4335" d="M24 4a20 20 0 0 1 13.7 4.9L32 14.6A12 12 0 0 0 12.9 19.5l-6.6-4.8A20 20 0 0 1 24 4Z"/></svg>{busy ? "Opening Google…" : connect ? "Connect Google" : "Continue with Google"}</button>{ready && !enabled && <p className="dioka-google-note" style={{ fontSize: 12, marginTop: 8, color: "#5e7368" }}>Google sign-in is being connected. You can use your email for now.</p>}{error && <p role="alert" style={{ color: "#991b1b", fontSize: 13 }}>{error}</p>}</div>;
}
