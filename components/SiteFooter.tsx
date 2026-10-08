"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/lib/store-context";

export function SiteFooter() {
  const { setOrderTrackingOpen, setAccountModalOpen, setAccountModalTab, isAuthenticated } = useStore();

  return (
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

      {/* Footer Content & Write-up */}
      <div className="footer-content">
        <div className="footer-top">
          <p className="eyebrow" style={{ color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>
            DIOKA · ARTISAN HANDCRAFTED LEATHER ATELIER
          </p>
          <Link
            href="#top"
            style={{
              color: "#fff",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 600,
              textShadow: "0 1px 3px rgba(0,0,0,0.4)",
            }}
          >
            Back to top ↑
          </Link>
        </div>

        {/* Brand Wordmark */}
        <div className="footer-wordmark">DIOKA</div>

        {/* Footer write-up and links */}
        <div className="footer-bottom">
          <p style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
            Premium handcrafted leather bags, shoes, and jackets built for real life. Made by generational artisans with full-grain European hides.
          </p>

          <nav aria-label="Footer navigation">
            <Link href="/" style={{ color: "#fff", textDecoration: "none", marginRight: "16px" }}>
              Shop All
            </Link>
            <Link href="/bags" style={{ color: "#fff", textDecoration: "none", marginRight: "16px" }}>
              Bags
            </Link>
            <Link href="/footwear" style={{ color: "#fff", textDecoration: "none", marginRight: "16px" }}>
              Shoes & Boots
            </Link>
            <Link href="/jackets" style={{ color: "#fff", textDecoration: "none", marginRight: "16px" }}>
              Jackets
            </Link>
            <Link href="/cart" style={{ color: "#fff", textDecoration: "none", marginRight: "16px" }}>
              Your Bag
            </Link>
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
                marginRight: "16px",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: ".1em",
              }}
            >
              {isAuthenticated ? "My Account" : "Sign In"}
            </button>
            <button
              type="button"
              onClick={() => setOrderTrackingOpen(true)}
              style={{
                background: "none",
                border: 0,
                color: "#fff",
                cursor: "pointer",
                padding: 0,
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: ".1em",
              }}
            >
              Track Order
            </button>
          </nav>

          <span style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
            © {new Date().getFullYear()} Dioka Atelier. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
