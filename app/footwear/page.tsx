"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Eye,
  Heart,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useStore } from "@/lib/store-context";

export default function FootwearPage() {
  const {
    catalog,
    formatPrice,
    addToCart,
    wishlist,
    toggleWishlist,
    setSelectedProduct,
    setSizeGuideOpen,
  } = useStore();

  const [cardSizes, setCardSizes] = useState<Record<string, string>>({});

  const shoes = catalog.filter((p) => p.category === "Footwear");

  return (
    <main>
      <SiteHeader />

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "16px 5% 0" }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: "12px", color: "#888", display: "flex", gap: "8px" }}>
          <Link href="/" style={{ color: "#666", textDecoration: "none" }}>
            Home
          </Link>
          <span>/</span>
          <span style={{ color: "#123d32", fontWeight: 700 }}>Shoes & Boots</span>
        </nav>
      </div>

      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 5% 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px", borderBottom: "1px solid #e2ddd5", paddingBottom: "32px" }}>
          <div style={{ maxWidth: "680px" }}>
            <p className="eyebrow" style={{ color: "#5b1f2b", marginBottom: "8px" }}>
              COLLECTION · CUSHIONED ARCH SUPPORT
            </p>
            <h1 style={{ fontFamily: "var(--dioka-font)", fontSize: "clamp(38px, 5vw, 64px)", lineHeight: "0.95", margin: "0 0 16px", color: "#123d32", fontWeight: 600 }}>
              Shoes & Boots
            </h1>
            <p style={{ fontSize: "17px", color: "#596f64", lineHeight: "1.5", margin: 0 }}>
              Classic Chelsea boots, stacked heeled boots, and Goodyear-welted derby shoes. Designed with multi-density cushioned footbeds for zero-break-in everyday comfort.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", fontWeight: 600, color: "#123d32" }}>
            <button
              type="button"
              onClick={() => setSizeGuideOpen(true)}
              style={{ background: "none", border: 0, textDecoration: "underline", color: "#123d32", cursor: "pointer", textAlign: "left", padding: 0 }}
            >
              View Size & Fit Guide →
            </button>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Check size={16} color="#166534" /> True to Standard EU Sizing
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Truck size={16} color="#166534" /> Free Exchanges & Returns
            </span>
          </div>
        </div>

        {/* Shoes Grid */}
        <div className="product-grid" style={{ marginTop: "36px" }}>
          {shoes.map((product) => {
            const isWishlisted = wishlist.includes(product.id);
            const inStock = (product.stockQuantity ?? 10) > 0;
            const currentSelectedSize = cardSizes[product.id] || product.sizes[0] || "EU 41";

            return (
              <article className="product-card" key={product.id}>
                <Link
                  href={`/products/${product.id}`}
                  className="product-image-button"
                  style={{ display: "block", textDecoration: "none" }}
                  title={`View ${product.name}`}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 760px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    style={{ objectPosition: product.position }}
                  />
                  <div className="product-card-hover-overlay">
                    <span className="hover-view-tag">
                      <Eye size={14} /> View Details
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  className={`product-wishlist-btn ${isWishlisted ? "active" : ""}`}
                  onClick={(e) => toggleWishlist(product.id, e)}
                  aria-label={isWishlisted ? `Remove ${product.name} from favorites` : `Save ${product.name}`}
                  title={isWishlisted ? "Remove from favorites" : "Save to favorites"}
                >
                  <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={2} />
                </button>

                <span className="product-badge">BEST SELLER</span>

                <div className="product-meta">
                  <div className="product-meta-top">
                    <span className="product-meta-category">{product.color}</span>
                    <span className="product-meta-rating">
                      <Star size={12} fill="#5b1f2b" color="#5b1f2b" />
                      {product.rating ?? 4.9} ({product.reviews ?? 32} reviews)
                    </span>
                  </div>

                  <div className="product-meta-main">
                    <Link
                      href={`/products/${product.id}`}
                      style={{ textDecoration: "none", color: "inherit", flex: 1 }}
                    >
                      <h3 style={{ margin: 0 }}>{product.name}</h3>
                    </Link>
                    <span>{formatPrice(product.price)}</span>
                  </div>

                  <p className="product-meta-sub">{product.subtitle}</p>

                  {/* Size selection */}
                  <div style={{ marginTop: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#5b1f2b", display: "block", marginBottom: "4px" }}>
                      Select Size:
                    </span>
                    <div className="card-size-selector">
                      {product.sizes.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          className={`card-size-pill ${currentSelectedSize === sz ? "active" : ""}`}
                          onClick={() => setCardSizes((prev) => ({ ...prev, [product.id]: sz }))}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "14px" }}>
                    <button
                      type="button"
                      className="card-add-to-bag-btn"
                      disabled={!inStock}
                      onClick={() => addToCart(product, currentSelectedSize)}
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      <ShoppingBag size={15} />
                      {inStock ? `Add to Bag — ${formatPrice(product.price)}` : "Sold Out"}
                    </button>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        className="quick-view-btn"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <Eye size={13} /> Quick View
                      </button>
                      <Link
                        href={`/products/${product.id}`}
                        className="quick-view-btn"
                        style={{
                          textDecoration: "none",
                          background: "#f4ede3",
                          borderColor: "#d8cfc0",
                          color: "#123d32",
                        }}
                      >
                        Details <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
