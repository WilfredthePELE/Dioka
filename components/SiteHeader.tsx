"use client";
import { CmsLink, CmsText } from "@/components/SiteControls";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  MessageSquare,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import { CURRENCY_CONFIG, type Currency } from "@/lib/products";
import { Announcement } from "@/components/EditableContent";

export function SiteHeader() {
  const pathname = usePathname();
  const {
    cartCount,
    setCartOpen,
    currency,
    setCurrency,
    setOrderTrackingOpen,
    user,
    isAuthenticated,
    setAccountModalOpen,
    setAccountModalTab,
    designerChatOpen,
    setDesignerChatOpen,
  } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <Announcement />
      {/* MAIN HEADER (Fast, high-performance responsive navbar) */}
      <header className="site-header">
        {/* Navigation: Bags, Shoes & Boots, Jacket, Customize */}
        <nav className="header-left" aria-label="Main navigation">
          <button
            type="button"
            className="mobile-menu-trigger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <CmsLink
            href="/bags"
            prefetch={true}
            className={isActive("/bags") ? "active" : ""}
            style={{
              fontWeight: isActive("/bags") ? 700 : 500,
              color: isActive("/bags") ? "#123d32" : undefined,
              textDecoration: isActive("/bags") ? "underline" : undefined,
              textUnderlineOffset: "6px",
            }} hrefKey="33633b6b3e97ba0e"
          >
            <CmsText field="9833898d3436d360" fallback="Bags"/></CmsLink>

          <CmsLink
            href="/footwear"
            prefetch={true}
            className={isActive("/footwear") ? "active" : ""}
            style={{
              fontWeight: isActive("/footwear") ? 700 : 500,
              color: isActive("/footwear") ? "#123d32" : undefined,
              textDecoration: isActive("/footwear") ? "underline" : undefined,
              textUnderlineOffset: "6px",
            }} hrefKey="dd5f2d39a255b5be"
          >
            <CmsText field="a8c080abb3036e72" fallback="Shoes & Boots"/></CmsLink>

          <CmsLink
            href="/jackets"
            prefetch={true}
            className={isActive("/jackets") ? "active" : ""}
            style={{
              fontWeight: isActive("/jackets") ? 700 : 500,
              color: isActive("/jackets") ? "#123d32" : undefined,
              textDecoration: isActive("/jackets") ? "underline" : undefined,
              textUnderlineOffset: "6px",
            }} hrefKey="bd1da611533531e2"
          >
            <CmsText field="48acdf882f1e63a6" fallback="Jacket"/></CmsLink>

          <CmsLink
            href="/customize"
            prefetch={true}
            className={isActive("/customize") ? "active" : ""}
            style={{
              fontWeight: isActive("/customize") ? 700 : 500,
              color: isActive("/customize") ? "#123d32" : undefined,
              textDecoration: isActive("/customize") ? "underline" : undefined,
              textUnderlineOffset: "6px",
            }} hrefKey="a4160eaddc40dfd4"
          >
            <CmsText field="deb7663497809514" fallback="Customize"/></CmsLink>
        </nav>

        {/* Center Wordmark Logo (The only Dioka brand mark) */}
        <CmsLink className="wordmark" href="/" prefetch={true} aria-label="Dioka home" hrefKey="412b35298c5da7a8">
          <CmsText field="f9923307692c5efd" fallback="DIOKA"/><span><CmsText field="16fbfa34a5d2636a" fallback="®"/></span>
        </CmsLink>

        {/* Header Right Actions */}
        <div className="header-right">
          {/* Currency Switcher */}
          <select
            className="currency-select"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            aria-label="Select currency"
            title="Change store currency"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="NGN">NGN (₦)</option>
          </select>


          {/* Master Designer Consultation Chatbox Button */}
          <button
            type="button"
            className="designer-chat-trigger"
            onClick={() => {
              const next = !designerChatOpen;
              setDesignerChatOpen(next);
              if (next && typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("open-dioka-chat"));
              }
            }}
            aria-label="Open customer care"
            title="Chat with the Dioka team"
            style={{
              position: "relative",
              background: designerChatOpen ? "rgba(18, 61, 50, 0.12)" : "rgba(18, 61, 50, 0.05)",
              border: designerChatOpen ? "1px solid rgba(18, 61, 50, 0.35)" : "1px solid rgba(18, 61, 50, 0.15)",
              color: "#123d32",
              cursor: "pointer",
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
              gap: "7px",
              borderRadius: "4px",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <MessageSquare size={17} strokeWidth={2} />
              <span
                style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#22c55e",
                  border: "1.5px solid #ffffff",
                }}
                title="Master Designer Online"
              />
            </div>
            <span
              style={{
                fontFamily: "var(--dioka-sans)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: ".06em",
                textTransform: "uppercase",
              }}
              className="hidden sm:inline"
            >
              <CmsText field="0d4394d9bcdd354d" fallback="Live Chat"/></span>
          </button>

          {/* User Account / Sign In button */}
          <button
            type="button"
            className="account-trigger"
            onClick={() => {
              if (isAuthenticated) {
                setAccountModalTab("profile");
              } else {
                setAccountModalTab("login");
              }
              setAccountModalOpen(true);
            }}
            aria-label={isAuthenticated ? `Account for ${user?.name}` : "Sign in or create account"}
            title={
              isAuthenticated
                ? `Account: ${user?.name} (Specialized Bag active)`
                : "Sign in to access your specialized bag"
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: isAuthenticated ? "rgba(18, 61, 50, 0.08)" : "none",
              border: isAuthenticated
                ? "1px solid rgba(18, 61, 50, 0.25)"
                : "1px solid transparent",
              color: "#123d32",
              padding: "6px 10px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              borderRadius: "2px",
            }}
          >
            <User size={17} strokeWidth={1.8} />
            <span
              style={{
                maxWidth: "85px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {isAuthenticated ? user?.name.split(" ")[0] : "Sign In"}
            </span>
          </button>

          {/* Shopping Cart (Bag) button */}
          <button
            type="button"
            className="cart-trigger"
            onClick={() => setCartOpen(true)}
            aria-label={`Shopping bag with ${cartCount} items`}
            title="Open your shopping bag"
          >
            <ShoppingBag size={19} strokeWidth={1.8} />
            <span><CmsText field="226de659b1182cf4" fallback="Bag ("/>{cartCount}<CmsText field="5a62d262b1205431" fallback=")"/></span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <nav className="mobile-menu" aria-label="Mobile navigation">
          {/* Mobile User Status */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              if (isAuthenticated) {
                setAccountModalTab("profile");
              } else {
                setAccountModalTab("login");
              }
              setAccountModalOpen(true);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: "#123d32",
              color: "#fff",
              border: 0,
              padding: "12px 16px",
              fontSize: "13px",
              fontWeight: 700,
              borderRadius: "2px",
              cursor: "pointer",
              marginBottom: "12px",
            }}
          >
            <User size={16} />
            {isAuthenticated ? `My Account (${user?.name})` : "Sign In / Join Dioka Atelier"}
          </button>

          {/* Clean 4 navigation links */}
          <CmsLink href="/bags" onClick={() => setMobileMenuOpen(false)} hrefKey="4ef2bb2770a2428d">
            <CmsText field="f515c7cc04645350" fallback="Bags"/></CmsLink>
          <CmsLink href="/footwear" onClick={() => setMobileMenuOpen(false)} hrefKey="68e2fa615e067a29">
            <CmsText field="9769c054cdb058d4" fallback="Shoes & Boots"/></CmsLink>
          <CmsLink href="/jackets" onClick={() => setMobileMenuOpen(false)} hrefKey="a40c4acc2936b20f">
            <CmsText field="031a635eaebcbc00" fallback="Jacket"/></CmsLink>
          <CmsLink href="/customize" onClick={() => setMobileMenuOpen(false)} hrefKey="e95c316c366ab744">
            <CmsText field="1633752b47a1f3e1" fallback="Customize"/></CmsLink>

          {/* Mobile Currency Selector */}
          <div
            style={{
              margin: "12px 0",
              padding: "12px",
              background: "#f6f3ee",
              borderRadius: "4px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: ".06em",
                textTransform: "uppercase",
                color: "#123d32",
                marginBottom: "8px",
              }}
            >
              <CmsText field="99c36d03e071e6e7" fallback="Currency:"/></div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
              {(["USD", "EUR", "GBP", "NGN"] as Currency[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  style={{
                    padding: "8px 4px",
                    fontSize: "12px",
                    fontWeight: 600,
                    borderRadius: "3px",
                    border: currency === c ? "2px solid #123d32" : "1px solid #d4cdc5",
                    background: currency === c ? "#123d32" : "#fff",
                    color: currency === c ? "#fff" : "#111",
                    cursor: "pointer",
                  }}
                >
                  {CURRENCY_CONFIG[c].symbol} {c}
                </button>
              ))}
            </div>
          </div>

          <CmsLink href="/cart" onClick={() => setMobileMenuOpen(false)} hrefKey="56a5e94ad36096e2">
            <CmsText field="36a07524d2c12db6" fallback="Your Bag ("/>{cartCount}<CmsText field="1702eaab6ee0d6e8" fallback=")"/></CmsLink>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setDesignerChatOpen(true);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#123d32",
              fontWeight: 700,
            }}
          >
            <MessageSquare size={16} /> <CmsText field="fb833e7dfaeafae0" fallback="Chat with the Dioka team"/></button>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setOrderTrackingOpen(true);
            }}
          >
            <CmsText field="a7782f0d893817a9" fallback="Track Your Order"/></button>
        </nav>
      )}
    </>
  );
}
