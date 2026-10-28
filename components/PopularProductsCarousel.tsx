"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { shouldBypassImageOptimization } from "@/lib/image-source";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Eye, ShoppingCart, Star } from "lucide-react";
import type { Product } from "@/lib/products";

export function PopularProductsCarousel({
  products,
  formatPrice,
  onQuickView,
  onAddToCart,
}: {
  products: Product[];
  formatPrice: (amount: number) => string;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}) {
  const items = useMemo(
    () => [...products].sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0) || (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 6),
    [products],
  );
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const activeIndex = Math.min(active, Math.max(0, items.length - 1));

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || items.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % items.length), 6500);
    return () => window.clearInterval(timer);
  }, [items.length, paused, reducedMotion]);

  if (!items.length) return null;
  const move = (amount: number) => setActive((current) => (current + amount + items.length) % items.length);

  return (
    <div
      className="popular-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Popular Dioka pieces"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className="popular-viewport">
        <div className="popular-track" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
          {items.map((product, index) => (
            <article className="popular-slide" key={product.id} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${items.length}`} aria-hidden={activeIndex !== index}>
              <Link href={`/products/${product.id}`} className="popular-image" tabIndex={activeIndex === index ? 0 : -1} aria-label={`View ${product.name}`}>
                <Image src={product.image} alt={product.name} fill sizes="(max-width: 760px) 88vw, 56vw" priority={index === 0} unoptimized={shouldBypassImageOptimization(product.image)} style={{ objectPosition: product.position || "center" }} />
                <span className="popular-image-caption">DIOKA ATELIER <span>·</span> MOST LOVED</span>
              </Link>
              <div className="popular-details">
                <div className="popular-index"><span>CLIENT FAVOURITE</span><span>{String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span></div>
                <div>
                  <p className="popular-category">{product.category === "Footwear" ? "SHOES & BOOTS" : product.category.toUpperCase()}</p>
                  <Link href={`/products/${product.id}`} className="popular-title" tabIndex={activeIndex === index ? 0 : -1}>{product.name}</Link>
                  <p className="popular-description">{product.subtitle || product.description}</p>
                  <div className="popular-rating"><Star size={13} fill="currentColor"/><span>{(product.rating ?? 4.9).toFixed(1)}</span><span className="popular-review-count">({product.reviews ?? 0} client reviews)</span></div>
                </div>
                <div className="popular-actions">
                  <strong>{formatPrice(product.price)}</strong>
                  <div>
                    <button type="button" className="popular-add-to-cart" onClick={() => onAddToCart(product)} disabled={product.inStock === false || (product.stockQuantity ?? 10) < 1} tabIndex={activeIndex === index ? 0 : -1}>
                      <ShoppingCart size={15}/>{product.inStock === false || (product.stockQuantity ?? 10) < 1 ? "Sold out" : "Add to Cart"}
                    </button>
                    <button type="button" className="popular-quick-view" onClick={() => onQuickView(product)} tabIndex={activeIndex === index ? 0 : -1}><Eye size={15}/> Quick view</button>
                    <Link href={`/products/${product.id}`} className="popular-shop-link" tabIndex={activeIndex === index ? 0 : -1}>Discover piece <ArrowRight size={15}/></Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="popular-carousel-controls">
        <div className="popular-dots" aria-label="Choose a popular piece">
          {items.map((product, index) => <button key={product.id} type="button" className={activeIndex === index ? "active" : ""} aria-label={`Show ${product.name}`} aria-current={activeIndex === index ? "true" : undefined} onClick={() => setActive(index)} />)}
        </div>
        <span className="popular-count">{String(activeIndex + 1).padStart(2, "0")} <i/> {String(items.length).padStart(2, "0")}</span>
        <div className="popular-arrows">
          <button type="button" aria-label="Previous popular piece" onClick={() => move(-1)}><ArrowLeft size={17}/></button>
          <button type="button" aria-label="Next popular piece" onClick={() => move(1)}><ArrowRight size={17}/></button>
        </div>
      </div>
    </div>
  );
}
