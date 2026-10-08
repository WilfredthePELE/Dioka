"use client";

import React, { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Check,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Shield,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useStore } from "@/lib/store-context";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const {
    catalog,
    formatPrice,
    addToCart,
    wishlist,
    toggleWishlist,
    setSizeGuideOpen,
    setCheckoutModalOpen,
  } = useStore();

  const product = catalog.find((p) => p.id === productId);

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"overview" | "features" | "materials" | "care">("overview");

  if (!product) {
    return notFound();
  }

  const currentSize = selectedSize || product.sizes[0] || "One size";
  const inStock = (product.stockQuantity ?? 10) > 0;
  const isWishlisted = wishlist.includes(product.id);

  // Category link helper
  const categoryLink =
    product.category === "Bags"
      ? "/bags"
      : product.category === "Footwear"
      ? "/footwear"
      : "/jackets";

  const categoryLabel =
    product.category === "Footwear"
      ? "Shoes & Boots"
      : product.category;

  // Related products
  const related = catalog
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  const handleBuyNow = () => {
    addToCart(product, currentSize, quantity);
    setCheckoutModalOpen(true);
  };

  return (
    <main>
      <SiteHeader />

      {/* Breadcrumb Navigation */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "16px 5% 0" }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: "12px", color: "#888", display: "flex", alignItems: "center", gap: "8px" }}>
          <Link href="/" style={{ color: "#666", textDecoration: "none" }}>
            Home
          </Link>
          <span>/</span>
          <Link href={categoryLink} style={{ color: "#666", textDecoration: "none" }}>
            {categoryLabel}
          </Link>
          <span>/</span>
          <span style={{ color: "#123d32", fontWeight: 700 }}>{product.name}</span>
        </nav>
      </div>

      {/* Main Product Layout */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 5% 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "48px" }}>
          {/* Left Column: Product Imagery */}
          <div>
            <div
              style={{
                position: "relative",
                aspectRatio: "1/1",
                width: "100%",
                background: "#ede6dc",
                border: "1px solid #e2ddd5",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: "cover", objectPosition: product.position }}
              />
              <span
                style={{
                  position: "absolute",
                  top: "16px",
                  left: "16px",
                  background: "#123d32",
                  color: "#fff",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  padding: "6px 14px",
                  borderRadius: "999px",
                }}
              >
                GENUINE EUROPEAN LEATHER
              </span>
            </div>

            {/* Quality Badges */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "20px" }}>
              <div style={{ background: "#f8f7f3", padding: "14px", border: "1px solid #e2ddd5", borderRadius: "4px", display: "flex", gap: "10px", alignItems: "center" }}>
                <Sparkles size={20} color="#123d32" />
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#123d32" }}>
                  100% Genuine Full-Grain Leather
                </span>
              </div>
              <div style={{ background: "#f8f7f3", padding: "14px", border: "1px solid #e2ddd5", borderRadius: "4px", display: "flex", gap: "10px", alignItems: "center" }}>
                <Truck size={20} color="#123d32" />
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#123d32" }}>
                  Free Worldwide Express Shipping
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Purchase */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#5b1f2b" }}>
                {categoryLabel} · {product.color}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "13px", color: "#5b1f2b", fontWeight: 700 }}>
                <Star size={14} fill="#5b1f2b" /> {product.rating ?? 4.9} ({product.reviews ?? 32} reviews)
              </div>
            </div>

            <h1 style={{ fontFamily: "var(--dioka-font)", fontSize: "clamp(32px, 4vw, 48px)", lineHeight: "1.0", margin: "0 0 12px", color: "#123d32" }}>
              {product.name}
            </h1>

            <p style={{ fontSize: "28px", fontWeight: 700, color: "#5b1f2b", margin: "0 0 16px", fontFamily: "var(--dioka-sans)" }}>
              {formatPrice(product.price)}
            </p>

            <p style={{ fontSize: "16px", color: "#555", lineHeight: "1.6", margin: "0 0 24px" }}>
              {product.description}
            </p>

            {/* In stock badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 600, color: "#166534", marginBottom: "24px" }}>
              <Check size={18} /> In Stock · Ships within 24 hours via express courier
            </div>

            {/* Color specification */}
            <div style={{ marginBottom: "20px" }}>
              <span style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#333", marginBottom: "6px" }}>
                Color: <strong>{product.color}</strong>
              </span>
              <span style={{ display: "inline-block", padding: "6px 14px", background: "#f8f7f3", border: "1px solid #123d32", fontSize: "12px", fontWeight: 600, color: "#123d32" }}>
                {product.color} (Natural Vegetable Tanned)
              </span>
            </div>

            {/* Size Selector */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#333" }}>
                  {product.sizes.length === 1 ? "Size: One Size" : "Select Your Size:"}
                </span>
                {product.category !== "Bags" && (
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen(true)}
                    style={{ background: "none", border: 0, textDecoration: "underline", color: "#123d32", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}
                  >
                    Size Guide
                  </button>
                )}
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {product.sizes.map((s) => {
                  const isSelected = currentSize === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      style={{
                        padding: "10px 20px",
                        border: isSelected ? "2px solid #123d32" : "1px solid #d8e0d9",
                        background: isSelected ? "#123d32" : "#fff",
                        color: isSelected ? "#fff" : "#123d32",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                        borderRadius: "2px",
                        transition: "all .15s",
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity and Action Buttons */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" }}>
              {/* Quantity selector */}
              <div className="quantity" style={{ margin: 0, height: "50px" }}>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span style={{ minWidth: "32px", textAlign: "center", fontWeight: 700 }}>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min((product.stockQuantity ?? 10), q + 1))}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add to Bag Button */}
              <button
                type="button"
                className="dark-button"
                disabled={!inStock}
                onClick={() => addToCart(product, currentSize, quantity)}
                style={{ flex: 1, height: "50px", justifyContent: "center", cursor: "pointer", fontSize: "14px" }}
              >
                <ShoppingBag size={18} style={{ marginRight: "8px" }} />
                Add to Bag — {formatPrice(product.price * quantity)}
              </button>

              {/* Wishlist button */}
              <button
                type="button"
                onClick={(e) => toggleWishlist(product.id, e)}
                style={{
                  width: "50px",
                  height: "50px",
                  border: "1px solid #d8e0d9",
                  background: isWishlisted ? "#5b1f2b" : "#fff",
                  color: isWishlisted ? "#fff" : "#5b1f2b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title={isWishlisted ? "Remove from favorites" : "Save to favorites"}
              >
                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Express Buy Now Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              style={{
                width: "100%",
                padding: "14px",
                background: "#f4ede3",
                border: "1px solid #123d32",
                color: "#123d32",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                cursor: "pointer",
                marginBottom: "28px",
              }}
            >
              Instant Express Checkout →
            </button>

            {/* Assurance Guarantees */}
            <div style={{ borderTop: "1px solid #e2ddd5", paddingTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px", color: "#555" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <RotateCcw size={16} color="#123d32" /> 30-Day Hassle-Free Returns
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Shield size={16} color="#123d32" /> 2-Year Craftsmanship Guarantee
              </div>
            </div>

            {/* Product Specifications Tabs */}
            <div style={{ marginTop: "36px", borderTop: "1px solid #e2ddd5", paddingTop: "28px" }}>
              <div style={{ display: "flex", gap: "16px", borderBottom: "1px solid #e2ddd5", marginBottom: "16px", flexWrap: "wrap" }}>
                {(
                  [
                    { id: "overview", label: "Overview" },
                    { id: "features", label: "Key Features" },
                    { id: "materials", label: "Materials & Specs" },
                    { id: "care", label: "Care Instructions" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    style={{
                      background: "none",
                      border: 0,
                      borderBottom: activeTab === t.id ? "2px solid #123d32" : "2px solid transparent",
                      color: activeTab === t.id ? "#123d32" : "#888",
                      fontWeight: activeTab === t.id ? 700 : 500,
                      paddingBottom: "10px",
                      cursor: "pointer",
                      fontSize: "13px",
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div>
                {activeTab === "overview" && (
                  <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.7", color: "#555" }}>
                    {product.subtitle}. {product.description}
                  </p>
                )}

                {activeTab === "features" && (
                  <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "14px", lineHeight: "1.7", color: "#555" }}>
                    {product.details?.map((detail, idx) => (
                      <li key={idx} style={{ marginBottom: "6px" }}>
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}

                {activeTab === "materials" && (
                  <div style={{ fontSize: "14px", lineHeight: "1.7", color: "#555" }}>
                    <p style={{ margin: "0 0 8px" }}>
                      <strong>Leather & Hardware:</strong> {product.materials}
                    </p>
                    {product.dimensions && (
                      <p style={{ margin: 0 }}>
                        <strong>Dimensions & Fit:</strong> {product.dimensions}
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "care" && (
                  <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.7", color: "#555" }}>
                    {product.care}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 5% 64px" }}>
          <div style={{ borderTop: "1px solid #e2ddd5", paddingTop: "48px" }}>
            <p className="eyebrow" style={{ color: "#5b1f2b" }}>
              MORE IN {categoryLabel.toUpperCase()}
            </p>
            <h3 style={{ fontFamily: "var(--dioka-font)", fontSize: "32px", color: "#123d32", margin: "8px 0 28px" }}>
              You may also like
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
              {related.map((item) => (
                <article key={item.id} className="product-card">
                  <Link
                    href={`/products/${item.id}`}
                    className="product-image-button"
                    style={{ display: "block", textDecoration: "none" }}
                  >
                    <Image src={item.image} alt={item.name} fill sizes="33vw" style={{ objectPosition: item.position }} />
                  </Link>

                  <div className="product-meta">
                    <div className="product-meta-main">
                      <Link href={`/products/${item.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        <h3 style={{ margin: 0 }}>{item.name}</h3>
                      </Link>
                      <span>{formatPrice(item.price)}</span>
                    </div>
                    <p className="product-meta-sub">{item.subtitle}</p>
                    <button
                      type="button"
                      className="card-add-to-bag-btn"
                      onClick={() => addToCart(item)}
                      style={{ marginTop: "12px", width: "100%", justifyContent: "center" }}
                    >
                      <ShoppingBag size={14} /> Add to Bag — {formatPrice(item.price)}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}
