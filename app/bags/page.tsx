"use client";
import { CmsLink, CmsPage, CmsSection, CmsText } from "@/components/SiteControls";

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
import {
  ATELIER_COLORS,
  ATELIER_LEATHERS,
  ATELIER_SHAPES,
  type AtelierColor,
} from "@/lib/products";

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
  const [cardColors, setCardColors] = useState<Record<string, AtelierColor>>({});
  const [cardLeathers, setCardLeathers] = useState<Record<string, string>>({});
  const [cardShapes, setCardShapes] = useState<Record<string, string>>({});

  // Filter bags from catalog
  const bags = catalog.filter((p) => p.category === "Bags");

  const visibleBags = bags.filter((bag) => {
    if (subCategory === "shoulder") return bag.bagType === "Shoulder Bags";
    if (subCategory === "crossbody") return bag.bagType === "Crossbody Bags";
    if (subCategory === "duffle") return bag.bagType === "Travel & Duffle Bags";
    return true;
  });

  return (
    <CmsPage pageKey="app/bags/page.tsx">
      <SiteHeader />

      {/* Breadcrumb Navigation */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "16px 5% 0" }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: "12px", color: "#888", display: "flex", gap: "8px" }}>
          <CmsLink href="/" style={{ color: "#666", textDecoration: "none" }} hrefKey="6a384e9dffeeee0f">
            <CmsText field="6d7f12d58c06df3d" fallback="Home"/></CmsLink>
          <span><CmsText field="945ed1a4ace602d1" fallback="/"/></span>
          <span style={{ color: "#123d32", fontWeight: 700 }}><CmsText field="e919210e29fd99c6" fallback="Bags"/></span>
        </nav>
      </div>

      {/* Hero Header for Bags Collection */}
      <CmsSection style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 5% 48px" }} sectionKey="a26398e6ca3ee10b">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px", borderBottom: "1px solid #e2ddd5", paddingBottom: "32px" }}>
          <div style={{ maxWidth: "680px" }}>
            <p className="eyebrow" style={{ color: "#5b1f2b", marginBottom: "8px" }}>
              <CmsText field="914d3a869580bcb7" fallback="COLLECTION · 100% FULL-GRAIN LEATHER"/></p>
            <h1 style={{ fontFamily: "var(--dioka-font)", fontSize: "clamp(38px, 5vw, 64px)", lineHeight: "0.95", margin: "0 0 16px", color: "#123d32", fontWeight: 600 }}>
              <CmsText field="3a3d93c8628a6814" fallback="Leather Bags"/></h1>
            <p style={{ fontSize: "17px", color: "#596f64", lineHeight: "1.5", margin: 0 }}>
              <CmsText field="8a0444533e0a9762" fallback="Handcrafted from rich European calfskin and Tuscan pebble-grain leather. Built with smooth brass hardware, ergonomic strap drops, and reinforced stitching for daily life and travel."/></p>
          </div>

          {/* Quick value badges */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", fontWeight: 600, color: "#123d32" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Check size={16} color="#166534" /> <CmsText field="50006b351d51bb2b" fallback="100% Genuine Full-Grain Leather"/></span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Truck size={16} color="#166534" /> <CmsText field="92ed82858efe87ea" fallback="Free Worldwide Express Delivery"/></span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Shield size={16} color="#166534" /> <CmsText field="0af33254dafe05d0" fallback="2-Year Craftsmanship Guarantee"/></span>
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
                      <Eye size={14} /> <CmsText field="6932b975eca537db" fallback="View Details"/></span>
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
                      {product.rating ?? 4.9} <CmsText field="48a266225dad6bf5" fallback="("/>{product.reviews ?? 32} <CmsText field="22038777cb01e5b1" fallback="reviews)"/></span>
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

                  {/* Bespoke Colour Selector (6 Atelier Shades) */}
                  <div style={{ marginTop: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#123d32" }}>
                        <CmsText field="939b1b9abaec8f29" fallback="Colour: "/><strong style={{ color: "#5b1f2b" }}>{cardColors[product.id] || "Cognac"}</strong>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "5px" }}>
                      {ATELIER_COLORS.map((c) => {
                        const isActive = (cardColors[product.id] || "Cognac") === c.name;
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setCardColors((prev) => ({ ...prev, [product.id]: c.name }))}
                            title={`${c.name} Leather`}
                            style={{
                              width: "18px",
                              height: "18px",
                              borderRadius: "50%",
                              background: c.hex,
                              border: isActive ? "2px solid #123d32" : `1px solid ${c.border}`,
                              outline: isActive ? "1px solid #123d32" : "none",
                              outlineOffset: "1px",
                              cursor: "pointer",
                              padding: 0,
                              transition: "all .15s",
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Leather & Shape selection chips */}
                  <div style={{ marginTop: "8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                    <div>
                      <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#666", display: "block", marginBottom: "3px" }}>
                        <CmsText field="84f7e9cf8b7db1e7" fallback="Leather:"/></span>
                      <select
                        value={cardLeathers[product.id] || "Full-Grain"}
                        onChange={(e) => setCardLeathers((prev) => ({ ...prev, [product.id]: e.target.value }))}
                        style={{
                          width: "100%",
                          padding: "4px 6px",
                          fontSize: "11px",
                          fontWeight: 600,
                          borderRadius: "2px",
                          border: "1px solid #d4cdc5",
                          background: "#fff",
                          color: "#123d32",
                          cursor: "pointer",
                        }}
                      >
                        {ATELIER_LEATHERS.map((l) => (
                          <option key={l.id} value={l.name}>
                            {l.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#666", display: "block", marginBottom: "3px" }}>
                        <CmsText field="e1b5fb78b957096d" fallback="Shape:"/></span>
                      <select
                        value={cardShapes[product.id] || "The Classic"}
                        onChange={(e) => setCardShapes((prev) => ({ ...prev, [product.id]: e.target.value }))}
                        style={{
                          width: "100%",
                          padding: "4px 6px",
                          fontSize: "11px",
                          fontWeight: 600,
                          borderRadius: "2px",
                          border: "1px solid #d4cdc5",
                          background: "#fff",
                          color: "#123d32",
                          cursor: "pointer",
                        }}
                      >
                        {ATELIER_SHAPES.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name} {s.symbol || "✨"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                    {/* Add to Bag button */}
                    <button
                      type="button"
                      className="card-add-to-bag-btn"
                      disabled={!inStock}
                      onClick={() =>
                        addToCart(product, currentSelectedSize, 1, {
                          color: cardColors[product.id] || "Cognac",
                          leather: cardLeathers[product.id] || "Full-Grain",
                          shape: cardShapes[product.id] || "The Classic",
                        })
                      }
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
                        <Eye size={13} /> <CmsText field="42825edf6c16ef91" fallback="Quick View / Customize"/></button>
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
                        <CmsText field="80326ee6b0100e72" fallback="Details "/><ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </CmsSection>

      {/* Craftsmanship Highlights for Bags */}
      <CmsSection style={{ background: "#f8f7f3", padding: "64px 5%", borderTop: "1px solid #e2ddd5", borderBottom: "1px solid #e2ddd5" }} sectionKey="1626ef0cdfbf1b1b">
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <p className="eyebrow" style={{ color: "#5b1f2b", textAlign: "center" }}>
            <CmsText field="5bf53eb490b5aec3" fallback="HOW OUR BAGS ARE MADE"/></p>
          <h2 style={{ fontFamily: "var(--dioka-font)", fontSize: "36px", color: "#123d32", textAlign: "center", margin: "8px 0 36px" }}>
            <CmsText field="4083eaa46ee8500f" fallback="Engineered for comfort. Built for decades."/></h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
            <div style={{ background: "#fff", padding: "24px", border: "1px solid #e2ddd5" }}>
              <Sparkles size={24} color="#123d32" style={{ marginBottom: "12px" }} />
              <h4 style={{ margin: "0 0 8px", fontSize: "17px", color: "#123d32" }}><CmsText field="af405c8153188e0d" fallback="European Full-Grain Calfskin"/></h4>
              <p style={{ margin: 0, fontSize: "14px", color: "#666", lineHeight: 1.5 }}>
                <CmsText field="a3f73bd9a9121251" fallback="We use top-layer European calfskin that maintains its natural grain, developing a rich, unique patina over time instead of peeling."/></p>
            </div>

            <div style={{ background: "#fff", padding: "24px", border: "1px solid #e2ddd5" }}>
              <Shield size={24} color="#123d32" style={{ marginBottom: "12px" }} />
              <h4 style={{ margin: "0 0 8px", fontSize: "17px", color: "#123d32" }}><CmsText field="985897b86572f0f1" fallback="Solid Brass Hardware"/></h4>
              <p style={{ margin: 0, fontSize: "14px", color: "#666", lineHeight: 1.5 }}>
                <CmsText field="f27abd71b405943b" fallback="Heavy-duty solid brass clasps, zippers, and magnetic closures that won't tarnish, crack, or snag on your clothes."/></p>
            </div>

            <div style={{ background: "#fff", padding: "24px", border: "1px solid #e2ddd5" }}>
              <Truck size={24} color="#123d32" style={{ marginBottom: "12px" }} />
              <h4 style={{ margin: "0 0 8px", fontSize: "17px", color: "#123d32" }}><CmsText field="d468a5477662eb50" fallback="Free Express Delivery"/></h4>
              <p style={{ margin: 0, fontSize: "14px", color: "#666", lineHeight: 1.5 }}>
                <CmsText field="49f9dfb403cd4165" fallback="Tracked courier delivery straight to your door with all customs and duties fully prepaid. 30-day hassle-free return window."/></p>
            </div>
          </div>
        </div>
      </CmsSection>

      {/* Customer Reviews for Bags */}
      <CmsSection style={{ maxWidth: "1280px", margin: "0 auto", padding: "64px 5%" }} sectionKey="cdb9d4beb2e885ba">
        <p className="eyebrow" style={{ textAlign: "center", color: "#5b1f2b" }}>
          <CmsText field="f902f543e52162ea" fallback="CUSTOMER EXPERIENCES"/></p>
        <h3 style={{ textAlign: "center", fontSize: "32px", color: "#123d32", margin: "8px 0 36px" }}>
          <CmsText field="2ec5d921ae24fcb7" fallback="Loved by everyday commuters and travelers"/></h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          <div style={{ background: "#fff", border: "1px solid #e2ddd5", padding: "24px" }}>
            <div style={{ display: "flex", gap: "2px", color: "#5b1f2b", marginBottom: "10px" }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="#5b1f2b" />
              ))}
            </div>
            <p style={{ fontStyle: "italic", color: "#333", fontSize: "15px", lineHeight: "1.5" }}>
              <CmsText field="d7f80038b56ddc2c" fallback="“The Arc Shoulder Bag is literally my everyday bag now. The leather smells incredible, the strap doesn't slip off my shoulder, and it fits everything effortlessly.”"/></p>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#123d32" }}>
              <CmsText field="0b392beec29545ce" fallback="Sarah M. · Arc Shoulder Bag in Cognac Brown"/></span>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e2ddd5", padding: "24px" }}>
            <div style={{ display: "flex", gap: "2px", color: "#5b1f2b", marginBottom: "10px" }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="#5b1f2b" />
              ))}
            </div>
            <p style={{ fontStyle: "italic", color: "#333", fontSize: "15px", lineHeight: "1.5" }}>
              <CmsText field="f5d6797e8689db8f" fallback="“The Saddle Crossbody is clean, elegant, and secure. The turn-lock is so easy to open with one hand when walking. Couldn't be happier.”"/></p>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#123d32" }}>
              <CmsText field="9086939e6f17a582" fallback="Jessica L. · Classic Saddle Crossbody in Black"/></span>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e2ddd5", padding: "24px" }}>
            <div style={{ display: "flex", gap: "2px", color: "#5b1f2b", marginBottom: "10px" }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="#5b1f2b" />
              ))}
            </div>
            <p style={{ fontStyle: "italic", color: "#333", fontSize: "15px", lineHeight: "1.5" }}>
              <CmsText field="ab64676f470460c1" fallback="“Took the Voyager Travel Duffle on a 4-day trip to Paris. Fits in overhead bins without an issue and the Tuscan leather looks stunning.”"/></p>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#123d32" }}>
              <CmsText field="f5db0419ab134efa" fallback="Marcus B. · Voyager Travel Duffle in Espresso"/></span>
          </div>
        </div>
      </CmsSection>

      <SiteFooter />
    </CmsPage>
  );
}
