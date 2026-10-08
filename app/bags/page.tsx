"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Eye,
  Heart,
  Shield,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useStore } from "@/lib/store-context";

export default function BagsPage() {
  const {
    catalog,
    formatPrice,
    addToCart,
    wishlist,
    toggleWishlist,
    setSelectedProduct,
  } = useStore();

  const [subCategory, setSubCategory] = useState<string>("all");

  // Filter bags from catalog
  const bags = catalog.filter((p) => p.category === "Bags");

  const visibleBags = bags.filter((bag) => {
    if (subCategory === "shoulder") return bag.id.includes("shoulder");
    if (subCategory === "crossbody") return bag.id.includes("saddle");
    if (subCategory === "duffle") return bag.id.includes("weekender");
    return true;
  });

  return (
    <main>
      <SiteHeader />

      {/* Breadcrumb Navigation */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "16px 5% 0" }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: "12px", color: "#888", display: "flex", gap: "8px" }}>
          <Link href="/" style={{ color: "#666", textDecoration: "none" }}>
            Home
          </Link>
          <span>/</span>
          <span style={{ color: "#123d32", fontWeight: 700 }}>Bags</span>
        </nav>
      </div>

      {/* Hero Header for Bags Collection */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 5% 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px", borderBottom: "1px solid #e2ddd5", paddingBottom: "32px" }}>
          <div style={{ maxWidth: "680px" }}>
            <p className="eyebrow" style={{ color: "#5b1f2b", marginBottom: "8px" }}>
              COLLECTION · 100% FULL-GRAIN LEATHER
            </p>
            <h1 style={{ fontFamily: "var(--dioka-font)", fontSize: "clamp(38px, 5vw, 64px)", lineHeight: "0.95", margin: "0 0 16px", color: "#123d32", fontWeight: 600 }}>
              Leather Bags
            </h1>
            <p style={{ fontSize: "17px", color: "#596f64", lineHeight: "1.5", margin: 0 }}>
              Handcrafted from rich European calfskin and Tuscan pebble-grain leather. Built with smooth brass hardware, ergonomic strap drops, and reinforced stitching for daily life and travel.
            </p>
          </div>

          {/* Quick value badges */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", fontWeight: 600, color: "#123d32" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Check size={16} color="#166534" /> 100% Genuine Full-Grain Leather
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Truck size={16} color="#166534" /> Free Worldwide Express Delivery
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Shield size={16} color="#166534" /> 2-Year Craftsmanship Guarantee
            </span>
          </div>
        </div>

        {/* Sub-category Filter Tabs */}
        <div style={{ display: "flex", gap: "10px", marginTop: "28px", flexWrap: "wrap" }}>
          {[
            { id: "all", label: `All Bags (${bags.length})` },
            { id: "shoulder", label: "Shoulder Bags" },
            { id: "crossbody", label: "Crossbody Bags" },
            { id: "duffle", label: "Travel & Duffle Bags" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubCategory(tab.id)}
              style={{
                padding: "8px 18px",
                borderRadius: "999px",
                border: "1px solid #123d32",
                background: subCategory === tab.id ? "#123d32" : "#fff",
                color: subCategory === tab.id ? "#fff" : "#123d32",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: ".06em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all .2s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bags Grid */}
        <div className="product-grid" style={{ marginTop: "36px" }}>
          {visibleBags.map((product) => {
            const isWishlisted = wishlist.includes(product.id);
            const inStock = (product.stockQuantity ?? 10) > 0;
            const currentSelectedSize = product.sizes[0] || "One size";

            return (
              <article className="product-card" key={product.id}>
                {/* Image linked directly to product page */}
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

                {/* Wishlist Heart Button */}
                <button
                  type="button"
                  className={`product-wishlist-btn ${isWishlisted ? "active" : ""}`}
                  onClick={(e) => toggleWishlist(product.id, e)}
                  aria-label={isWishlisted ? `Remove ${product.name} from favorites` : `Save ${product.name}`}
                  title={isWishlisted ? "Remove from favorites" : "Save to favorites"}
                >
                  <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={2} />
                </button>

                {/* Badge */}
                <span className="product-badge">
                  {product.id === "arc-shoulder-bag" ? "POPULAR IN BAGS" : product.id === "saddle-courier-bag" ? "BEST SELLER" : "TRAVEL ESSENTIAL"}
                </span>

                {/* Product Meta */}
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

                  {/* Size label */}
                  <div style={{ marginTop: "4px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#5b1f2b" }}>
                      Size: One Size
                    </span>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "14px" }}>
                    {/* Add to Bag button */}
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

                    {/* Quick view and Full page buttons */}
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

      {/* Craftsmanship Highlights for Bags */}
      <section style={{ background: "#f8f7f3", padding: "64px 5%", borderTop: "1px solid #e2ddd5", borderBottom: "1px solid #e2ddd5" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <p className="eyebrow" style={{ color: "#5b1f2b", textAlign: "center" }}>
            HOW OUR BAGS ARE MADE
          </p>
          <h2 style={{ fontFamily: "var(--dioka-font)", fontSize: "36px", color: "#123d32", textAlign: "center", margin: "8px 0 36px" }}>
            Engineered for comfort. Built for decades.
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
            <div style={{ background: "#fff", padding: "24px", border: "1px solid #e2ddd5" }}>
              <Sparkles size={24} color="#123d32" style={{ marginBottom: "12px" }} />
              <h4 style={{ margin: "0 0 8px", fontSize: "17px", color: "#123d32" }}>European Full-Grain Calfskin</h4>
              <p style={{ margin: 0, fontSize: "14px", color: "#666", lineHeight: 1.5 }}>
                We use top-layer European calfskin that maintains its natural grain, developing a rich, unique patina over time instead of peeling.
              </p>
            </div>

            <div style={{ background: "#fff", padding: "24px", border: "1px solid #e2ddd5" }}>
              <Shield size={24} color="#123d32" style={{ marginBottom: "12px" }} />
              <h4 style={{ margin: "0 0 8px", fontSize: "17px", color: "#123d32" }}>Solid Brass Hardware</h4>
              <p style={{ margin: 0, fontSize: "14px", color: "#666", lineHeight: 1.5 }}>
                Heavy-duty solid brass clasps, zippers, and magnetic closures that won&apos;t tarnish, crack, or snag on your clothes.
              </p>
            </div>

            <div style={{ background: "#fff", padding: "24px", border: "1px solid #e2ddd5" }}>
              <Truck size={24} color="#123d32" style={{ marginBottom: "12px" }} />
              <h4 style={{ margin: "0 0 8px", fontSize: "17px", color: "#123d32" }}>Free Express Delivery</h4>
              <p style={{ margin: 0, fontSize: "14px", color: "#666", lineHeight: 1.5 }}>
                Tracked courier delivery straight to your door with all customs and duties fully prepaid. 30-day hassle-free return window.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews for Bags */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "64px 5%" }}>
        <p className="eyebrow" style={{ textAlign: "center", color: "#5b1f2b" }}>
          CUSTOMER EXPERIENCES
        </p>
        <h3 style={{ textAlign: "center", fontSize: "32px", color: "#123d32", margin: "8px 0 36px" }}>
          Loved by everyday commuters and travelers
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          <div style={{ background: "#fff", border: "1px solid #e2ddd5", padding: "24px" }}>
            <div style={{ display: "flex", gap: "2px", color: "#5b1f2b", marginBottom: "10px" }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="#5b1f2b" />
              ))}
            </div>
            <p style={{ fontStyle: "italic", color: "#333", fontSize: "15px", lineHeight: "1.5" }}>
              &ldquo;The Arc Shoulder Bag is literally my everyday bag now. The leather smells incredible, the strap doesn&apos;t slip off my shoulder, and it fits everything effortlessly.&rdquo;
            </p>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#123d32" }}>
              Sarah M. · Arc Shoulder Bag in Cognac Brown
            </span>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e2ddd5", padding: "24px" }}>
            <div style={{ display: "flex", gap: "2px", color: "#5b1f2b", marginBottom: "10px" }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="#5b1f2b" />
              ))}
            </div>
            <p style={{ fontStyle: "italic", color: "#333", fontSize: "15px", lineHeight: "1.5" }}>
              &ldquo;The Saddle Crossbody is clean, elegant, and secure. The turn-lock is so easy to open with one hand when walking. Couldn&apos;t be happier.&rdquo;
            </p>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#123d32" }}>
              Jessica L. · Classic Saddle Crossbody in Black
            </span>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e2ddd5", padding: "24px" }}>
            <div style={{ display: "flex", gap: "2px", color: "#5b1f2b", marginBottom: "10px" }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="#5b1f2b" />
              ))}
            </div>
            <p style={{ fontStyle: "italic", color: "#333", fontSize: "15px", lineHeight: "1.5" }}>
              &ldquo;Took the Voyager Travel Duffle on a 4-day trip to Paris. Fits in overhead bins without an issue and the Tuscan leather looks stunning.&rdquo;
            </p>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#123d32" }}>
              Marcus B. · Voyager Travel Duffle in Espresso
            </span>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
