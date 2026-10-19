"use client";
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <main style={{ minHeight: "80vh", display: "grid", placeItems: "center", padding: 30, background: "#f7f5ef", color: "#123d32" }}><section style={{ maxWidth: 450 }}><p style={{ font: "10px Arial", letterSpacing: 2 }}>DIOKA ATELIER</p><h1 style={{ fontFamily: "Georgia,serif", fontSize: 46, fontWeight: 400 }}>A moment, please.</h1><p style={{ font: "14px/1.8 Arial" }}>We could not open this page. Your saved information has not been removed. Please try again.</p><button onClick={reset} style={{ padding: "14px 22px", background: "#123d32", color: "#fff", border: 0, cursor: "pointer", marginTop: 20 }}>Try again</button></section></main>;
}
