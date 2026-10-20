"use client";
import { CmsImage, CmsLink, CmsPage, CmsSection, CmsText } from "@/components/SiteControls";

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
import { HomeIntroduction, StorePolicies } from "@/components/EditableContent";
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

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: newsletterEmail }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      setNewsletterSuccess(true); setNewsletterEmail("");
    } catch (error) { window.alert(error instanceof Error ? error.message : "Unable to subscribe. Please try again."); }
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
  const featuredBag = catalog.find((p) => p.id === "arc-shoulder-bag") || catalog.find(p => p.category === "Bags");
  const featuredShoe = catalog.find((p) => p.id === "column-ankle-boot") || catalog.find(p => p.category === "Footwear");
  const featuredJacket = catalog.find((p) => p.id === "transit-leather-jacket") || catalog.find(p => p.category === "Jackets");

  return (
    <CmsPage pageKey="app/page.tsx">
      <SiteHeader />
      <HomeIntroduction />

      {/* TRENDING COLLECTIONS */}
      <CmsSection id="collections" className="collections-section" sectionKey="cabff49880088f12">
        <div className="section-heading">
          <div>
            <p className="eyebrow"><CmsText field="31e39dd8f1b56b6e" fallback="TRENDING COLLECTIONS"/></p>
            <h2>
              <CmsText field="e67895009748ef76" fallback="Popular right"/><br />
              <em><CmsText field="eedea30f7a2d0775" fallback="now."/></em>
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
              router.push(featuredBag ? `/products/${featuredBag.id}` : "/bags");
            }}
            style={{ cursor: "pointer" }}
          >
            <CmsLink
              href={featuredBag ? `/products/${featuredBag.id}` : "/bags"}
              className="collection-media"
              style={{ display: "block", textDecoration: "none" }}
              title="View Arc Shoulder Bag details" titleKey="9481d2da2b652142"
            >
              <CmsImage
                src={featuredBag?.image || "/dioka-brown-bag.webp"}
                alt="Arc Leather Shoulder Bag in Cognac Brown"
                fill
                sizes="(max-width: 900px) 100vw, 60vw" altKey="85c471d820005527"
              />
              <span className="collection-badge"><CmsText field="8363518c196544c9" fallback="POPULAR IN BAGS"/></span>
            </CmsLink>
            <div className="collection-label">
              <div style={{ flex: 1 }}>
                <span className="collection-number"><CmsText field="207d5c45361e4140" fallback="01 / FEATURED BAG"/></span>
                <Link href={featuredBag ? `/products/${featuredBag.id}` : "/bags"} style={{ textDecoration: "none", color: "inherit" }}>
                  <strong>{featuredBag?.name || "Arc Shoulder Bag"}</strong>
                </Link>
                <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#666" }}>
                  <CmsText field="208f2c2cb24162d8" fallback="Curved silhouette in rich full-grain calfskin"/>{featuredBag ? ` · ${formatPrice(featuredBag.price)}` : ""}
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                <button
                  type="button"
                  className="quick-action-pill"
                  onClick={() => featuredBag && setSelectedProduct(featuredBag)}
                >
                  <Eye size={14} /> <CmsText field="1c39c35646d9139c" fallback="Quick View"/></button>
                <CmsLink
                  href="/bags"
                  className="quick-action-pill active"
                  style={{ textDecoration: "none" }} hrefKey="00e18a97290aa87a"
                >
                  <CmsText field="712046c7d78dcf6a" fallback="Shop All Bags ("/>{catalog.filter(p => p.category === "Bags").length}<CmsText field="2b1100033b27ce66" fallback=") "/><ArrowRight size={14} />
                </CmsLink>
              </div>
            </div>
          </div>

          {/* FOOTWEAR SHOWCASE CARD */}
          <div
            className="collection-card footwear-card"
            onClick={(e) => {
              const el = e.target as HTMLElement;
              if (el.closest("button") || el.closest("a")) return;
              router.push(featuredShoe ? `/products/${featuredShoe.id}` : "/footwear");
            }}
            style={{ cursor: "pointer" }}
          >
            <CmsLink
              href={featuredShoe ? `/products/${featuredShoe.id}` : "/footwear"}
              className="collection-media"
              style={{ display: "block", textDecoration: "none" }}
              title="View Chelsea Ankle Boot" titleKey="bf16b06dad2ac29c"
            >
              <CmsImage
                src={featuredShoe?.image || "/dioka-footwear-editorial.png"}
                alt="Chelsea Heeled Ankle Boot"
                fill
                sizes="(max-width: 900px) 100vw, 40vw" altKey="128c65e88e17e440"
              />
              <span className="collection-badge"><CmsText field="7dfd0a582656c8aa" fallback="BEST SELLER"/></span>
            </CmsLink>
            <div className="collection-label">
              <div style={{ flex: 1 }}>
                <span className="collection-number"><CmsText field="ae320827f97e87ff" fallback="02 / SHOES & BOOTS"/></span>
                <Link href={featuredShoe ? `/products/${featuredShoe.id}` : "/footwear"} style={{ textDecoration: "none", color: "inherit" }}>
                  <strong>{featuredShoe?.name || "Heeled Ankle Boots"}</strong>
                </Link>
                <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#666" }}>
                  <CmsText field="df4953ff8ec3485c" fallback="Stacked heel with cushioned support"/>{featuredShoe ? ` · ${formatPrice(featuredShoe.price)}` : ""}
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                <button
                  type="button"
                  className="quick-action-pill"
                  onClick={() => featuredShoe && setSelectedProduct(featuredShoe)}
                >
                  <Eye size={14} /> <CmsText field="fbb2707f4fb32223" fallback="Quick View"/></button>
                <CmsLink
                  href="/footwear"
                  className="quick-action-pill active"
                  style={{ textDecoration: "none" }} hrefKey="e350d776e9b3c925"
                >
                  <CmsText field="7577b00a3278bd42" fallback="Shop Shoes ("/>{catalog.filter(p => p.category === "Footwear").length}<CmsText field="4c9ade9b4d9b3a81" fallback=") "/><ArrowRight size={14} />
                </CmsLink>
              </div>
            </div>
          </div>

          {/* JACKETS SHOWCASE CARD */}
          <div
            className="collection-card jacket-card"
            onClick={(e) => {
              const el = e.target as HTMLElement;
              if (el.closest("button") || el.closest("a")) return;
              router.push(featuredJacket ? `/products/${featuredJacket.id}` : "/jackets");
            }}
            style={{ cursor: "pointer" }}
          >
            <CmsLink
              href={featuredJacket ? `/products/${featuredJacket.id}` : "/jackets"}
              className="collection-media"
              style={{ display: "block", textDecoration: "none" }}
              title="View Lambskin Leather Jacket" titleKey="4c9881d1099763a1"
            >
              <CmsImage
                src={featuredJacket?.image || "/dioka-jacket-editorial.png"}
                alt="Classic Lambskin Leather Jacket"
                fill
                sizes="(max-width: 900px) 100vw, 40vw" altKey="1e101a03eafbc9d7"
              />
              <span className="collection-badge"><CmsText field="2fe389ceab82152e" fallback="TOP RATED"/></span>
            </CmsLink>
            <div className="collection-label">
              <div style={{ flex: 1 }}>
                <span className="collection-number"><CmsText field="1d1a42b65fe93874" fallback="03 / LEATHER JACKETS"/></span>
                <Link href={featuredJacket ? `/products/${featuredJacket.id}` : "/jackets"} style={{ textDecoration: "none", color: "inherit" }}>
                  <strong>{featuredJacket?.name || "Lambskin Jacket"}</strong>
                </Link>
                <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#666" }}>
                  <CmsText field="944b653d07c0ebd1" fallback="Buttery-soft lambskin tailored fit"/>{featuredJacket ? ` · ${formatPrice(featuredJacket.price)}` : ""}
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                <button
                  type="button"
                  className="quick-action-pill"
                  onClick={() => featuredJacket && setSelectedProduct(featuredJacket)}
                >
                  <Eye size={14} /> <CmsText field="aa677b77b7e94e5e" fallback="Quick View"/></button>
                <CmsLink
                  href="/jackets"
                  className="quick-action-pill active"
                  style={{ textDecoration: "none" }} hrefKey="7120dd9751b239e8"
                >
                  <CmsText field="c55a86ffbeda04ff" fallback="Shop Jackets ("/>{catalog.filter(p => p.category === "Jackets").length}<CmsText field="9658ad8d3afde4da" fallback=") "/><ArrowRight size={14} />
                </CmsLink>
              </div>
            </div>
          </div>
        </div>
      </CmsSection>

      {/* 6. STOREFRONT CATALOG */}
      <CmsSection id="shop" className="shop-section" sectionKey="ce7113756c9f5379">
        <div className="shop-heading">
          <div>
            <p className="eyebrow"><CmsText field="aebe13b8f2ff0075" fallback="ALL PRODUCTS"/></p>
            <h2>
              <CmsText field="0cf7a55141e88e2e" fallback="Find your"/><br />
              <em><CmsText field="1c2e222a7e0ddf06" fallback="perfect piece."/></em>
            </h2>
          </div>
          <p>
            <CmsText field="38c24feb348a717f" fallback="Select your size and add directly to your bag, or click any item to see full specifications, photos, and sizing."/></p>
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
                  {label} <span><CmsText field="47df6338a4525635" fallback="("/>{count}<CmsText field="2e4e5fa61fd62f12" fallback=")"/></span>
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
            <p style={{ fontSize: "20px", color: "#123d32", marginBottom: "16px" }}><CmsText field="23518d5a61f54532" fallback="No items match your search."/></p>
            <button
              type="button"
              onClick={() => {
                setFilter("All");
                setSearchQuery("");
              }}
              className="dark-button"
            >
              <CmsText field="8448f04d61fc2bc8" fallback="Reset Search & Filters"/></button>
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
                        <Eye size={14} /> <CmsText field="4446bd5a44e5cd82" fallback="View Details"/></span>
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
                        {product.rating ?? 4.9} <CmsText field="1541f7c197a0ea39" fallback="("/>{product.reviews ?? 32} <CmsText field="9902651f6ee6329c" fallback="reviews)"/></span>
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
                          <CmsText field="bfbcdfac69cbe6dc" fallback="Colour: "/><strong style={{ color: "#5b1f2b" }}>{cardColors[product.id] || "Cognac"}</strong>
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
                          <CmsText field="4ddb46dd7100a8c4" fallback="Leather:"/></span>
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
                          <CmsText field="ae6045cd265bb36f" fallback="Shape:"/></span>
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
                          <Eye size={13} /> <CmsText field="a11486ce1233bbc7" fallback="Quick View / Customize"/></button>
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
                          <CmsText field="d00cb8c0ff9f02e6" fallback="Details "/><ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </CmsSection>

      {/* 7. WHY SHOP WITH US (SPOTIFY VALUE PILLARS) */}
      <CmsSection id="benefits" className="atelier-section" sectionKey="62e74d20de761d65">
        <div className="section-heading">
          <div>
            <p className="eyebrow"><CmsText field="d2ae27c0689a9b87" fallback="WHY SHOP DIOKA"/></p>
            <h2>
              <CmsText field="a4f5c3b13ae41afa" fallback="Built to last."/><br />
              <em><CmsText field="8dad2e2a801171b1" fallback="Made to love."/></em>
            </h2>
          </div>
          <p><CmsText field="d6a74c2141c69f82" fallback="We believe in high-quality materials, honest craftsmanship, and stress-free shopping with free delivery worldwide."/></p>
        </div>

        <div className="atelier-grid">
          <div className="atelier-card">
            <div className="atelier-card-icon">
              <Sparkles size={22} />
            </div>
            <h4><CmsText field="802a495db10393a0" fallback="100% Genuine Full-Grain Leather"/></h4>
            <p><CmsText field="306295d4fa31c25a" fallback="Hand-selected European calfskin and Merino shearling. Develops a richer, softer patina with every single wear."/></p>
          </div>

          <div className="atelier-card">
            <div className="atelier-card-icon">
              <Truck size={22} />
            </div>
            <h4><CmsText field="397ac52612b5c88c" fallback="Free Express Shipping"/></h4>
            <p><CmsText field="ec4fd9ab8c3a5463" fallback="Fast, tracked courier shipping straight to your door. All customs, duties, and taxes are completely covered."/></p>
          </div>

          <div className="atelier-card">
            <div className="atelier-card-icon">
              <RotateCcw size={22} />
            </div>
            <h4><CmsText field="e5cffbb4385eb4f8" fallback="30-Day Easy Returns"/></h4>
            <p><CmsText field="d8955a8999f4f484" fallback="Try it on at home. If the size or fit isn't 100% right, exchange or return it with our prepaid return label."/></p>
          </div>

          <div className="atelier-card">
            <div className="atelier-card-icon">
              <Shield size={22} />
            </div>
            <h4><CmsText field="870111a31f392373" fallback="2-Year Quality Warranty"/></h4>
            <p><CmsText field="8def644c224944ff" fallback="Reinforced double-stitching, solid brass hardware, and heavy-duty zippers built for multi-decade durability."/></p>
          </div>
        </div>
      </CmsSection>

      {/* 8. OUR STORY */}
      <CmsSection id="story" className="story-section" sectionKey="4e7b70b538f330e3">
        <div className="story-mark">
          <p><CmsText field="d9601a73f4389dfa" fallback="DIOKA · PREMIUM ESSENTIALS"/></p>
          <span aria-hidden="true"><CmsText field="4111850fc9fe317d" fallback="D"/></span>
          <p><CmsText field="36eb5d923e637d14" fallback="CRAFTED FOR EVERYDAY LIFE"/></p>
        </div>
        <div className="story-copy">
          <p className="eyebrow"><CmsText field="e1a163f1c6b32847" fallback="OUR STORY"/></p>
          <h2>
            <CmsText field="32a0e9e366a0b53c" fallback="Quality you can"/><br />
            <em><CmsText field="61b08e3010e720cd" fallback="feel every day."/></em>
          </h2>
          <p>
            <CmsText field="ee3316f2b7420e8d" fallback="We started Dioka with a clear mission: create everyday leather essentials that look sharp, feel comfortable, and endure for decades. No synthetic shortcuts, no seasonal obsolescence."/></p>
          <p>
            <CmsText field="306e96a85d25d7c7" fallback="From the comfortable curve of our shoulder bags to the shock-absorbing footbeds of our Chelsea boots, every design decision is made for real-world wear."/></p>
          <CmsLink
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
            }} hrefKey="1ae3031da6961fac"
          >
            <CmsText field="09eb60662473385e" fallback="Explore the Bags Collection "/><ArrowRight size={16} />
          </CmsLink>
        </div>
      </CmsSection>

      {/* 9. CUSTOMER REVIEWS */}
      <CmsSection id="reviews" className="press-section" sectionKey="ebcaa4cd8e43253d">
        <p className="eyebrow" style={{ textAlign: "center" }}>
          <CmsText field="218f605407622607" fallback="CUSTOMER REVIEWS"/></p>
        <h3 style={{ textAlign: "center", fontSize: "32px", margin: "8px 0 32px", color: "#123d32" }}>
          <CmsText field="f628a6dc92f741fd" fallback="Rated 4.9 / 5 by verified buyers"/></h3>
        <div className="press-grid">
          <div className="press-card">
            <div style={{ display: "flex", gap: "2px", marginBottom: "12px", color: "#5b1f2b" }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#5b1f2b" />
              ))}
            </div>
            <p className="press-quote">
              <CmsText field="5f53403051a00d2f" fallback="“The Arc Shoulder Bag is literally my everyday bag now. The leather smells incredible, the strap doesn't slip off my shoulder, and it fits everything effortlessly.”"/></p>
            <span className="press-author"><CmsText field="dd7b75cb0109a120" fallback="Sarah M. · Verified Buyer (New York)"/></span>
          </div>

          <div className="press-card">
            <div style={{ display: "flex", gap: "2px", marginBottom: "12px", color: "#5b1f2b" }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#5b1f2b" />
              ))}
            </div>
            <p className="press-quote">
              <CmsText field="0fc77c15bd848393" fallback="“These Chelsea boots required zero break-in period. Extremely comfortable arch support from day one, and the stacked heel is the ideal everyday height.”"/></p>
            <span className="press-author"><CmsText field="05cdcca189a826f3" fallback="James T. · Verified Buyer (London)"/></span>
          </div>

          <div className="press-card">
            <div style={{ display: "flex", gap: "2px", marginBottom: "12px", color: "#5b1f2b" }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#5b1f2b" />
              ))}
            </div>
            <p className="press-quote">
              <CmsText field="4780cb845043457b" fallback="“The lambskin jacket is butter-soft. Flawless tailoring and looks effortlessly sharp with just a white tee and jeans. The leather quality is remarkable.”"/></p>
            <span className="press-author"><CmsText field="7540c5d32d2c906b" fallback="Elena V. · Verified Buyer (Berlin)"/></span>
          </div>
        </div>
      </CmsSection>

      {/* 10. NEWSLETTER & DISCOUNT */}
      <CmsSection className="newsletter-section" sectionKey="a10491cec8c3b38a">
        <div className="newsletter-box">
          <p className="eyebrow"><CmsText field="1c07557c31e2e10c" fallback="ATELIER NOTES"/></p>
          <h3><CmsText field="68314d7a35a14eef" fallback="Stay close to the atelier"/></h3>
          <p><CmsText field="40625a871f1a3978" fallback="Subscribe for collection announcements, atelier news, and style guides."/></p>

          {newsletterSuccess ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#123d32", fontWeight: 600 }}>
              <Check size={20} color="#123d32" />
              <span><CmsText field="a51f0599dcd65363" fallback="You're subscribed. Thank you for joining the Dioka community."/></span>
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
              <button type="submit"><CmsText field="49f236d607bbc8bb" fallback="Subscribe"/></button>
            </form>
          )}
        </div>
      </CmsSection>

      <StorePolicies />
      <SiteFooter />
    </CmsPage>
  );
}
