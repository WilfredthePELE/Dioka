"use client";

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
      {/* MAIN HEADER (Clean white background) */}
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

          <Link
            href="/bags"
            className={isActive("/bags") ? "active" : ""}
            style={{
              fontWeight: isActive("/bags") ? 700 : 500,
              color: isActive("/bags") ? "#123d32" : undefined,
              textDecoration: isActive("/bags") ? "underline" : undefined,
              textUnderlineOffset: "6px",
            }}
          >
            Bags
          </Link>

          <Link
            href="/footwear"
            className={isActive("/footwear") ? "active" : ""}
            style={{
              fontWeight: isActive("/footwear") ? 700 : 500,
              color: isActive("/footwear") ? "#123d32" : undefined,
              textDecoration: isActive("/footwear") ? "underline" : undefined,
              textUnderlineOffset: "6px",
            }}
          >
            Shoes & Boots
          </Link>

          <Link
            href="/jackets"
            className={isActive("/jackets") ? "active" : ""}
            style={{
              fontWeight: isActive("/jackets") ? 700 : 500,
              color: isActive("/jackets") ? "#123d32" : undefined,
              textDecoration: isActive("/jackets") ? "underline" : undefined,
              textUnderlineOffset: "6px",
            }}
          >
            Jacket
          </Link>

          <Link
            href="/customize"
            className={isActive("/customize") ? "active" : ""}
            style={{
              fontWeight: isActive("/customize") ? 700 : 500,
              color: isActive("/customize") ? "#123d32" : undefined,
              textDecoration: isActive("/customize") ? "underline" : undefined,
              textUnderlineOffset: "6px",
            }}
          >
            Customize
          </Link>
        </nav>

        {/* Center Wordmark Logo (The only Dioka brand mark) */}
        <Link className="wordmark" href="/" aria-label="Dioka home">
          DIOKA<span>®</span>
        </Link>

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


          {/* Master Designer Consultation Chatbox Icon */}
          <button
            type="button"
            className="designer-chat-trigger"
            onClick={() => setDesignerChatOpen(!designerChatOpen)}
            aria-label="Chat with Master Designer"
            title="Chat with Master Designer Wilfred Owubokiri"
            style={{
              position: "relative",
              background: designerChatOpen ? "rgba(18, 61, 50, 0.12)" : "none",
              border: designerChatOpen ? "1px solid rgba(18, 61, 50, 0.3)" : "1px solid transparent",
              color: "#123d32",
              cursor: "pointer",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "2px",
            }}
          >
            <MessageSquare size={18} strokeWidth={1.8} />
            <span
              style={{
                position: "absolute",
                top: "3px",
                right: "3px",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#22c55e",
                border: "1px solid #ffffff",
              }}
              title="Master Designer Online"
            />
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
            <span>Bag ({cartCount})</span>
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
          <Link href="/bags" onClick={() => setMobileMenuOpen(false)}>
            Bags
          </Link>
          <Link href="/footwear" onClick={() => setMobileMenuOpen(false)}>
            Shoes & Boots
          </Link>
          <Link href="/jackets" onClick={() => setMobileMenuOpen(false)}>
            Jacket
          </Link>
          <Link href="/customize" onClick={() => setMobileMenuOpen(false)}>
            Customize
          </Link>

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
              Currency:
            </div>

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

          <Link href="/cart" onClick={() => setMobileMenuOpen(false)}>
            Your Bag ({cartCount})
          </Link>
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
            <MessageSquare size={16} /> Chat with Master Designer
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setOrderTrackingOpen(true);
            }}
          >
            Track Your Order
          </button>
        </nav>
      )}
    </>
  );
}
