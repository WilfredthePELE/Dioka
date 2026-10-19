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
      const response = await fetch("/api/auth/google", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ returnTo: admin ? "/admin" : "/", cart: isAuthenticated || admin ? [] : cart, connect }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to open Google sign-in.");
      window.location.assign(data.url);
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again."); setBusy(false); }
  }
  return <div style={{ margin: "18px 0" }}><button type="button" disabled={!enabled || busy} onClick={begin} style={{ width: "100%", minHeight: 44, border: "1px solid #b8c5bc", background: "#fff", color: "#123d32", padding: "12px 18px", borderRadius: 4, cursor: enabled ? "pointer" : "not-allowed", fontSize: 14, fontWeight: 600, opacity: enabled ? 1 : .65 }}>{busy ? "Opening Google…" : connect ? "Connect Google" : "Continue with Google"}</button>{ready && !enabled && <p style={{ fontSize: 12, marginTop: 8, color: "#5e7368" }}>Google sign-in will be available once the store owner connects Google.</p>}{error && <p role="alert" style={{ color: "#991b1b", fontSize: 13 }}>{error}</p>}</div>;
}
