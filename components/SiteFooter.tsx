"use client";
import { CmsLink, CmsSource, CmsText, CmsVideo } from "@/components/SiteControls";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUp, Mail } from "lucide-react";
import { useSiteContent } from "@/components/EditableContent";
import { useStore } from "@/lib/store-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface InfoModalState {
  title: string;
  category: string;
  content: React.ReactNode;
}

export function SiteFooter() {
  const published = useSiteContent();
  const {
    setOrderTrackingOpen,
    setSizeGuideOpen,
    setAccountModalOpen,
    setAccountModalTab,
    setCurrencyConverterModalOpen,
    isAuthenticated,
    user,
    cartCount,
  } = useStore();

  const [activeInfoModal, setActiveInfoModal] = useState<InfoModalState | null>(null);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <footer className="footer footer-video-bg">
        {/* Background artisan shoemaking video */}
        <div className="footer-video-wrap" aria-hidden="true">
          <CmsVideo
            autoPlay
            loop
            muted
            playsInline
            className="footer-video"
            poster="/dioka-boots-jacket.webp" posterKey="fa6e01e86f8e83dc"
          >
            <CmsSource src="/italian-shoemaker-atelier.mp4" type="video/mp4" srcKey="8e2d454047f8f7dc" />
            <CmsSource src="/italian-shoemaker-atelier.webm" type="video/webm" srcKey="09d32f42dd1311e7" />
            <CmsSource src="/shoemaker-daylight-brown.mp4" type="video/mp4" srcKey="6e3e629de359367d" />
          </CmsVideo>
          <div className="footer-video-overlay" />
        </div>

        {/* Footer Content */}
        <div className="footer-content">
          {/* Top Row: Tagline & Smooth Back to Top */}
          <div className="footer-top">
            <p className="eyebrow" style={{ color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)", margin: 0 }}>
              <CmsText field="221b05e3b78b9bd9" fallback="DIOKA · ARTISAN HANDCRAFTED LEATHER ATELIER"/></p>
            <button
              type="button"
              onClick={scrollToTop}
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                padding: "8px 16px",
                borderRadius: "999px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backdropFilter: "blur(4px)",
                transition: "all .2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
            >
              <span><CmsText field="1abd4da0800771b2" fallback="Back to top"/></span>
              <ArrowUp size={14} />
            </button>
          </div>

          {/* Central Grand Brand Wordmark (Clickable to Home / Top) */}
          <div style={{ textAlign: "center" }}>
            <CmsLink
              href="/"
              className="footer-wordmark"
              style={{ textDecoration: "none", display: "inline-block" }}
              title="Return to Dioka Home" hrefKey="956f5d59122f49bd" titleKey="c2a35277b426bbee"
            >
              <CmsText field="4787fca805353cde" fallback="DIOKA"/></CmsLink>
          </div>

          {/* 4-Column Luxury Navigation Section — Clean Minimalist Typography, No Cluttered Icons */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "36px 28px",
              padding: "36px 0 44px",
              borderTop: "1px solid rgba(255, 255, 255, 0.15)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
              marginBottom: "32px",
            }}
          >
            {/* Column 1: Collections */}
            <div>
              <h4
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "#e8ded1",
                  margin: "0 0 16px",
                }}
              >
                <CmsText field="18180d66951dfa28" fallback="Collections"/></h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                <li>
                  <CmsLink
                    href="/bags"
                    style={{ color: "#fff", textDecoration: "none", fontSize: "13px" }}
                    className="hover:underline" hrefKey="e9cb0d562839465a"
                  >
                    <CmsText field="ce805cd45dee305c" fallback="Leather Bags (Shoulder & Crossbody)"/></CmsLink>
                </li>
                <li>
                  <CmsLink
                    href="/footwear"
                    style={{ color: "#fff", textDecoration: "none", fontSize: "13px" }}
                    className="hover:underline" hrefKey="d0792b4d5300a1cd"
                  >
                    <CmsText field="8680fe4f66619824" fallback="Shoes & Boots (Goodyear-Welted)"/></CmsLink>
                </li>
                <li>
                  <CmsLink
                    href="/jackets"
                    style={{ color: "#fff", textDecoration: "none", fontSize: "13px" }}
                    className="hover:underline" hrefKey="4022e400fe499cd3"
                  >
                    <CmsText field="4828b020910321a4" fallback="Leather Jackets & Shearling"/></CmsLink>
                </li>
                <li>
                  <CmsLink
                    href="/customize"
                    style={{ color: "#fff", textDecoration: "none", fontSize: "13px", fontWeight: 700 }}
                    className="hover:underline" hrefKey="48f84f49c02a8765"
                  >
                    <CmsText field="6f7de78b07d496a5" fallback="Bespoke Customizer (Monogramming)"/></CmsLink>
                </li>
                <li>
                  <CmsLink
                    href="/"
                    style={{ color: "#e8ded1", textDecoration: "none", fontSize: "13px" }}
                    className="hover:underline" hrefKey="afe3a769b4e37b2d"
                  >
                    <CmsText field="a7a9ce9e43be09ed" fallback="All Atelier Products"/></CmsLink>
                </li>
              </ul>
            </div>

            {/* Column 2: Client Services */}
            <div>
              <h4
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "#e8ded1",
                  margin: "0 0 16px",
                }}
              >
                <CmsText field="a547440aeccc79be" fallback="Client Care"/></h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                <li>
                  <button
                    type="button"
                    onClick={() => setOrderTrackingOpen(true)}
                    style={{
                      background: "none",
                      border: 0,
                      color: "#fff",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: "13px",
                      textAlign: "left",
                    }}
                    className="hover:underline"
                  >
                    <CmsText field="16987c5b2f1875fb" fallback="Track Your Order Live"/></button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen(true)}
                    style={{
                      background: "none",
                      border: 0,
                      color: "#fff",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: "13px",
                      textAlign: "left",
                    }}
                    className="hover:underline"
                  >
                    <CmsText field="c3886832eeffd28b" fallback="Size & Fit Guide (EU/US)"/></button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveInfoModal({
                        title: "Shipping & Delivery",
                        category: "SHIPPING & DISPATCH",
                        content: (
                          <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#333" }}>
                            <p>
                              <CmsText field="34bad0ddcd99d593" fallback="Every order placed with Dioka Atelier includes "/><strong><CmsText field="6ca9d62e36ac429f" fallback="complimentary express courier delivery"/></strong> <CmsText field="18dba510dcf905a8" fallback="anywhere in the world."/></p>
                            <ul style={{ paddingLeft: "20px", margin: "12px 0" }}>
                              <li><strong><CmsText field="6d7779930334bcde" fallback="Europe & UK:"/></strong> <CmsText field="4a3e4dd1aeb06b68" fallback="2 to 4 business days via DHL Express / DPD."/></li>
                              <li><strong><CmsText field="1900040ad268e878" fallback="North America:"/></strong> <CmsText field="0b73a04f010bb4f7" fallback="3 to 5 business days via FedEx International Priority."/></li>
                              <li><strong><CmsText field="784c60bf0fc8d932" fallback="Worldwide / Africa / Asia:"/></strong> <CmsText field="8c0ecd3118015c0e" fallback="4 to 6 business days with door-to-door courier."/></li>
                              <li><strong><CmsText field="04608078ef9efde9" fallback="Customs & Import Duties:"/></strong> <CmsText field="99416f543309e07c" fallback="100% pre-paid and covered by Dioka. No surprise customs fees at your doorstep."/></li>
                            </ul>
                            <p style={{ marginTop: "12px", background: "#f8f6f0", padding: "12px", borderRadius: "3px" }}>
                              <CmsText field="f6b2b0d72976c11c" fallback="You will receive an automated tracking number via email as soon as master craftsmen package your item."/></p>
                          </div>
                        ),
                      })
                    }
                    style={{
                      background: "none",
                      border: 0,
                      color: "#fff",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: "13px",
                      textAlign: "left",
                    }}
                    className="hover:underline"
                  >
                    <CmsText field="cbe877c0ce39508d" fallback="Shipping & Delivery"/></button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveInfoModal({
                        title: "Returns & Exchanges",
                        category: "HASSLE-FREE RETURNS",
                        content: (
                          <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#333" }}>
                            <p>
                              <CmsText field="067fc6ffcc27d0fc" fallback="We want you to feel completely confident wearing Dioka. You have "/><strong><CmsText field="c9bb304223ee5794" fallback="30 calendar days"/></strong> <CmsText field="c64227713bd8d964" fallback="from the date of delivery to try on your pieces at home."/></p>
                            <ul style={{ paddingLeft: "20px", margin: "12px 0" }}>
                              <li><strong><CmsText field="7e44090edd74fda5" fallback="Prepaid Return Label:"/></strong> <CmsText field="f7b661c0ac54fe70" fallback="Included inside every delivery parcel. Simply affix and hand to courier."/></li>
                              <li><strong><CmsText field="59ed8f6db6b3efe4" fallback="Free Size Exchanges:"/></strong> <CmsText field="8a5d357b9892d1ae" fallback="Need a half-size up in boots or a different jacket sleeve fit? Exchanges are completely complimentary."/></li>
                              <li><strong><CmsText field="ba33116573229a39" fallback="Condition:"/></strong> <CmsText field="81abff3c2862b8ae" fallback="Items must be in unblemished, unworn condition with original dust bag and authenticity cards."/></li>
                              <li><strong><CmsText field="b891e50d0c3c3a2a" fallback="Fast Refunds:"/></strong> <CmsText field="9f0282de354e2d48" fallback="Issued back to your original payment method within 48 hours of atelier inspection."/></li>
                            </ul>
                          </div>
                        ),
                      })
                    }
                    style={{
                      background: "none",
                      border: 0,
                      color: "#fff",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: "13px",
                      textAlign: "left",
                    }}
                    className="hover:underline"
                  >
                    <CmsText field="6b4358d1c653ae99" fallback="Returns & Exchanges"/></button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveInfoModal({
                        title: "Craftsmanship & Care",
                        category: "ATELIER GUARANTEE",
                        content: (
                          <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#333" }}>
                            <p>
                              <CmsText field="a0616ee61ebbd95b" fallback="Dioka products are engineered to become heirlooms. We back every piece with a comprehensive "/><strong><CmsText field="4fd7b669d6f6b96f" fallback="2-year workshop warranty"/></strong> <CmsText field="0481acff0b36d115" fallback="covering:"/></p>
                            <ul style={{ paddingLeft: "20px", margin: "12px 0" }}>
                              <li><CmsText field="10456b6c760ef545" fallback="All structural stitching, seams, and thread tension."/></li>
                              <li><CmsText field="dc88914c3d8468e5" fallback="Solid brass hardware, clasps, buckles, and heavy-duty zippers."/></li>
                              <li><CmsText field="58d50fc1f45c0f43" fallback="Goodyear welts, heels, and outsoles on all footwear."/></li>
                              <li><CmsText field="c42ba706905486c4" fallback="Complimentary artisan repairs or replacement if a defect arises under normal use."/></li>
                            </ul>
                          </div>
                        ),
                      })
                    }
                    style={{
                      background: "none",
                      border: 0,
                      color: "#fff",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: "13px",
                      textAlign: "left",
                    }}
                    className="hover:underline"
                  >
                    <CmsText field="8700c47fd8c8d2d7" fallback="Craftsmanship & Care"/></button>
                </li>
              </ul>
            </div>

            {/* Column 3: Atelier Account & Tools */}
            <div>
              <h4
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "#e8ded1",
                  margin: "0 0 16px",
                }}
              >
                <CmsText field="dc73a1ae9ee8b2ba" fallback="Account & Atelier"/></h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      if (isAuthenticated) {
                        setAccountModalTab("profile");
                      } else {
                        setAccountModalTab("login");
                      }
                      setAccountModalOpen(true);
                    }}
                    style={{
                      background: "none",
                      border: 0,
                      color: "#fff",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: "13px",
                      textAlign: "left",
                    }}
                    className="hover:underline"
                  >
                    {isAuthenticated ? `My Atelier Profile (${user?.name?.split(" ")[0]})` : "Sign In / Join Atelier"}
                  </button>
                </li>
                <li>
                  <CmsLink
                    href="/cart"
                    style={{ color: "#fff", textDecoration: "none", fontSize: "13px" }}
                    className="hover:underline" hrefKey="e47de2dbb203b379"
                  >
                    <CmsText field="0c702b4811b13871" fallback="Shopping Bag ("/>{cartCount} {cartCount === 1 ? "item" : "items"}<CmsText field="65962fbf69246e16" fallback=")"/></CmsLink>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setCurrencyConverterModalOpen(true)}
                    style={{
                      background: "none",
                      border: 0,
                      color: "#fff",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: "13px",
                      textAlign: "left",
                    }}
                    className="hover:underline"
                  >
                    <CmsText field="3e92af29208e1db2" fallback="Currency Converter (Live Rates)"/></button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveInfoModal({
                        title: "Leather Care & Conditioning Guide",
                        category: "PRESERVATION",
                        content: (
                          <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#333" }}>
                            <p>
                              <CmsText field="9182f284dff9a425" fallback="Full-grain leather is a living material that develops a gorgeous, bespoke patina over decades. Follow these simple atelier tips:"/></p>
                            <ul style={{ paddingLeft: "20px", margin: "12px 0" }}>
                              <li><strong><CmsText field="fa206463c9d53534" fallback="Regular Dusting:"/></strong> <CmsText field="089642bea6a09a08" fallback="Wipe gently with a dry microfiber cloth after outdoor wear."/></li>
                              <li><strong><CmsText field="8dd35a5358278c8d" fallback="Natural Conditioning:"/></strong> <CmsText field="6d9d82ccad88f796" fallback="Apply a dab of organic beeswax or neutral leather balm once every 4 to 6 months to keep fibers supple."/></li>
                              <li><strong><CmsText field="e7eefbb7bd513403" fallback="Rain Protection:"/></strong> <CmsText field="c9da744e654b38a6" fallback="If exposed to sudden downpours, dab with a soft towel and let dry naturally at room temperature. Never expose to direct heat radiators."/></li>
                              <li><strong><CmsText field="c227b4b524fa2fff" fallback="Storage:"/></strong> <CmsText field="8ff8e586e2dd2b13" fallback="Always store bags in the included breathable cotton dust cover with gentle stuffing to preserve shape."/></li>
                            </ul>
                          </div>
                        ),
                      })
                    }
                    style={{
                      background: "none",
                      border: 0,
                      color: "#fff",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: "13px",
                      textAlign: "left",
                    }}
                    className="hover:underline"
                  >
                    <CmsText field="23e56a10cf7ac48c" fallback="Leather Care & Balm Guide"/></button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveInfoModal({
                        title: "Contact Dioka Atelier Concierge",
                        category: "CLIENT CONCIERGE",
                        content: (
                          <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#333" }}>
                            <p>
                              <CmsText field="b20526af9094266a" fallback="Contact our team for sizing, materials, delivery and bespoke requests:"/></p>
                            <div style={{ display: "grid", gap: "10px", margin: "16px 0" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#f8f6f0", padding: "12px" }}>
                                <Mail size={18} color="#123d32" />
                                <div>
                                  <strong style={{ display: "block", color: "#123d32" }}><CmsText field="4c0e49ec9511f129" fallback="Email Concierge"/></strong>
                                  <span style={{ color: "#666" }}>{published?.supportEmail || "contactus@diokacraft.com"}</span>
                                </div>
                              </div>


                            </div>
                          </div>
                        ),
                      })
                    }
                    style={{
                      background: "none",
                      border: 0,
                      color: "#fff",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: "13px",
                      textAlign: "left",
                    }}
                    className="hover:underline"
                  >
                    <CmsText field="6d52c72ad66d30c5" fallback="Contact Atelier Concierge"/></button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(new CustomEvent("show-atelier-splash"));
                      }
                    }}
                    style={{
                      background: "none",
                      border: 0,
                      color: "#e8ded1",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: "13px",
                      textAlign: "left",
                    }}
                    className="hover:underline"
                  >
                    <CmsText field="4db2232be1ced88f" fallback="▶ Watch Atelier Crafting Film"/></button>
                </li>
              </ul>
            </div>

            {/* Column 4: Heritage & Legal */}
            <div>
              <h4
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "#e8ded1",
                  margin: "0 0 16px",
                }}
              >
                <CmsText field="657d63838929a5cb" fallback="Heritage & Trust"/></h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                <li>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveInfoModal({
                        title: "The Dioka Story & Philosophy",
                        category: "OUR ORIGIN",
                        content: (
                          <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#333" }}>
                            <p>
                              <CmsText field="2dde3aa0a8b9b1e3" fallback="Dioka was founded on a simple conviction: luxury should not mean fragile, synthetic shortcuts or artificial exclusivity."/></p>
                            <p>
                              <CmsText field="4d8a792b6c59ef5d" fallback="We partner exclusively with generational European tanneries and artisan workshops that have perfected vegetable-tanning and Goodyear-welting across centuries. Every hide is 100% full-grain leather, hand-cut, and assembled with solid brass fittings."/></p>
                            <p>
                              <CmsText field="c7400a76d0239fbe" fallback="By cutting out unnecessary middlemen, we deliver heirloom-grade craftsmanship directly to clients worldwide at fair, transparent atelier prices."/></p>
                          </div>
                        ),
                      })
                    }
                    style={{
                      background: "none",
                      border: 0,
                      color: "#fff",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: "13px",
                      textAlign: "left",
                    }}
                    className="hover:underline"
                  >
                    <CmsText field="a2966e5782e3c3c9" fallback="Our Story & Sourcing"/></button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveInfoModal({
                        title: "Privacy & Data Protection Policy",
                        category: "LEGAL & COMPLIANCE",
                        content: (
                          <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#333" }}>
                            <p>
                              <CmsText field="bd4366ec7de6cf14" fallback="At Dioka, we treat client privacy with the utmost discretion and respect. We comply fully with GDPR and international data standards:"/></p>
                            <ul style={{ paddingLeft: "20px", margin: "12px 0" }}>
                              <li><CmsText field="425f191045ab2735" fallback="Your shipping details and order history are strictly used to fulfill and track your purchases."/></li>
                              <li><CmsText field="9b9e93c8b359d37b" fallback="We never sell, rent, or trade client email addresses or profiles with third-party advertisers."/></li>
                              <li><CmsText field="518d066bb7ebdaa9" fallback="Payment card transactions are tokenized via 256-bit bank-grade encryption; card numbers never touch our servers."/></li>
                              <li><CmsText field="d541842cf10c6d78" fallback="You can view or request deletion of your atelier account at any time through your profile."/></li>
                            </ul>
                          </div>
                        ),
                      })
                    }
                    style={{
                      background: "none",
                      border: 0,
                      color: "#fff",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: "13px",
                      textAlign: "left",
                    }}
                    className="hover:underline"
                  >
                    <CmsText field="25fca1fdec149718" fallback="Privacy & Cookie Policy"/></button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveInfoModal({
                        title: "Terms of Service & Atelier Conditions",
                        category: "LEGAL",
                        content: (
                          <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#333" }}>
                            <p>
                              <CmsText field="92713619cfa0cb60" fallback="Welcome to Dioka Atelier. By placing an order or commissioning a bespoke piece, the following standards apply:"/></p>
                            <ul style={{ paddingLeft: "20px", margin: "12px 0" }}>
                              <li><strong><CmsText field="47809d8493233525" fallback="Authenticity:"/></strong> <CmsText field="a389359d39868226" fallback="All items are guaranteed 100% genuine full-grain leather certified by European leather guilds."/></li>
                              <li><strong><CmsText field="530dd6fe2ac01c1e" fallback="Pricing:"/></strong> <CmsText field="5707dd0ca3d97733" fallback="All listed prices include applicable taxes and duties. Currency conversion is calculated live at international market rates."/></li>
                              <li><strong><CmsText field="ae04708487b527f9" fallback="Bespoke Commissions:"/></strong> <CmsText field="bdebf5b1ab2116e4" fallback="Custom hot-stamped monograms and customized dimensions are crafted individually and require 10–14 days atelier turnaround."/></li>
                              <li><strong><CmsText field="fe11abf46e622a5c" fallback="Satisfaction:"/></strong> <CmsText field="e695a7cc429ea4de" fallback="Our 30-day exchange policy and 2-year warranty protect every customer transaction."/></li>
                            </ul>
                          </div>
                        ),
                      })
                    }
                    style={{
                      background: "none",
                      border: 0,
                      color: "#fff",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: "13px",
                      textAlign: "left",
                    }}
                    className="hover:underline"
                  >
                    <CmsText field="50696e79fe129092" fallback="Terms of Service"/></button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveInfoModal({
                        title: "Ethical Tannery & Hide Sourcing",
                        category: "SUSTAINABILITY",
                        content: (
                          <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#333" }}>
                            <p>
                              <CmsText field="b9c5e9adc038302e" fallback="Dioka only utilizes hides that are by-products of European agriculture. We work exclusively with tanneries audited by the Leather Working Group (LWG) with Gold and Silver environmental ratings."/></p>
                            <ul style={{ paddingLeft: "20px", margin: "12px 0" }}>
                              <li><CmsText field="074ab4e64d726c4b" fallback="Closed-loop water recycling in all Italian and Spanish tanneries."/></li>
                              <li><CmsText field="47c8525b41912b18" fallback="Natural vegetable extracts (chestnut, mimosa, quebracho) instead of harsh heavy metals."/></li>
                              <li><CmsText field="cc5d15671e00d8bf" fallback="Zero synthetic plastics, petroleum pleather, or micro-plastic shed."/></li>
                            </ul>
                          </div>
                        ),
                      })
                    }
                    style={{
                      background: "none",
                      border: 0,
                      color: "#fff",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: "13px",
                      textAlign: "left",
                    }}
                    className="hover:underline"
                  >
                    <CmsText field="1d86f47ba667d6fa" fallback="LWG Certified Tannery Sourcing"/></button>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom Bar: Copyright & Clean Text Links */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              fontSize: "12px",
              color: "#f6e6e2",
              textShadow: "0 1px 4px rgba(0,0,0,0.6)",
            }}
          >
            <p style={{ margin: 0, maxWidth: "420px", lineHeight: "1.4" }}>
              <CmsText field="48c35e70680cc6e5" fallback="Premium handcrafted leather bags, footwear, and jackets built for real life. Made with 100% full-grain European hides."/></p>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                onClick={() =>
                  setActiveInfoModal({
                    title: "Privacy & Data Protection Policy",
                    category: "LEGAL",
                    content: (
                      <p>
                        <CmsText field="b25ceeeed9496e0b" fallback="We respect your privacy. All checkout transactions are secured with 256-bit encryption. For full terms, please see our detailed policy."/></p>
                    ),
                  })
                }
                style={{ background: "none", border: 0, color: "#fff", cursor: "pointer", padding: 0, textDecoration: "underline", fontSize: "12px" }}
              >
                <CmsText field="d7c6fa01da5910b8" fallback="Privacy"/></button>
              <span><CmsText field="d50a2a992e9d2b3c" fallback="·"/></span>
              <button
                type="button"
                onClick={() =>
                  setActiveInfoModal({
                    title: "Terms of Service",
                    category: "LEGAL",
                    content: (
                      <p>
                        <CmsText field="8ee256b4be43337e" fallback="All items include 30-day returns and a 2-year warranty against craftsmanship defects."/></p>
                    ),
                  })
                }
                style={{ background: "none", border: 0, color: "#fff", cursor: "pointer", padding: 0, textDecoration: "underline", fontSize: "12px" }}
              >
                <CmsText field="9f62ccc724278a1f" fallback="Terms"/></button>
              <span><CmsText field="14ea9c467946c024" fallback="·"/></span>
              <CmsLink href="/bags" style={{ color: "#fff", textDecoration: "underline" }} hrefKey="870e303210ba103e">
                <CmsText field="ef12992d690d2162" fallback="Bags"/></CmsLink>
              <span><CmsText field="e3b524bc3bb21fd6" fallback="·"/></span>
              <CmsLink href="/footwear" style={{ color: "#fff", textDecoration: "underline" }} hrefKey="1fc53cb3da5b7627">
                <CmsText field="38061eda2ce66d28" fallback="Shoes"/></CmsLink>
              <span><CmsText field="1cf61589833ac8c9" fallback="·"/></span>
              <CmsLink href="/jackets" style={{ color: "#fff", textDecoration: "underline" }} hrefKey="8ca35386df43ec3e">
                <CmsText field="bea64a3f639149bd" fallback="Jackets"/></CmsLink>
              <span><CmsText field="068964c056bcc943" fallback="·"/></span>
              <CmsLink href="/customize" style={{ color: "#fff", textDecoration: "underline" }} hrefKey="514ae8cc15f7d425">
                <CmsText field="416a61f6dafc222e" fallback="Customize"/></CmsLink>
            </div>

            <CmsLink href="/admin" style={{ color: "#fff", textDecoration: "underline" }} hrefKey="437295c282781042"><CmsText field="d687ed7ed0e6ce37" fallback="Administration"/></CmsLink>
            <span><CmsText field="5ad3953d8b2505ff" fallback="© "/>{new Date().getFullYear()} <CmsText field="ffddbabe9804542c" fallback="Dioka Atelier Ltd. All rights reserved."/></span>
          </div>
        </div>
      </footer>

      {/* DYNAMIC CLICKABLE FOOTER INFO DIALOG */}
      <Dialog
        open={Boolean(activeInfoModal)}
        onOpenChange={(open) => {
          if (!open) setActiveInfoModal(null);
        }}
      >
        <DialogContent
          style={{
            maxWidth: "560px",
            padding: "32px",
            background: "#fff",
            borderRadius: "4px",
            border: "1px solid #d4cdc5",
          }}
          showCloseButton={true}
        >
          {activeInfoModal && (
            <>
              <div style={{ marginBottom: "12px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "#5b1f2b",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  {activeInfoModal.category}
                </span>
                <DialogTitle
                  style={{
                    fontFamily: "var(--dioka-font)",
                    fontSize: "26px",
                    color: "#123d32",
                    lineHeight: "1.1",
                    margin: 0,
                  }}
                >
                  {activeInfoModal.title}
                </DialogTitle>
              </div>

              <DialogDescription style={{ color: "#444", margin: "16px 0 20px", lineHeight: "1.6" }}>
                {activeInfoModal.category === "SHIPPING & DISPATCH" ? published?.shippingPolicy || "Contact our team for delivery options and current lead times." : activeInfoModal.category === "HASSLE-FREE RETURNS" ? published?.returnsPolicy || "Contact our team before returning an item." : activeInfoModal.category === "ATELIER GUARANTEE" ? published?.warrantyPolicy || "Contact our team about product care." : activeInfoModal.title.includes("Privacy") ? published?.privacyPolicy || "Contact our team about your data." : activeInfoModal.title.includes("Terms") ? published?.termsPolicy || "Contact our team before ordering." : activeInfoModal.content}
              </DialogDescription>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={() => setActiveInfoModal(null)}
                  className="dark-button"
                  style={{ padding: "10px 22px", fontSize: "12px" }}
                >
                  <CmsText field="b82bf979c7d74b04" fallback="Close"/></button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
