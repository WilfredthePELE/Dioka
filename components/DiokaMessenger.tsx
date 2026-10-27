"use client";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, ArrowUpRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store-context";
import type { Conversation } from "@/lib/chat";
import "./atelier-tools.css";
export function DiokaMessenger() {
  const { designerChatOpen: open, setDesignerChatOpen: setOpen } = useStore();
  const pathname = usePathname();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [footerVideoVisible, setFooterVideoVisible] = useState(false);
  const [text, setText] = useState(""); const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const pending = useRef<string | null>(null); const end = useRef<HTMLDivElement>(null); const composing = useRef(false);
  useEffect(() => {
    const handler = () => setOpen(true); window.addEventListener("open-dioka-chat", handler);
    return () => window.removeEventListener("open-dioka-chat", handler);
  }, [setOpen]);
  useEffect(() => {
    const footerVideo = document.querySelector(".footer-video-wrap");
    if (!footerVideo) return;
    const observer = new IntersectionObserver(([entry]) => setFooterVideoVisible(entry.isIntersecting), { threshold: 0.08 });
    observer.observe(footerVideo);
    return () => observer.disconnect();
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    async function refresh() {
      if (document.hidden || composing.current) return;
      try {
        const response = await fetch("/api/chat", { signal: controller.signal, cache: "no-store" });
        const data = await response.json(); if (!response.ok) throw new Error(data.error);
        if (!composing.current) { setConversation(previous => data.conversation && (!previous || data.conversation.updatedAt >= previous.updatedAt) ? data.conversation : previous); setError(""); }
      } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Connection unavailable."); }
    }
    void refresh(); const timer = setInterval(refresh, 4000);
    return () => { controller.abort(); clearInterval(timer); };
  }, [open]);
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [conversation?.messages.length]);
  async function send(event: React.FormEvent) {
    event.preventDefault(); if (busy || !text.trim()) return;
    composing.current = true; setBusy(true); setError(""); pending.current ||= crypto.randomUUID();
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: pending.current, text, name, email }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Message was not sent.");
      setConversation(data.conversation); setText(""); pending.current = null;
    } catch (e) { setError(e instanceof Error ? e.message : "Message was not sent. Please retry."); }
    finally { setBusy(false); composing.current = false; }
  }
  return <>
    {!open && !footerVideoVisible && <button className="atelier-chat-launcher" aria-label="Chat with Dioka" onClick={() => setOpen(true)}><MessageCircle size={20} /> <span>At your service</span><ArrowUpRight size={16} /></button>}
    {open && <aside className="atelier-chat" role="dialog" aria-label="Dioka customer service">
      <header><div><span className="atelier-kicker">DIOKA ATELIER</span><h2>A personal conversation.</h2><p>Customer care · Replies from our team</p></div><button aria-label="Close chat" onClick={() => setOpen(false)}><X size={20}/></button></header>
      <div className="atelier-chat-messages" aria-live="polite" role="log">
        {!conversation && <div className="atelier-chat-welcome"><span>01 / AT YOUR SERVICE</span><h3>Make yourself<br/><em>at home.</em></h3><p>Questions about a piece, sizing or an order? Leave a message for our team.</p></div>}
        {conversation?.messages.map(m => <div className={`atelier-message ${m.sender}`} key={m.id}><small>{m.sender === "client" ? "YOU" : m.sender === "team" ? "DIOKA TEAM" : "AUTOMATIC RECEIPT"}</small><p>{m.text}</p><time dateTime={m.createdAt}>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{m.sender === "client" ? " · Delivered" : ""}</time></div>)}<div ref={end}/>
      </div>
      <form onSubmit={send} className="atelier-chat-form">
        {!conversation && <div className="atelier-contact"><input aria-label="Your name (optional)" placeholder="Your name (optional)" maxLength={100} value={name} onChange={e => setName(e.target.value)}/><input aria-label="Your email (optional)" type="email" placeholder="Email (optional)" value={email} onChange={e => setEmail(e.target.value)}/></div>}
        {error && <p className="atelier-error" role="alert">{error}</p>}
        <div className="atelier-compose"><textarea aria-label="Your message" placeholder="How can we help?" maxLength={4000} required value={text} onChange={e => { setText(e.target.value); pending.current = null; }}/><button disabled={busy || !text.trim()} aria-label="Send message" type="submit">{busy ? "…" : <Send size={18}/>}</button></div>
        <small>Saved securely. Keep this browser to continue your conversation.</small>
      </form>
    </aside>}
  </>;
}
