"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Eye,
  Heart,
  RotateCcw,
  Search,
  Shield,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  X,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useStore } from "@/lib/store-context";
import type { Filter } from "@/lib/products";

type SortOption = "featured" | "price-asc" | "price-desc" | "rating";

export default function Home() {
  const router = useRouter();
  const {
    catalog,
    formatPrice,
    addToCart,
    wishlist,
    toggleWishlist,
    setSelectedProduct,
    user,
    isAuthenticated,
    setAccountModalOpen,
    setAccountModalTab,
  } = useStore();

  const [filter, setFilter] = useState<Filter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [cardSizes, setCardSizes] = useState<Record<string, string>>({});

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSuccess(true);
    setNewsletterEmail("");
  };

  // Filtered & sorted products for storefront grid
  const visibleProducts = useMemo(() => {
    let result = catalog;
    if (filter !== "All") {
      result = result.filter((p) => p.category === filter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.color.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.subtitle && p.subtitle.toLowerCase().includes(q))
      );
    }
    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return result;
  }, [catalog, filter, searchQuery, sortBy]);

  // Featured hero products
  const featuredBag = catalog.find((p) => p.id === "arc-shoulder-bag") || catalog[0];
  const featuredShoe = catalog.find((p) => p.id === "column-ankle-boot") || catalog[3];
  const featuredJacket = catalog.find((p) => p.id === "transit-leather-jacket") || catalog[6];

  return (
    <main>
      <SiteHeader />

      {/* 3. HERO SECTION */}
      <section id="top" className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="hero-topline">
            <span>LIMITED ATELIER RUN</span>
            <span>AUTUMN / WINTER 2026</span>
          </div>

          <div className="hero-main">
            <p className="eyebrow">HANDCRAFTED IN EUROPE · 100% FULL-GRAIN LEATHER</p>
            <h1 id="hero-title">
              Style that moves
              <br />
              <em>with you.</em>
            </h1>
            <p className="hero-description">
              Handcrafted leather bags, Goodyear-welted boots, and buttery lambskin jackets built with genuine European leather. Designed for everyday comfort and engineered to age into heirloom pieces.
            </p>

            {/* Trust and Social Proof Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 12px",
                background: "rgba(18, 61, 50, 0.05)",
                border: "1px solid rgba(18, 61, 50, 0.15)",
                borderRadius: "2px",
                fontSize: "12px",
                color: "#123d32",
                fontWeight: 600,
                marginBottom: "4px",
              }}
            >
              <div style={{ display: "flex", gap: "2px", color: "#b45309" }}>
                <Star size={13} fill="currentColor" />
                <Star size={13} fill="currentColor" />
                <Star size={13} fill="currentColor" />
                <Star size={13} fill="currentColor" />
                <Star size={13} fill="currentColor" />
              </div>
              <span>4.9 / 5 Rating from 2,400+ Clients · Limited Runs</span>
            </div>

            {/* Hero CTAs */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "8px" }}>
              <Link
                href="/bags"
                className="dark-button"
                style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                Shop The Bag Collection <ArrowRight size={18} />
              </Link>

              {isAuthenticated && user ? (
                <button
                  type="button"
                  onClick={() => {
                    setAccountModalTab("profile");
                    setAccountModalOpen(true);
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "14px 22px",
                    background: "#fff",
                    color: "#123d32",
                    border: "1px solid #123d32",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    borderRadius: "2px",
                  }}
                >
                  {user.name.split(" ")[0]}’s Specialized Bag
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAccountModalTab("register");
                    setAccountModalOpen(true);
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "14px 22px",
                    background: "#fff",
                    color: "#123d32",
                    border: "1px solid #123d32",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    borderRadius: "2px",
                  }}
                >
                  Create Account / Sync Bag
                </button>
              )}
            </div>
          </div>

          <div className="hero-index">
            <span>01 / 100% GENUINE LEATHER</span>
            <span>02 / FREE EXPRESS COURIER</span>
            <span>03 / 30-DAY EASY RETURNS</span>
          </div>
        </div>

        {/* Hero Photo with Interactive Spotlight Card */}
        <div className="hero-image-wrap">
          <div className="hero-photo" style={{ position: "relative" }}>
            <Image
              className="hero-image"
              src="/dioka-hero-editorial.webp"
              alt="Model wearing classic leather jacket with Arc Shoulder Bag"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 55vw"
            />

            {/* Interactive Spotlight Card on Hero Image */}
            <div
              style={{
                position: "absolute",
                bottom: "24px",
                left: "24px",
                right: "24px",
                maxWidth: "360px",
                background: "rgba(255, 255, 255, 0.94)",
                backdropFilter: "blur(8px)",
                padding: "14px 18px",
                borderRadius: "3px",
                boxShadow: "0 16px 40px rgba(0,0,0,0.18)",
                border: "1px solid rgba(18, 61, 50, 0.15)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                zIndex: 3,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#888" }}>
                    FEATURED BAG
                  </span>
                  <h3 style={{ fontSize: "15px", margin: "2px 0 0", color: "#123d32", fontWeight: 700 }}>
                    {featuredBag.name}
                  </h3>
                </div>
                <strong style={{ fontSize: "16px", color: "#123d32" }}>
                  {formatPrice(featuredBag.price)}
                </strong>
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <button
                  type="button"
                  onClick={() => addToCart(featuredBag)}
                  className="dark-button"
                  style={{
                    flex: 1,
                    padding: "9px 12px",
                    fontSize: "12px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <ShoppingBag size={14} /> Add to Bag
                </button>
                <Link
                  href={`/products/${featuredBag.id}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "9px 12px",
                    border: "1px solid #123d32",
                    color: "#123d32",
                    fontSize: "12px",
                    fontWeight: 600,
                    textDecoration: "none",
                    borderRadius: "2px",
                  }}
                >
                  Details <ArrowRight size={13} style={{ marginLeft: "4px" }} />
                </Link>
              </div>
            </div>
          </div>

          <div className="hero-image-caption">
            <span>GENUINE FULL-GRAIN EUROPEAN LEATHER</span>
            <span>WORLDWIDE FREE EXPRESS SHIPPING</span>
          </div>
        </div>
      </section>

      {/* 4. QUICK CATEGORY BAR - FULL LINK BUTTONS */}
      <nav className="category-rail" aria-label="Shop by category">
        <Link href="/bags" style={{ textDecoration: "none", color: "inherit" }} title="Explore leather bags">
          <span>01</span>
          <div>
            <strong>Bags</strong>
            <small style={{ display: "block", fontSize: "12px", color: "#666", fontWeight: 500 }}>
              Shoulder, Crossbody & Travel Duffles (3)
            </small>
          </div>
          <ArrowUpRight size={18} />
        </Link>
        <Link href="/footwear" style={{ textDecoration: "none", color: "inherit" }} title="Explore shoes and boots">
          <span>02</span>
          <div>
            <strong>Shoes & Boots</strong>
            <small style={{ display: "block", fontSize: "12px", color: "#666", fontWeight: 500 }}>
              Chelsea Boots, Heeled & Derby Shoes (3)
            </small>
          </div>
          <ArrowUpRight size={18} />
        </Link>
        <Link href="/jackets" style={{ textDecoration: "none", color: "inherit" }} title="Explore leather jackets">
          <span>03</span>
          <div>
            <strong>Leather Jackets</strong>
            <small style={{ display: "block", fontSize: "12px", color: "#666", fontWeight: 500 }}>
              Everyday Lambskin, Trench & Aviators (3)
            </small>
          </div>
          <ArrowUpRight size={18} />
        </Link>
      </nav>

      {/* 5. FEATURED COLLECTIONS SHOWCASE */}
      <section id="collections" className="collections-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">TRENDING COLLECTIONS</p>
            <h2>
              Popular right
              <br />
              <em>now.</em>
            </h2>
          </div>
          <p>Explore our most popular leather styles, designed for durability, comfort, and daily wear.</p>
        </div>

        <div className="collection-grid">
          {/* BAGS SHOWCASE CARD */}
          <div
            className="collection-card bag-card"
            onClick={(e) => {
              const el = e.target as HTMLElement;
              if (el.closest("button") || el.closest("a")) return;
              router.push("/products/arc-shoulder-bag");
            }}
            style={{ cursor: "pointer" }}
          >
            <Link
              href="/products/arc-shoulder-bag"
              className="collection-media"
              style={{ display: "block", textDecoration: "none" }}
              title="View Arc Shoulder Bag details"
            >
              <Image
                src="/dioka-brown-bag.webp"
                alt="Arc Leather Shoulder Bag in Cognac Brown"
                fill
                sizes="(max-width: 900px) 100vw, 60vw"
              />
              <span className="collection-badge">POPULAR IN BAGS</span>
            </Link>
            <div className="collection-label">
              <div style={{ flex: 1 }}>
                <span className="collection-number">01 / FEATURED BAG</span>
                <Link href="/products/arc-shoulder-bag" style={{ textDecoration: "none", color: "inherit" }}>
                  <strong>Arc Shoulder Bag</strong>
                </Link>
                <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#666" }}>
                  Curved silhouette in rich full-grain calfskin · {formatPrice(featuredBag.price)}
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                <button
                  type="button"
                  className="quick-action-pill"
                  onClick={() => setSelectedProduct(featuredBag)}
                >
                  <Eye size={14} /> Quick View
                </button>
                <Link
                  href="/bags"
                  className="quick-action-pill active"
                  style={{ textDecoration: "none" }}
                >
                  Shop All Bags (3) <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* FOOTWEAR SHOWCASE CARD */}
          <div
            className="collection-card footwear-card"
            onClick={(e) => {
              const el = e.target as HTMLElement;
              if (el.closest("button") || el.closest("a")) return;
              router.push("/products/column-ankle-boot");
            }}
            style={{ cursor: "pointer" }}
          >
            <Link
              href="/products/column-ankle-boot"
              className="collection-media"
              style={{ display: "block", textDecoration: "none" }}
              title="View Chelsea Ankle Boot"
            >
              <Image
                src="/dioka-footwear-editorial.png"
                alt="Chelsea Heeled Ankle Boot"
                fill
                sizes="(max-width: 900px) 100vw, 40vw"
              />
              <span className="collection-badge">BEST SELLER</span>
            </Link>
            <div className="collection-label">
              <div style={{ flex: 1 }}>
                <span className="collection-number">02 / SHOES & BOOTS</span>
                <Link href="/products/column-ankle-boot" style={{ textDecoration: "none", color: "inherit" }}>
                  <strong>Heeled Ankle Boots</strong>
                </Link>
                <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#666" }}>
                  Stacked heel with cushioned support · {formatPrice(featuredShoe.price)}
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                <button
                  type="button"
                  className="quick-action-pill"
                  onClick={() => setSelectedProduct(featuredShoe)}
                >
                  <Eye size={14} /> Quick View
                </button>
                <Link
                  href="/footwear"
                  className="quick-action-pill active"
                  style={{ textDecoration: "none" }}
                >
                  Shop Shoes (3) <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* JACKETS SHOWCASE CARD */}
          <div
            className="collection-card jacket-card"
            onClick={(e) => {
              const el = e.target as HTMLElement;
              if (el.closest("button") || el.closest("a")) return;
              router.push("/products/transit-leather-jacket");
            }}
            style={{ cursor: "pointer" }}
          >
            <Link
              href="/products/transit-leather-jacket"
              className="collection-media"
              style={{ display: "block", textDecoration: "none" }}
              title="View Lambskin Leather Jacket"
            >
              <Image
                src="/dioka-jacket-editorial.png"
                alt="Classic Lambskin Leather Jacket"
                fill
                sizes="(max-width: 900px) 100vw, 40vw"
              />
              <span className="collection-badge">TOP RATED</span>
            </Link>
            <div className="collection-label">
              <div style={{ flex: 1 }}>
                <span className="collection-number">03 / LEATHER JACKETS</span>
                <Link href="/products/transit-leather-jacket" style={{ textDecoration: "none", color: "inherit" }}>
                  <strong>Lambskin Jacket</strong>
                </Link>
                <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#666" }}>
                  Buttery-soft lambskin tailored fit · {formatPrice(featuredJacket.price)}
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                <button
                  type="button"
                  className="quick-action-pill"
                  onClick={() => setSelectedProduct(featuredJacket)}
                >
                  <Eye size={14} /> Quick View
                </button>
                <Link
                  href="/jackets"
                  className="quick-action-pill active"
                  style={{ textDecoration: "none" }}
                >
                  Shop Jackets (3) <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. STOREFRONT CATALOG */}
      <section id="shop" className="shop-section">
        <div className="shop-heading">
          <div>
            <p className="eyebrow">ALL PRODUCTS</p>
            <h2>
              Find your
              <br />
              <em>perfect piece.</em>
            </h2>
          </div>
          <p>
            Select your size and add directly to your bag, or click any item to see full specifications, photos, and sizing.
          </p>
        </div>

        {/* Filter, Search & Sort Bar */}
        <div className="shop-controls">
          <div className="filter-row" role="group" aria-label="Filter products">
            {(["All", "Bags", "Footwear", "Jackets"] as Filter[]).map((cat) => {
              const count = cat === "All" ? catalog.length : catalog.filter((p) => p.category === cat).length;
              const label = cat === "All" ? "All Products" : cat === "Footwear" ? "Shoes & Boots" : cat;
              return (
                <button
                  type="button"
                  key={cat}
                  className={filter === cat ? "active" : ""}
                  onClick={() => setFilter(cat)}
                  aria-pressed={filter === cat}
                >
                  {label} <span>({count})</span>
                </button>
              );
            })}
          </div>

          <div className="search-sort-bar">
            <div className="search-input-wrap">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Search bags, shoes, color..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search catalog"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{ position: "absolute", right: 8, background: "none", border: 0, cursor: "pointer", color: "#888" }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort products"
            >
              <option value="featured">Featured Picks</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {visibleProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 20px" }}>
            <p style={{ fontSize: "20px", color: "#123d32", marginBottom: "16px" }}>No items match your search.</p>
            <button
              type="button"
              onClick={() => {
                setFilter("All");
                setSearchQuery("");
              }}
              className="dark-button"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {visibleProducts.map((product) => {
              const isWishlisted = wishlist.includes(product.id);
              const inStock = (product.stockQuantity ?? 10) > 0;
              const currentSelectedSize = cardSizes[product.id] || product.sizes[0] || "One size";

              return (
                <article
                  className="product-card"
                  key={product.id}
                  onClick={(e) => {
                    const el = e.target as HTMLElement;
                    if (el.closest("button") || el.closest("a") || el.closest("select")) return;
                    router.push(`/products/${product.id}`);
                  }}
                >
                  {/* Image container linking directly to product page */}
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

                  {/* Category Badge */}
                  <span className="product-badge">
                    {product.category === "Footwear" ? "Shoes & Boots" : product.category}
                  </span>

                  {/* Product Meta Details */}
                  <div className="product-meta">
                    <div className="product-meta-top">
                      <span className="product-meta-category">{product.color}</span>
                      <span className="product-meta-rating">
                        <Star size={12} fill="#5b1f2b" color="#5b1f2b" />
                        {product.rating ?? 4.9} ({product.reviews ?? 32} reviews)
                      </span>
                    </div>

                    {/* Title and price */}
                    <div className="product-meta-main">
                      <Link href={`/products/${product.id}`} style={{ textDecoration: "none", color: "inherit", flex: 1 }}>
                        <h3 style={{ margin: 0 }}>{product.name}</h3>
                      </Link>
                      <span>{formatPrice(product.price)}</span>
                    </div>

                    <p className="product-meta-sub">{product.subtitle}</p>

                    {/* Size Selector */}
                    <div style={{ marginTop: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#5b1f2b", display: "block", marginBottom: "4px" }}>
                        {product.sizes.length === 1 ? "Size: One Size" : "Select Size:"}
                      </span>
                      {product.sizes.length > 1 && (
                        <div className="card-size-selector">
                          {product.sizes.map((sz) => {
                            const isPillActive = currentSelectedSize === sz;
                            return (
                              <button
                                key={sz}
                                type="button"
                                className={`card-size-pill ${isPillActive ? "active" : ""}`}
                                onClick={() => setCardSizes((prev) => ({ ...prev, [product.id]: sz }))}
                              >
                                {sz}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* ACTION BUTTONS */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "14px" }}>
                      <button
                        type="button"
                        className="card-add-to-bag-btn"
                        disabled={!inStock}
                        onClick={() => addToCart(product, currentSelectedSize)}
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
        )}
      </section>

      {/* 7. WHY SHOP WITH US (SPOTIFY VALUE PILLARS) */}
      <section id="benefits" className="atelier-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">WHY SHOP DIOKA</p>
            <h2>
              Built to last.
              <br />
              <em>Made to love.</em>
            </h2>
          </div>
          <p>We believe in high-quality materials, honest craftsmanship, and stress-free shopping with free delivery worldwide.</p>
        </div>

        <div className="atelier-grid">
          <div className="atelier-card">
            <div className="atelier-card-icon">
              <Sparkles size={22} />
            </div>
            <h4>100% Genuine Full-Grain Leather</h4>
            <p>Hand-selected European calfskin and Merino shearling. Develops a richer, softer patina with every single wear.</p>
          </div>

          <div className="atelier-card">
            <div className="atelier-card-icon">
              <Truck size={22} />
            </div>
            <h4>Free Express Shipping</h4>
            <p>Fast, tracked courier shipping straight to your door. All customs, duties, and taxes are completely covered.</p>
          </div>

          <div className="atelier-card">
            <div className="atelier-card-icon">
              <RotateCcw size={22} />
            </div>
            <h4>30-Day Easy Returns</h4>
            <p>Try it on at home. If the size or fit isn&apos;t 100% right, exchange or return it with our prepaid return label.</p>
          </div>

          <div className="atelier-card">
            <div className="atelier-card-icon">
              <Shield size={22} />
            </div>
            <h4>2-Year Quality Warranty</h4>
            <p>Reinforced double-stitching, solid brass hardware, and heavy-duty zippers built for multi-decade durability.</p>
          </div>
        </div>
      </section>

      {/* 8. OUR STORY */}
      <section id="story" className="story-section">
        <div className="story-mark">
          <p>DIOKA · PREMIUM ESSENTIALS</p>
          <span aria-hidden="true">D</span>
          <p>CRAFTED FOR EVERYDAY LIFE</p>
        </div>
        <div className="story-copy">
          <p className="eyebrow">OUR STORY</p>
          <h2>
            Quality you can
            <br />
            <em>feel every day.</em>
          </h2>
          <p>
            We started Dioka with a clear mission: create everyday leather essentials that look sharp, feel comfortable, and endure for decades. No synthetic shortcuts, no seasonal obsolescence.
          </p>
          <p>
            From the comfortable curve of our shoulder bags to the shock-absorbing footbeds of our Chelsea boots, every design decision is made for real-world wear.
          </p>
          <Link
            href="/bags"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#123d32",
              fontWeight: 700,
              fontSize: "14px",
              textDecoration: "underline",
              marginTop: "8px",
            }}
          >
            Explore the Bags Collection <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* 9. CUSTOMER REVIEWS */}
      <section id="reviews" className="press-section">
        <p className="eyebrow" style={{ textAlign: "center" }}>
          CUSTOMER REVIEWS
        </p>
        <h3 style={{ textAlign: "center", fontSize: "32px", margin: "8px 0 32px", color: "#123d32" }}>
          Rated 4.9 / 5 by verified buyers
        </h3>
        <div className="press-grid">
          <div className="press-card">
            <div style={{ display: "flex", gap: "2px", marginBottom: "12px", color: "#5b1f2b" }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#5b1f2b" />
              ))}
            </div>
            <p className="press-quote">
              &ldquo;The Arc Shoulder Bag is literally my everyday bag now. The leather smells incredible, the strap doesn&apos;t slip off my shoulder, and it fits everything effortlessly.&rdquo;
            </p>
            <span className="press-author">Sarah M. · Verified Buyer (New York)</span>
          </div>

          <div className="press-card">
            <div style={{ display: "flex", gap: "2px", marginBottom: "12px", color: "#5b1f2b" }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#5b1f2b" />
              ))}
            </div>
            <p className="press-quote">
              &ldquo;These Chelsea boots required zero break-in period. Extremely comfortable arch support from day one, and the stacked heel is the ideal everyday height.&rdquo;
            </p>
            <span className="press-author">James T. · Verified Buyer (London)</span>
          </div>

          <div className="press-card">
            <div style={{ display: "flex", gap: "2px", marginBottom: "12px", color: "#5b1f2b" }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#5b1f2b" />
              ))}
            </div>
            <p className="press-quote">
              &ldquo;The lambskin jacket is butter-soft. Flawless tailoring and looks effortlessly sharp with just a white tee and jeans. The leather quality is remarkable.&rdquo;
            </p>
            <span className="press-author">Elena V. · Verified Buyer (Berlin)</span>
          </div>
        </div>
      </section>

      {/* 10. NEWSLETTER & DISCOUNT */}
      <section className="newsletter-section">
        <div className="newsletter-box">
          <p className="eyebrow">SPECIAL OFFER</p>
          <h3>Get 15% off your first order</h3>
          <p>Subscribe for exclusive discounts, new product drop announcements, and style guides.</p>

          {newsletterSuccess ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#123d32", fontWeight: 600 }}>
              <Check size={20} color="#123d32" />
              <span>You&apos;re subscribed! Use promo code <strong>WELCOME15</strong> at checkout for 15% off.</span>
            </div>
          ) : (
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder="Enter your email address"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
              />
              <button type="submit">Get 15% Off</button>
            </form>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
