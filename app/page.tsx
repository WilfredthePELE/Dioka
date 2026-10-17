"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
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
import {
  type Filter,
  ATELIER_COLORS,
  ATELIER_LEATHERS,
  ATELIER_SHAPES,
  type AtelierColor,
} from "@/lib/products";

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
  } = useStore();

  const [filter, setFilter] = useState<Filter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [cardSizes, setCardSizes] = useState<Record<string, string>>({});
  const [cardColors, setCardColors] = useState<Record<string, AtelierColor>>({});
  const [cardLeathers, setCardLeathers] = useState<Record<string, string>>({});
  const [cardShapes, setCardShapes] = useState<Record<string, string>>({});

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

  // Featured hero products for Trending Collections showcase
  const featuredBag = catalog.find((p) => p.id === "arc-shoulder-bag") || catalog[0];
  const featuredShoe = catalog.find((p) => p.id === "column-ankle-boot") || catalog[3];
  const featuredJacket = catalog.find((p) => p.id === "transit-leather-jacket") || catalog[6];

  return (
    <main>
      <SiteHeader />

      {/* TRENDING COLLECTIONS */}
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

                    {/* Bespoke Colour Selector (6 Atelier Shades) */}
                    <div style={{ marginTop: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#123d32" }}>
                          Colour: <strong style={{ color: "#5b1f2b" }}>{cardColors[product.id] || "Cognac"}</strong>
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
                          Leather:
                        </span>
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
                          Shape:
                        </span>
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

                    {/* Size Selector */}
                    <div style={{ marginTop: "8px" }}>
                      <span style={{ fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#5b1f2b", display: "block", marginBottom: "4px" }}>
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
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
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
                          <Eye size={13} /> Quick View / Customize
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
