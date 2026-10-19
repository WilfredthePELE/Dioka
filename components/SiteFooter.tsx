"use client";

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
          <video
            autoPlay
            loop
            muted
            playsInline
            className="footer-video"
            poster="/dioka-boots-jacket.webp"
          >
            <source src="/italian-shoemaker-atelier.mp4" type="video/mp4" />
            <source src="/italian-shoemaker-atelier.webm" type="video/webm" />
            <source src="/shoemaker-daylight-brown.mp4" type="video/mp4" />
          </video>
          <div className="footer-video-overlay" />
        </div>

        {/* Footer Content */}
        <div className="footer-content">
          {/* Top Row: Tagline & Smooth Back to Top */}
          <div className="footer-top">
            <p className="eyebrow" style={{ color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)", margin: 0 }}>
              DIOKA · ARTISAN HANDCRAFTED LEATHER ATELIER
            </p>
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
              <span>Back to top</span>
              <ArrowUp size={14} />
            </button>
          </div>

          {/* Central Grand Brand Wordmark (Clickable to Home / Top) */}
          <div style={{ textAlign: "center" }}>
            <Link
              href="/"
              className="footer-wordmark"
              style={{ textDecoration: "none", display: "inline-block" }}
              title="Return to Dioka Home"
            >
              DIOKA
            </Link>
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
                Collections
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                <li>
                  <Link
                    href="/bags"
                    style={{ color: "#fff", textDecoration: "none", fontSize: "13px" }}
                    className="hover:underline"
                  >
                    Leather Bags (Shoulder & Crossbody)
                  </Link>
                </li>
                <li>
                  <Link
                    href="/footwear"
                    style={{ color: "#fff", textDecoration: "none", fontSize: "13px" }}
                    className="hover:underline"
                  >
                    Shoes & Boots (Goodyear-Welted)
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jackets"
                    style={{ color: "#fff", textDecoration: "none", fontSize: "13px" }}
                    className="hover:underline"
                  >
                    Leather Jackets & Shearling
                  </Link>
                </li>
                <li>
                  <Link
                    href="/customize"
                    style={{ color: "#fff", textDecoration: "none", fontSize: "13px", fontWeight: 700 }}
                    className="hover:underline"
                  >
                    Bespoke Customizer (Monogramming)
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    style={{ color: "#e8ded1", textDecoration: "none", fontSize: "13px" }}
                    className="hover:underline"
                  >
                    All Atelier Products
                  </Link>
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
                Client Care
              </h4>
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
                    Track Your Order Live
                  </button>
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
                    Size & Fit Guide (EU/US)
                  </button>
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
                              Every order placed with Dioka Atelier includes <strong>complimentary express courier delivery</strong> anywhere in the world.
                            </p>
                            <ul style={{ paddingLeft: "20px", margin: "12px 0" }}>
                              <li><strong>Europe & UK:</strong> 2 to 4 business days via DHL Express / DPD.</li>
                              <li><strong>North America:</strong> 3 to 5 business days via FedEx International Priority.</li>
                              <li><strong>Worldwide / Africa / Asia:</strong> 4 to 6 business days with door-to-door courier.</li>
                              <li><strong>Customs & Import Duties:</strong> 100% pre-paid and covered by Dioka. No surprise customs fees at your doorstep.</li>
                            </ul>
                            <p style={{ marginTop: "12px", background: "#f8f6f0", padding: "12px", borderRadius: "3px" }}>
                              You will receive an automated tracking number via email as soon as master craftsmen package your item.
                            </p>
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
                    Shipping & Delivery
                  </button>
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
                              We want you to feel completely confident wearing Dioka. You have <strong>30 calendar days</strong> from the date of delivery to try on your pieces at home.
                            </p>
                            <ul style={{ paddingLeft: "20px", margin: "12px 0" }}>
                              <li><strong>Prepaid Return Label:</strong> Included inside every delivery parcel. Simply affix and hand to courier.</li>
                              <li><strong>Free Size Exchanges:</strong> Need a half-size up in boots or a different jacket sleeve fit? Exchanges are completely complimentary.</li>
                              <li><strong>Condition:</strong> Items must be in unblemished, unworn condition with original dust bag and authenticity cards.</li>
                              <li><strong>Fast Refunds:</strong> Issued back to your original payment method within 48 hours of atelier inspection.</li>
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
                    Returns & Exchanges
                  </button>
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
                              Dioka products are engineered to become heirlooms. We back every piece with a comprehensive <strong>2-year workshop warranty</strong> covering:
                            </p>
                            <ul style={{ paddingLeft: "20px", margin: "12px 0" }}>
                              <li>All structural stitching, seams, and thread tension.</li>
                              <li>Solid brass hardware, clasps, buckles, and heavy-duty zippers.</li>
                              <li>Goodyear welts, heels, and outsoles on all footwear.</li>
                              <li>Complimentary artisan repairs or replacement if a defect arises under normal use.</li>
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
                    Craftsmanship & Care
                  </button>
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
                Account & Atelier
              </h4>
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
                  <Link
                    href="/cart"
                    style={{ color: "#fff", textDecoration: "none", fontSize: "13px" }}
                    className="hover:underline"
                  >
                    Shopping Bag ({cartCount} {cartCount === 1 ? "item" : "items"})
                  </Link>
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
                    Currency Converter (Live Rates)
                  </button>
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
                              Full-grain leather is a living material that develops a gorgeous, bespoke patina over decades. Follow these simple atelier tips:
                            </p>
                            <ul style={{ paddingLeft: "20px", margin: "12px 0" }}>
                              <li><strong>Regular Dusting:</strong> Wipe gently with a dry microfiber cloth after outdoor wear.</li>
                              <li><strong>Natural Conditioning:</strong> Apply a dab of organic beeswax or neutral leather balm once every 4 to 6 months to keep fibers supple.</li>
                              <li><strong>Rain Protection:</strong> If exposed to sudden downpours, dab with a soft towel and let dry naturally at room temperature. Never expose to direct heat radiators.</li>
                              <li><strong>Storage:</strong> Always store bags in the included breathable cotton dust cover with gentle stuffing to preserve shape.</li>
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
                    Leather Care & Balm Guide
                  </button>
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
                              Contact our team for sizing, materials, delivery and bespoke requests:
                            </p>
                            <div style={{ display: "grid", gap: "10px", margin: "16px 0" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#f8f6f0", padding: "12px" }}>
                                <Mail size={18} color="#123d32" />
                                <div>
                                  <strong style={{ display: "block", color: "#123d32" }}>Email Concierge</strong>
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
                    Contact Atelier Concierge
                  </button>
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
                    ▶ Watch Atelier Crafting Film
                  </button>
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
                Heritage & Trust
              </h4>
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
                              Dioka was founded on a simple conviction: luxury should not mean fragile, synthetic shortcuts or artificial exclusivity.
                            </p>
                            <p>
                              We partner exclusively with generational European tanneries and artisan workshops that have perfected vegetable-tanning and Goodyear-welting across centuries. Every hide is 100% full-grain leather, hand-cut, and assembled with solid brass fittings.
                            </p>
                            <p>
                              By cutting out unnecessary middlemen, we deliver heirloom-grade craftsmanship directly to clients worldwide at fair, transparent atelier prices.
                            </p>
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
                    Our Story & Sourcing
                  </button>
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
                              At Dioka, we treat client privacy with the utmost discretion and respect. We comply fully with GDPR and international data standards:
                            </p>
                            <ul style={{ paddingLeft: "20px", margin: "12px 0" }}>
                              <li>Your shipping details and order history are strictly used to fulfill and track your purchases.</li>
                              <li>We never sell, rent, or trade client email addresses or profiles with third-party advertisers.</li>
                              <li>Payment card transactions are tokenized via 256-bit bank-grade encryption; card numbers never touch our servers.</li>
                              <li>You can view or request deletion of your atelier account at any time through your profile.</li>
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
                    Privacy & Cookie Policy
                  </button>
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
                              Welcome to Dioka Atelier. By placing an order or commissioning a bespoke piece, the following standards apply:
                            </p>
                            <ul style={{ paddingLeft: "20px", margin: "12px 0" }}>
                              <li><strong>Authenticity:</strong> All items are guaranteed 100% genuine full-grain leather certified by European leather guilds.</li>
                              <li><strong>Pricing:</strong> All listed prices include applicable taxes and duties. Currency conversion is calculated live at international market rates.</li>
                              <li><strong>Bespoke Commissions:</strong> Custom hot-stamped monograms and customized dimensions are crafted individually and require 10–14 days atelier turnaround.</li>
                              <li><strong>Satisfaction:</strong> Our 30-day exchange policy and 2-year warranty protect every customer transaction.</li>
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
                    Terms of Service
                  </button>
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
                              Dioka only utilizes hides that are by-products of European agriculture. We work exclusively with tanneries audited by the Leather Working Group (LWG) with Gold and Silver environmental ratings.
                            </p>
                            <ul style={{ paddingLeft: "20px", margin: "12px 0" }}>
                              <li>Closed-loop water recycling in all Italian and Spanish tanneries.</li>
                              <li>Natural vegetable extracts (chestnut, mimosa, quebracho) instead of harsh heavy metals.</li>
                              <li>Zero synthetic plastics, petroleum pleather, or micro-plastic shed.</li>
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
                    LWG Certified Tannery Sourcing
                  </button>
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
              Premium handcrafted leather bags, footwear, and jackets built for real life. Made with 100% full-grain European hides.
            </p>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                onClick={() =>
                  setActiveInfoModal({
                    title: "Privacy & Data Protection Policy",
                    category: "LEGAL",
                    content: (
                      <p>
                        We respect your privacy. All checkout transactions are secured with 256-bit encryption. For full terms, please see our detailed policy.
                      </p>
                    ),
                  })
                }
                style={{ background: "none", border: 0, color: "#fff", cursor: "pointer", padding: 0, textDecoration: "underline", fontSize: "12px" }}
              >
                Privacy
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() =>
                  setActiveInfoModal({
                    title: "Terms of Service",
                    category: "LEGAL",
                    content: (
                      <p>
                        All items include 30-day returns and a 2-year warranty against craftsmanship defects.
                      </p>
                    ),
                  })
                }
                style={{ background: "none", border: 0, color: "#fff", cursor: "pointer", padding: 0, textDecoration: "underline", fontSize: "12px" }}
              >
                Terms
              </button>
              <span>·</span>
              <Link href="/bags" style={{ color: "#fff", textDecoration: "underline" }}>
                Bags
              </Link>
              <span>·</span>
              <Link href="/footwear" style={{ color: "#fff", textDecoration: "underline" }}>
                Shoes
              </Link>
              <span>·</span>
              <Link href="/jackets" style={{ color: "#fff", textDecoration: "underline" }}>
                Jackets
              </Link>
              <span>·</span>
              <Link href="/customize" style={{ color: "#fff", textDecoration: "underline" }}>
                Customize
              </Link>
            </div>

            <Link href="/admin" style={{ color: "#fff", textDecoration: "underline" }}>Administration</Link>
            <span>© {new Date().getFullYear()} Dioka Atelier Ltd. All rights reserved.</span>
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
                {activeInfoModal.category === "SHIPPING & DISPATCH" ? published?.shippingPolicy || "Contact our team for delivery options and current lead times." : activeInfoModal.category === "HASSLE-FREE RETURNS" ? published?.returnsPolicy || "Contact our team before returning an item." : activeInfoModal.category === "ATELIER GUARANTEE" ? "Contact our team about repairs, product care and the support available for your piece." : activeInfoModal.title.includes("Privacy") ? "We store account details, orders and customer-care messages to provide our services. Payments are handled by Stripe. Contact our team to ask about your data or request account assistance." : activeInfoModal.title.includes("Terms") ? "Checkout charges the item total shown in USD. Contact our team about delivery, returns and any personalized order before purchasing. Your order is confirmed after payment is verified." : activeInfoModal.content}
              </DialogDescription>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={() => setActiveInfoModal(null)}
                  className="dark-button"
                  style={{ padding: "10px 22px", fontSize: "12px" }}
                >
                  Close
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
