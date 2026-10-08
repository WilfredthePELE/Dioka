"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Lock,
  Minus,
  Plus,
  RotateCcw,
  Shield,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useStore } from "@/lib/store-context";

export default function CartPage() {
  const {
    catalog,
    cart,
    cartCount,
    subtotal,
    formatPrice,
    changeQuantity,
    removeFromCart,
    setCheckoutModalOpen,
    user,
    isAuthenticated,
    setAccountModalOpen,
    setAccountModalTab,
    isCartSyncing,
  } = useStore();

  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "WELCOME15") {
      setDiscountPercent(15);
      setPromoMessage("15% discount applied!");
    } else {
      setPromoMessage("Invalid code. Try WELCOME15 for 15% off.");
    }
  };

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const finalTotal = subtotal - discountAmount;

  return (
    <main>
      <SiteHeader />

      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 5% 80px" }}>
        <h1 style={{ fontFamily: "var(--dioka-font)", fontSize: "clamp(36px, 5vw, 56px)", margin: "0 0 8px", color: "#123d32" }}>
          Your Bag
        </h1>
        <p style={{ color: "#666", fontSize: "16px", margin: "0 0 32px" }}>
          {cartCount} {cartCount === 1 ? "handcrafted leather piece" : "handcrafted leather pieces"} in your bag.
        </p>

        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 20px", background: "#f8f7f3", border: "1px solid #e2ddd5" }}>
            <ShoppingBag size={48} color="#123d32" style={{ margin: "0 auto 16px" }} />
            <h2 style={{ fontFamily: "var(--dioka-font)", fontSize: "28px", color: "#123d32", margin: "0 0 8px" }}>
              Your bag is empty
            </h2>
            <p style={{ color: "#666", maxWidth: "460px", margin: "0 auto 24px" }}>
              Explore our genuine leather shoulder bags, boots, and lambskin jackets handcrafted in Europe.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/bags" className="dark-button" style={{ textDecoration: "none" }}>
                Shop Bags <ArrowRight size={16} />
              </Link>
              <Link href="/footwear" className="dark-button" style={{ textDecoration: "none", background: "#5b1f2b" }}>
                Shop Shoes & Boots <ArrowRight size={16} />
              </Link>
              <Link href="/jackets" className="dark-button" style={{ textDecoration: "none", background: "#1a2e28" }}>
                Shop Jackets <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "48px", alignItems: "start" }}>
            {/* Left Column: Cart Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Specialized Cart Status Indicator */}
              {isAuthenticated && user ? (
                <div
                  style={{
                    padding: "16px 20px",
                    background: "#f4f7f5",
                    border: "1px solid #c9d8d0",
                    borderRadius: "3px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "16px", color: "#123d32" }}>✦</span>
                      <strong style={{ fontSize: "15px", color: "#123d32" }}>
                        {user.name}’s Specialized Bag
                      </strong>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          background: "#123d32",
                          color: "#fff",
                          borderRadius: "2px",
                          letterSpacing: ".06em",
                        }}
                      >
                        {isCartSyncing ? "SAVING..." : "CLOUD SYNCHRONIZED"}
                      </span>
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#555" }}>
                      All {cartCount} items are safely linked to your personal Dioka account ({user.email}).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountModalTab("profile");
                      setAccountModalOpen(true);
                    }}
                    style={{
                      fontSize: "12px",
                      color: "#123d32",
                      fontWeight: 700,
                      background: "#fff",
                      border: "1px solid #123d32",
                      padding: "8px 14px",
                      borderRadius: "2px",
                      cursor: "pointer",
                    }}
                  >
                    Manage Account
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    padding: "16px 20px",
                    background: "#faf8f5",
                    border: "1px dashed #d8cebe",
                    borderRadius: "3px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <strong style={{ fontSize: "14px", color: "#123d32" }}>
                      Save your specialized bag to your personal account
                    </strong>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#666" }}>
                      Sign up or log in so your chosen items remain permanently saved across all your devices.
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setAccountModalTab("login");
                        setAccountModalOpen(true);
                      }}
                      style={{
                        fontSize: "12px",
                        color: "#123d32",
                        fontWeight: 700,
                        background: "none",
                        border: "1px solid #123d32",
                        padding: "7px 14px",
                        borderRadius: "2px",
                        cursor: "pointer",
                      }}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAccountModalTab("register");
                        setAccountModalOpen(true);
                      }}
                      style={{
                        fontSize: "12px",
                        color: "#fff",
                        fontWeight: 700,
                        background: "#123d32",
                        border: 0,
                        padding: "7px 14px",
                        borderRadius: "2px",
                        cursor: "pointer",
                      }}
                    >
                      Create Account
                    </button>
                  </div>
                </div>
              )}
              {cart.map((item) => {
                const product = catalog.find((p) => p.id === item.id);
                if (!product) return null;
                const maxQty = product.stockQuantity ?? 10;

                return (
                  <div
                    key={item.id + item.size}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "110px 1fr auto",
                      gap: "20px",
                      padding: "20px",
                      background: "#fff",
                      border: "1px solid #e2ddd5",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ position: "relative", width: "110px", height: "110px", background: "#ede6dc" }}>
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="110px"
                        style={{ objectFit: "cover", objectPosition: product.position }}
                      />
                    </div>

                    <div>
                      <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#5b1f2b" }}>
                        {product.category}
                      </span>
                      <Link href={`/products/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        <h3 style={{ margin: "4px 0 6px", fontSize: "18px", color: "#123d32" }}>{product.name}</h3>
                      </Link>
                      <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#666" }}>
                        Size: <strong>{item.size}</strong> · Color: {product.color}
                      </p>

                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div className="quantity" style={{ margin: 0 }}>
                          <button
                            type="button"
                            onClick={() => changeQuantity(item.id, item.size, -1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => changeQuantity(item.id, item.size, 1)}
                            disabled={item.quantity >= maxQty}
                            aria-label="Increase quantity"
                            style={{ opacity: item.quantity >= maxQty ? 0.4 : 1 }}
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id, item.size)}
                          style={{
                            background: "none",
                            border: 0,
                            color: "#888",
                            cursor: "pointer",
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "18px", fontWeight: 700, color: "#123d32" }}>
                        {formatPrice(product.price * item.quantity)}
                      </span>
                      {item.quantity > 1 && (
                        <small style={{ display: "block", fontSize: "12px", color: "#888" }}>
                          ({formatPrice(product.price)} each)
                        </small>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Order Summary */}
            <div style={{ background: "#f8f7f3", border: "1px solid #e2ddd5", padding: "28px" }}>
              <h2 style={{ fontFamily: "var(--dioka-font)", fontSize: "24px", color: "#123d32", margin: "0 0 20px" }}>
                Order Summary
              </h2>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "15px" }}>
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>

              {discountPercent > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", color: "#166534", fontSize: "15px" }}>
                  <span>Promo Discount ({discountPercent}%)</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", color: "#166534", fontSize: "15px" }}>
                <span>Worldwide Express Delivery</span>
                <span>FREE</span>
              </div>

              {/* Promo code form */}
              <form onSubmit={applyPromo} style={{ display: "flex", gap: "8px", margin: "16px 0" }}>
                <input
                  type="text"
                  placeholder="Promo Code (WELCOME15)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  style={{ flex: 1, padding: "10px", border: "1px solid #d8e0d9", fontSize: "13px" }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "10px 16px",
                    background: "#123d32",
                    color: "#fff",
                    border: 0,
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Apply
                </button>
              </form>
              {promoMessage && (
                <p style={{ fontSize: "12px", color: discountPercent > 0 ? "#166534" : "#b91c1c", margin: "0 0 16px" }}>
                  {promoMessage}
                </p>
              )}

              <div style={{ borderTop: "2px solid #123d32", paddingTop: "16px", marginTop: "16px", display: "flex", justifyContent: "space-between", fontSize: "20px", fontWeight: 700 }}>
                <span>Total</span>
                <span style={{ color: "#123d32" }}>{formatPrice(finalTotal)}</span>
              </div>

              <button
                type="button"
                className="dark-button"
                onClick={() => setCheckoutModalOpen(true)}
                style={{ width: "100%", justifyContent: "center", marginTop: "24px", padding: "16px", fontSize: "14px" }}
              >
                Proceed to Checkout <Lock size={16} style={{ marginLeft: "8px" }} />
              </button>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "20px", fontSize: "12px", color: "#666" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Truck size={14} color="#123d32" /> Free courier express shipping included
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <RotateCcw size={14} color="#123d32" /> 30-Day hassle-free return window
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Shield size={14} color="#123d32" /> 2-Year craftsmanship guarantee
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
