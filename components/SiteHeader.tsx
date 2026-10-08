"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Menu,
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
    wishlist,
    currency,
    setCurrency,
    setOrderTrackingOpen,
    user,
    isAuthenticated,
    setAccountModalOpen,
    setAccountModalTab,
  } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="announcement">
        <span>
          FREE WORLDWIDE EXPRESS DELIVERY · 30-DAY COMPLIMENTARY RETURNS · HANDCRAFTED IN ATELIER
        </span>
        <span>
          <button
            type="button"
            onClick={() => setOrderTrackingOpen(true)}
            style={{
              background: "none",
              border: 0,
              color: "#fff",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: 600,
              padding: 0,
              letterSpacing: ".06em",
            }}
          >
            Track Order
          </button>
        </span>
      </div>

      {/* 2. MAIN HEADER (Clean, spacious, professional Italian atelier layout) */}
      <header className="site-header">
        {/* Navigation: Exactly Bags, Shoes & Boots, Jacket, Dioka */}
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
            href="/"
            className={isActive("/") ? "active" : ""}
            style={{
              fontWeight: isActive("/") ? 700 : 500,
              color: isActive("/") ? "#123d32" : undefined,
              textDecoration: isActive("/") ? "underline" : undefined,
              textUnderlineOffset: "6px",
            }}
          >
            Dioka
          </Link>
        </nav>

        {/* Center Wordmark Logo */}
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

          {/* Wishlist button */}
          <button
            type="button"
            className="wishlist-trigger"
            onClick={() => setCartOpen(true)}
            aria-label={`Favorites with ${wishlist.length} items`}
            title="View saved favorites"
          >
            <Heart
              size={18}
              strokeWidth={1.8}
              fill={wishlist.length > 0 ? "currentColor" : "none"}
            />
            <span>{wishlist.length}</span>
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
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>
            Dioka
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
