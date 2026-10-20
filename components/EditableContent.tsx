"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import "./atelier-tools.css";
const Context = createContext<SiteContent | null>(null);
export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<SiteContent | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const refresh = async () => { try { const response = await fetch("/api/content", { cache: "no-store", signal: controller.signal }); if (response.ok) setContent((await response.json()).content); } catch { /* Keep the last published content during transient failures. */ } };
    void refresh(); const timer = setInterval(() => { if (!document.hidden) void refresh(); }, 60000);
    return () => { clearInterval(timer); controller.abort(); };
  }, []);
  return <Context.Provider value={content}>{children}</Context.Provider>;
}
export function useSiteContent() { return useContext(Context); }
export function Announcement() { const content = useContext(Context); return content?.announcement ? <div className="atelier-announcement">{content.announcement}</div> : null; }
export function HomeIntroduction() { const content = useContext(Context); return content ? <section className="atelier-home-intro"><span>DIOKA ATELIER / THE COLLECTION</span><h1>{content.headline}</h1><p>{content.introduction}</p></section> : null; }
export function StorePolicies() { const content = useContext(Context); return content ? <section className="atelier-policy"><div><h3>Delivery, considered.</h3><p>{content.shippingPolicy}</p></div><div><h3>A little reassurance.</h3><p>{content.returnsPolicy}</p></div><div><h3>At your service.</h3><a href={`mailto:${content.supportEmail}`}>{content.supportEmail}</a></div></section> : null; }
