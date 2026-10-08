"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Lock,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Star,
  Trash2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store-context";
import { AccountModal } from "@/components/AccountModal";
import { SupabaseModal } from "@/components/SupabaseModal";
import { CurrencyConverterModal } from "@/components/CurrencyConverterModal";
import { syncOrderToSupabase } from "@/lib/supabase";

export function GlobalModals() {
  const router = useRouter();
  const {
    catalog,
    cart,
    cartCount,
    subtotal,
    currency,
    formatPrice,
    cartOpen,
    setCartOpen,
    changeQuantity,
    removeFromCart,
    clearCart,
    addToCart,
    toast,
    selectedProduct,
    setSelectedProduct,
    orderTrackingOpen,
    setOrderTrackingOpen,
    sizeGuideOpen,
    setSizeGuideOpen,
    checkoutModalOpen,
    setCheckoutModalOpen,
    user,
    isAuthenticated,
    setAccountModalOpen,
    setAccountModalTab,
    isCartSyncing,
    supabaseModalOpen,
    setSupabaseModalOpen,
    currencyConverterModalOpen,
    setCurrencyConverterModalOpen,
  } = useStore();

  const [modalSize, setModalSize] = useState("");
  const [modalQuantity, setModalQuantity] = useState(1);

  // Tracking modal form
  const [trackingCode, setTrackingCode] = useState("");
  const [trackingResult, setTrackingResult] = useState<string | null>(null);

  // Checkout modal form
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    name: "Wilfred Owubokiri",
    email: "wilfred@example.com",
    address: "42 Savile Row",
    city: "London",
    state: "Westminster",
    zip: "W1S 2ER",
    country: "United Kingdom",
  });

  const activeName = user?.name || checkoutForm.name;
  const activeEmail = user?.email || checkoutForm.email;
  const activeAddress = user?.shippingAddress?.street || checkoutForm.address;
  const activeCity = user?.shippingAddress?.city || checkoutForm.city;
  const activeZip = user?.shippingAddress?.postalCode || checkoutForm.zip;
  const activeCountry = user?.shippingAddress?.country || checkoutForm.country;

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;
    setTrackingResult(
      `Order ${trackingCode.trim().toUpperCase()}: In transit via Express Courier. Out for delivery in 2 business days. Tracking details updated.`
    );
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutBusy(true);

    try {
      // Record order in backend
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          subtotal,
          total: subtotal,
          currency: "USD",
          shippingAddress: {
            fullName: activeName,
            street: activeAddress,
            city: activeCity,
            postalCode: activeZip,
            country: activeCountry,
          },
        }),
      });

      let orderRef = `DIOKA-${Math.floor(100000 + Math.random() * 900000)}`;
      if (res.ok) {
        const data = await res.json();
        if (data.order?.orderId) orderRef = data.order.orderId;
        else if (data.orderId) orderRef = data.orderId;
      }

      // Sync completed order to Supabase if configured
      syncOrderToSupabase({
        orderId: orderRef,
        userId: user?.id,
        customerName: activeName,
        customerEmail: activeEmail,
        shippingAddress: `${activeAddress}, ${activeCity}, ${activeZip}, ${activeCountry}`,
        items: cart,
        total: subtotal,
        currency,
      }).catch(() => {});

      const totalFormatted = formatPrice(subtotal);
      clearCart();
      setCheckoutBusy(false);
      setCheckoutModalOpen(false);
      router.push(
        `/order-confirmation?order_id=${orderRef}&name=${encodeURIComponent(
          activeName
        )}&email=${encodeURIComponent(activeEmail)}&total=${encodeURIComponent(
          totalFormatted
        )}&items_count=${cartCount}`
      );
    } catch {
      const orderRef = `DIOKA-${Math.floor(100000 + Math.random() * 900000)}`;
      const totalFormatted = formatPrice(subtotal);
      clearCart();
      setCheckoutBusy(false);
      setCheckoutModalOpen(false);
      router.push(
        `/order-confirmation?order_id=${orderRef}&name=${encodeURIComponent(
          activeName
        )}&email=${encodeURIComponent(activeEmail)}&total=${encodeURIComponent(
          totalFormatted
        )}&items_count=${cartCount}`
      );
    }
  };

  return (
    <>
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            zIndex: 9999,
            background: "#123d32",
            color: "#fff",
            padding: "14px 22px",
            borderRadius: "999px",
            boxShadow: "0 12px 36px rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          <Check size={18} color="#fff" />
          {toast}
        </div>
      )}

      {/* SHOPPING BAG DRAWER */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="cart-sheet" showCloseButton={true}>
          <div className="cart-header">
            <p className="eyebrow">YOUR SHOPPING BAG</p>
            <SheetTitle>
              Your Bag <span>({cartCount} {cartCount === 1 ? "item" : "items"})</span>
            </SheetTitle>
            <SheetDescription>Review your leather items and proceed to express checkout.</SheetDescription>

            {/* Specialized Cart Status Box */}
            {isAuthenticated && user ? (
              <div
                style={{
                  marginTop: "12px",
                  padding: "8px 12px",
                  backgroundColor: "#f4f7f5",
                  border: "1px solid #d1ded7",
                  borderRadius: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#123d32", fontWeight: 600 }}>
                  <span style={{ fontSize: "14px" }}>✦</span>
                  <span>{user.name.split(" ")[0]}’s Specialized Bag</span>
                </div>
                <span style={{ fontSize: "11px", color: isCartSyncing ? "#888" : "#166534", fontWeight: 500 }}>
                  {isCartSyncing ? "Syncing..." : "✓ Cloud Synced"}
                </span>
              </div>
            ) : (
              <div
                onClick={() => {
                  setCartOpen(false);
                  setAccountModalTab("register");
                  setAccountModalOpen(true);
                }}
                style={{
                  marginTop: "12px",
                  padding: "8px 12px",
                  backgroundColor: "#faf8f5",
                  border: "1px dashed #d8cebe",
                  borderRadius: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  color: "#123d32",
                  cursor: "pointer",
                }}
                title="Create an account to have your own specialized bag"
              >
                <span>Save this bag to your personal account</span>
                <span style={{ fontWeight: 700, textDecoration: "underline" }}>Sign Up →</span>
              </div>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={42} strokeWidth={1} color="#123d32" />
              <h3>Your bag is currently empty</h3>
              <p>Discover our handcrafted European leather bags, shoes, and jackets.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: "260px" }}>
                <Link
                  href="/bags"
                  onClick={() => setCartOpen(false)}
                  className="dark-button"
                  style={{ textDecoration: "none", textAlign: "center" }}
                >
                  Shop Bags <ArrowRight size={16} />
                </Link>
                <Link
                  href="/"
                  onClick={() => setCartOpen(false)}
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "12px",
                    border: "1px solid #123d32",
                    color: "#123d32",
                    fontSize: "12px",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Browse All Products
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => {
                  const product = catalog.find((p) => p.id === item.id);
                  if (!product) return null;
                  const maxQty = product.stockQuantity ?? 10;
                  return (
                    <div className="cart-item" key={item.id + item.size}>
                      <div className="cart-item-image">
                        <Image src={product.image} alt={product.name} fill sizes="100px" style={{ objectPosition: product.position }} />
                      </div>
                      <div className="cart-item-info">
                        <p>{product.category}</p>
                        <Link
                          href={`/products/${product.id}`}
                          onClick={() => setCartOpen(false)}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <h3 style={{ margin: "2px 0 4px" }}>{product.name}</h3>
                        </Link>
                        <span>
                          Size: {item.size} · {product.color}
                        </span>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "12px" }}>
                          <div className="quantity">
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
                              padding: "4px",
                            }}
                            title="Remove from bag"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      <strong>{formatPrice(product.price * item.quantity)}</strong>
                    </div>
                  );
                })}
              </div>

              <div className="cart-summary">
                <div className="cart-summary-line">
                  <span>Subtotal</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>

                <div className="cart-shipping-notice">
                  <Check size={14} color="#123d32" /> Free Worldwide Express Shipping Included
                </div>

                <button
                  type="button"
                  className="dark-button checkout-button"
                  onClick={() => {
                    setCartOpen(false);
                    setCheckoutModalOpen(true);
                  }}
                  style={{ cursor: "pointer", width: "100%", justifyContent: "center" }}
                >
                  Proceed to Checkout <ArrowRight size={17} />
                </button>

                <div style={{ textAlign: "center", marginTop: "10px" }}>
                  <Link
                    href="/cart"
                    onClick={() => setCartOpen(false)}
                    style={{ fontSize: "12px", color: "#666", textDecoration: "underline" }}
                  >
                    View Full Bag Page
                  </Link>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* QUICK VIEW PRODUCT MODAL */}
      <Dialog
        open={selectedProduct !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedProduct(null);
        }}
      >
        <DialogContent className="product-dialog" showCloseButton={true}>
          {selectedProduct && (
            <>
              <div className="dialog-image">
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  fill
                  sizes="(max-width: 760px) 100vw, 50vw"
                  style={{ objectPosition: selectedProduct.position }}
                />
              </div>

              <div className="dialog-info">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p className="eyebrow">
                    {selectedProduct.category === "Footwear" ? "Shoes & Boots" : selectedProduct.category} · {selectedProduct.color}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "12px", color: "#5b1f2b", fontWeight: 700 }}>
                    <Star size={13} fill="#5b1f2b" /> {selectedProduct.rating ?? 4.9} ({selectedProduct.reviews ?? 32} reviews)
                  </div>
                </div>

                <DialogTitle>{selectedProduct.name}</DialogTitle>
                <p className="dialog-price">{formatPrice(selectedProduct.price)}</p>
                <DialogDescription>{selectedProduct.description}</DialogDescription>

                {/* Stock indicator */}
                <div style={{ margin: "2px 0 16px", fontSize: "13px", fontWeight: 600 }}>
                  <span style={{ color: "#166534", display: "flex", alignItems: "center", gap: 6 }}>
                    <Check size={16} /> In Stock · Ready to ship today
                  </span>
                </div>

                {/* Size options */}
                <div className="size-heading" style={{ marginTop: "12px" }}>
                  <span>{selectedProduct.sizes.length === 1 ? "SIZE: ONE SIZE" : "SELECT SIZE"}</span>
                  {selectedProduct.category !== "Bags" && (
                    <button
                      type="button"
                      className="size-guide-btn"
                      onClick={() => setSizeGuideOpen(true)}
                    >
                      Size Guide
                    </button>
                  )}
                </div>

                <div className="size-grid">
                  {selectedProduct.sizes.map((s) => {
                    const active = (modalSize || selectedProduct.sizes[0]) === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        className={active ? "selected" : ""}
                        onClick={() => setModalSize(s)}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>

                {/* Quantity and Add to Bag */}
                <div style={{ display: "flex", gap: "10px", marginTop: "18px", alignItems: "center" }}>
                  <div className="quantity" style={{ margin: 0 }}>
                    <button
                      type="button"
                      onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span>{modalQuantity}</span>
                    <button
                      type="button"
                      onClick={() => setModalQuantity((q) => Math.min((selectedProduct.stockQuantity ?? 10), q + 1))}
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="dark-button add-to-bag"
                    style={{ flex: 1, justifyContent: "center" }}
                    onClick={() => {
                      addToCart(selectedProduct, modalSize || selectedProduct.sizes[0], modalQuantity);
                      setSelectedProduct(null);
                    }}
                  >
                    Add to Bag — {formatPrice(selectedProduct.price * modalQuantity)}
                    <ShoppingBag size={17} style={{ marginLeft: "8px" }} />
                  </button>
                </div>

                <div style={{ marginTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Link
                    href={`/products/${selectedProduct.id}`}
                    onClick={() => setSelectedProduct(null)}
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#123d32",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    Open full product page <ArrowRight size={14} />
                  </Link>
                  <span style={{ fontSize: "12px", color: "#666" }}>Free express delivery</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* CHECKOUT MODAL */}
      <Dialog open={checkoutModalOpen} onOpenChange={setCheckoutModalOpen}>
        <DialogContent style={{ maxWidth: "560px", padding: "32px", background: "#fff" }} showCloseButton={true}>
          <DialogTitle style={{ fontFamily: "var(--dioka-font)", fontSize: "30px", color: "#123d32", margin: "0 0 4px" }}>
            Express Checkout
          </DialogTitle>
          <DialogDescription style={{ color: "#666", marginBottom: "20px" }}>
            Complete your order. All items include complimentary express shipping and insurance.
          </DialogDescription>

          <form onSubmit={handleCompleteOrder}>
            <div style={{ display: "grid", gap: "12px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={checkoutForm.name}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #d8e0d9", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={checkoutForm.email}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #d8e0d9", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>
                  Delivery Address
                </label>
                <input
                  type="text"
                  required
                  value={checkoutForm.address}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #d8e0d9", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={checkoutForm.city}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid #d8e0d9", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    value={checkoutForm.zip}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, zip: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid #d8e0d9", fontSize: "14px" }}
                  />
                </div>
              </div>
            </div>

            {/* Payment Summary Box */}
            <div style={{ background: "#f8f7f3", padding: "16px", border: "1px solid #d8e0d9", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span>Items Subtotal ({cartCount})</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", color: "#166534" }}>
                <span>Worldwide Express Delivery</span>
                <span>FREE</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: 700, borderTop: "1px solid #d8e0d9", paddingTop: "8px", marginTop: "8px" }}>
                <span>Total to Pay</span>
                <span style={{ color: "#123d32" }}>{formatPrice(subtotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={checkoutBusy || cart.length === 0}
              className="dark-button"
              style={{ width: "100%", justifyContent: "center", padding: "16px" }}
            >
              {checkoutBusy ? "Processing Order..." : `Place Order · ${formatPrice(subtotal)}`}
              <Lock size={16} style={{ marginLeft: "8px" }} />
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* TRACK ORDER MODAL */}
      <Dialog open={orderTrackingOpen} onOpenChange={setOrderTrackingOpen}>
        <DialogContent style={{ maxWidth: "520px", padding: "32px", background: "#fff" }} showCloseButton={true}>
          <DialogTitle style={{ fontFamily: "var(--dioka-font)", fontSize: "28px", color: "#123d32", margin: "0 0 8px" }}>
            Track Your Order
          </DialogTitle>
          <DialogDescription style={{ color: "#666", marginBottom: "20px" }}>
            Enter your order reference number (e.g. DIOKA-824194) to view real-time delivery and courier status.
          </DialogDescription>

          <form onSubmit={handleTrackOrder} style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <input
              type="text"
              placeholder="e.g. DIOKA-78291"
              required
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              style={{ flex: 1, padding: "12px", border: "1px solid #d8e0d9", fontSize: "14px" }}
            />
            <button type="submit" className="dark-button" style={{ minHeight: "auto", padding: "12px 20px" }}>
              Track
            </button>
          </form>

          {trackingResult && (
            <div style={{ background: "#f8f7f3", border: "1px solid #d8e0d9", padding: "16px", fontSize: "14px", color: "#123d32", lineHeight: "1.5" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "#5b1f2b", marginBottom: 6 }}>
                <Package size={16} /> Status: In Transit
              </div>
              {trackingResult}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* SIZE GUIDE MODAL */}
      <Dialog open={sizeGuideOpen} onOpenChange={setSizeGuideOpen}>
        <DialogContent style={{ maxWidth: "600px", padding: "32px", background: "#fff" }} showCloseButton={true}>
          <DialogTitle style={{ fontFamily: "var(--dioka-font)", fontSize: "28px", color: "#123d32", margin: "0 0 12px" }}>
            Size & Fit Guide
          </DialogTitle>
          <DialogDescription style={{ color: "#666", marginBottom: "20px" }}>
            Our garments and footwear fit true to standard European sizing. If you are between sizes, we recommend sizing up.
          </DialogDescription>

          <h4 style={{ margin: "16px 0 8px", fontSize: "13px", fontWeight: 700, color: "#5b1f2b", textTransform: "uppercase", letterSpacing: ".08em" }}>
            Footwear Size Conversion
          </h4>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginBottom: "24px" }}>
            <thead>
              <tr style={{ background: "#f8f7f3", borderBottom: "1px solid #d8e0d9", textAlign: "left" }}>
                <th style={{ padding: "8px" }}>EU Size</th>
                <th style={{ padding: "8px" }}>US Men</th>
                <th style={{ padding: "8px" }}>US Women</th>
                <th style={{ padding: "8px" }}>Foot Length</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "8px" }}>EU 38</td><td>5.5</td><td>7.5</td><td>24.5 cm</td></tr>
              <tr style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "8px" }}>EU 39</td><td>6.5</td><td>8.5</td><td>25.1 cm</td></tr>
              <tr style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "8px" }}>EU 40</td><td>7.5</td><td>9.5</td><td>25.8 cm</td></tr>
              <tr style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "8px" }}>EU 41</td><td>8.5</td><td>10.5</td><td>26.5 cm</td></tr>
              <tr style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "8px" }}>EU 42</td><td>9.0</td><td>11.0</td><td>27.1 cm</td></tr>
              <tr style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "8px" }}>EU 43</td><td>10.0</td><td>12.0</td><td>27.8 cm</td></tr>
              <tr style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "8px" }}>EU 44</td><td>11.0</td><td>13.0</td><td>28.5 cm</td></tr>
              <tr><td style={{ padding: "8px" }}>EU 45</td><td>12.0</td><td>14.0</td><td>29.2 cm</td></tr>
            </tbody>
          </table>
        </DialogContent>
      </Dialog>

      {/* USER ACCOUNT MODAL (SIGN IN / SIGN UP / SPECIALIZED BAG) */}
      <AccountModal />

      {/* SUPABASE BACKEND INTEGRATION MODAL */}
      <SupabaseModal open={supabaseModalOpen} onOpenChange={setSupabaseModalOpen} />

      {/* REAL-TIME CURRENCY CONVERTER MODAL */}
      <CurrencyConverterModal
        open={currencyConverterModalOpen}
        onOpenChange={setCurrencyConverterModalOpen}
      />
    </>
  );
}
