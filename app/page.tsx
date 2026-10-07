"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Category, Product, formatPrice, products } from "@/lib/products";

type CartItem = { id: string; size: string; quantity: number };
type Filter = "All" | Category;

function safeCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item && typeof item.id === "string" && typeof item.size === "string" && Number.isInteger(item.quantity) && item.quantity > 0 && products.some((p) => p.id === item.id && p.sizes.includes(item.size))).slice(0, 30);
}

export default function Home() {
  const [filter, setFilter] = useState<Filter>("All");
  const [selected, setSelected] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutAvailable, setCheckoutAvailable] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [cartLoaded, setCartLoaded] = useState(false);

  useEffect(() => {
    try { setCart(safeCart(JSON.parse(localStorage.getItem("dioka-cart") || "[]"))); } catch { setCart([]); }
    setCartLoaded(true);
  }, []);
  useEffect(() => { if (cartLoaded) localStorage.setItem("dioka-cart", JSON.stringify(cart)); }, [cart, cartLoaded]);
  useEffect(() => {
    fetch("/api/checkout").then((response) => response.json()).then((data: { available?: boolean }) => setCheckoutAvailable(Boolean(data.available))).catch(() => setCheckoutAvailable(false));
  }, []);
  useEffect(() => {
    const targets = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("in-view"); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  const visibleProducts = useMemo(() => filter === "All" ? products : products.filter((p) => p.category === filter), [filter]);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (products.find((p) => p.id === item.id)?.price || 0) * item.quantity, 0);
  const viewProduct = (product: Product) => { setSelected(product); setSelectedSize(product.sizes.length === 1 ? product.sizes[0] : ""); };
  const shopCategory = (category: Filter) => {
    setFilter(category); setMenuOpen(false);
    setTimeout(() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }), 0);
  };
  const addToCart = () => {
    if (!selected || !selectedSize) return;
    setCart((items) => {
      const match = items.find((item) => item.id === selected.id && item.size === selectedSize);
      if (match) return items.map((item) => item === match ? { ...item, quantity: Math.min(item.quantity + 1, 10) } : item);
      return [...items, { id: selected.id, size: selectedSize, quantity: 1 }];
    });
    setSelected(null); setCartOpen(true); setCheckoutError("");
  };
  const changeQuantity = (id: string, size: string, delta: number) =>
    setCart((items) => items.map((item) => item.id === id && item.size === size ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0));
  const checkout = async () => {
    if (!checkoutAvailable) return;
    setCheckoutBusy(true); setCheckoutError("");
    try {
      const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: cart }) });
      const data = await response.json() as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error || "Checkout is unavailable right now.");
      window.location.assign(data.url);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Checkout is unavailable right now.");
      setCheckoutBusy(false);
    }
  };

  return <main>
    <div className="announcement"><span>DIOKA / AN EDIT IN LEATHER</span><span>COLLECTION PREVIEW</span></div>
    <header className="site-header">
          <nav className="header-left" aria-label="Main navigation"><button className="mobile-menu-trigger" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle menu">{menuOpen ? <X size={22}/> : <span>MENU</span>}</button><a href="#collections">Collections</a><a href="#shop">The edit</a><a href="#story">Our story</a></nav>
          <a className="wordmark" href="#top" aria-label="Dioka home">DIOKA<span>®</span></a>
          <div className="header-right"><span>USD / EN</span><a href="/admin" className="admin-link">Admin</a><button className="cart-trigger" onClick={() => setCartOpen(true)} aria-label={`Open shopping bag with ${cartCount} items`}><ShoppingBag size={20} strokeWidth={1.5}/><span>{cartCount}</span></button></div>
        </header>
    {menuOpen && <nav className="mobile-menu" aria-label="Mobile navigation"><button onClick={() => shopCategory("All")}>Shop all</button><button onClick={() => shopCategory("Bags")}>Bags</button><button onClick={() => shopCategory("Footwear")}>Footwear</button><button onClick={() => shopCategory("Jackets")}>Jackets</button><a href="#story" onClick={() => setMenuOpen(false)}>Our story</a></nav>}

    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <div className="hero-topline"><span>THE DIOKA EDIT</span><span>ISSUE NO. 001</span></div>
        <div className="hero-main"><p className="eyebrow">BAGS / FOOTWEAR / LEATHER JACKETS</p><h1 id="hero-title">A life in<br/><em>leather.</em></h1><p className="hero-description">Pieces with presence, made to find their place in your everyday. An edit for every version of you.</p><a className="dark-button" href="#shop">Explore the edit <ArrowUpRight size={18}/></a></div>
        <div className="hero-index"><span>01 / FORM</span><span>02 / FEELING</span><span>03 / EVERYDAY</span></div>
      </div>
      <div className="hero-image-wrap"><div className="hero-photo"><Image className="hero-image" src="/dioka-hero-editorial.webp" alt="Model in a black leather jacket carrying a burgundy leather bag" fill priority sizes="(max-width: 900px) 100vw, 56vw"/></div><div className="hero-image-caption"><span>AN EDIT FOR THE EVERYDAY</span><span>CAMPAIGN / 001</span></div></div>
    </section>
    <nav className="category-rail" aria-label="Shop by category"><button onClick={() => shopCategory("Bags")}><span>01</span><strong>Bags</strong><ArrowUpRight size={18}/></button><button onClick={() => shopCategory("Footwear")}><span>02</span><strong>Footwear</strong><ArrowUpRight size={18}/></button><button onClick={() => shopCategory("Jackets")}><span>03</span><strong>Leather jackets</strong><ArrowUpRight size={18}/></button></nav>

    <section id="collections" className="collections-section reveal">
      <div className="section-heading"><div><p className="eyebrow">01 / THE COLLECTIONS</p><h2>Considered<br/><em>essentials.</em></h2></div><p>Three pieces of the wardrobe, each with a point of view.</p></div>
      <div className="collection-grid">
        <button onClick={() => shopCategory("Bags")} className="collection-card bag-card"><span className="collection-media"><Image src="/dioka-brown-bag.webp" alt="Sculptural cognac leather bag" fill sizes="(max-width: 900px) 100vw, 55vw"/></span><span className="collection-label"><span className="collection-number">01 / THE OBJECT</span><strong>Bags</strong><span>Explore <ArrowUpRight size={18}/></span></span></button>
        <button onClick={() => shopCategory("Footwear")} className="collection-card footwear-card"><span className="collection-media"><Image src="/dioka-footwear-editorial.png" alt="Black leather ankle boots" fill sizes="(max-width: 900px) 100vw, 45vw"/></span><span className="collection-label"><span className="collection-number">02 / THE FOUNDATION</span><strong>Footwear</strong><span>Explore <ArrowUpRight size={18}/></span></span></button>
        <button onClick={() => shopCategory("Jackets")} className="collection-card jacket-card"><span className="collection-media"><Image src="/dioka-jacket-editorial.png" alt="Black leather jacket" fill sizes="(max-width: 900px) 100vw, 45vw"/></span><span className="collection-label"><span className="collection-number">03 / THE LAYER</span><strong>Leather jackets</strong><span>Explore <ArrowUpRight size={18}/></span></span></button>
      </div>
    </section>

    <section id="shop" className="shop-section reveal">
      <div className="shop-heading"><div><p className="eyebrow">02 / THE EDIT</p><h2>Pieces with<br/><em>presence.</em></h2></div><p>Explore the collection preview. Product details and prices shown here are illustrative.</p></div>
      <div className="filter-row" role="group" aria-label="Filter products">{(["All", "Bags", "Footwear", "Jackets"] as Filter[]).map((category) => <button key={category} className={filter === category ? "active" : ""} onClick={() => setFilter(category)} aria-pressed={filter === category}>{category === "All" ? "Shop all" : category}<span>{category === "All" ? products.length : products.filter((p) => p.category === category).length}</span></button>)}</div>
      <div className="product-grid">{visibleProducts.map((product, index) => <article className="product-card" key={product.id}>
        <button className="product-image-button" onClick={() => viewProduct(product)} aria-label={`View ${product.name}`}><Image src={product.image} alt={product.name} fill sizes="(max-width: 760px) 100vw, 33vw" style={{ objectPosition: product.position }}/></button>
        <div className="product-meta"><div className="product-meta-top"><p>{product.category} / {product.color}</p><span className="product-index">0{index + 1} / 0{visibleProducts.length}</span></div><div className="product-meta-main"><h3>{product.name}</h3><span>{formatPrice(product.price)}</span></div><button className="quick-view" onClick={() => viewProduct(product)}>View piece <ArrowUpRight size={17}/></button></div>
      </article>)}</div>
    </section>

    <section id="story" className="story-section reveal"><div className="story-mark"><p>DIOKA / POINT OF VIEW</p><span aria-hidden="true">D</span><p>FORM / FEELING / LIFE</p></div><div className="story-copy"><p className="eyebrow">03 / THE POINT OF VIEW</p><h2>Made to be<br/><em>lived in.</em></h2><p>Dioka is a wardrobe of companions: the bag you reach for without thinking, the boots that go the distance, the jacket that feels more like you each time you wear it.</p><p>Built around shape, texture, and movement, each piece is designed to make its own place in your everyday.</p><a href="#shop" className="text-link">Discover the edit <ArrowUpRight size={18}/></a></div></section>

    <footer className="footer"><div className="footer-top"><p className="eyebrow">DIOKA / AN EDIT IN LEATHER</p><a href="#top">Back to top ↑</a></div><div className="footer-wordmark">DIOKA</div><div className="footer-bottom"><p>Bags, footwear, and leather jackets for every version of you.</p><nav aria-label="Footer navigation"><a href="#collections">Collections</a><a href="#shop">The edit</a><a href="#story">Our story</a></nav><span>© {new Date().getFullYear()} Dioka</span></div></footer>

    <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
      <DialogContent className="product-dialog" showCloseButton={true}>
        {selected && <><div className="dialog-image"><Image src={selected.image} alt={selected.name} fill sizes="(max-width: 760px) 100vw, 50vw" style={{ objectPosition: selected.position }}/></div><div className="dialog-info"><p className="eyebrow">{selected.category} / {selected.color}</p><DialogTitle>{selected.name}</DialogTitle><p className="dialog-price">{formatPrice(selected.price)}</p><DialogDescription>{selected.description}</DialogDescription><div className="size-heading"><span>{selected.category === "Bags" ? "SIZE" : "SELECT SIZE"}</span>{selected.category !== "Bags" && <span>{selected.category === "Footwear" ? "EU sizing" : "Unisex sizing"}</span>}</div><div className="size-grid">{selected.sizes.map((size) => <button key={size} className={selectedSize === size ? "selected" : ""} onClick={() => setSelectedSize(size)} aria-pressed={selectedSize === size}>{size}</button>)}</div><button className="dark-button add-to-bag" disabled={!selectedSize} onClick={addToCart}>Add to bag <Plus size={18}/></button><p className="dialog-note">Collection preview. Product details and pricing are illustrative.</p></div></>}
      </DialogContent>
    </Dialog>

    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="cart-sheet" showCloseButton={true}><div className="cart-header"><p className="eyebrow">YOUR SELECTION</p><SheetTitle>Shopping bag <span>({cartCount})</span></SheetTitle><SheetDescription>Save and review pieces from the collection preview.</SheetDescription></div>
        {cart.length === 0 ? <div className="cart-empty"><ShoppingBag size={42} strokeWidth={1}/><h3>Your bag is empty</h3><p>Find something worth carrying with you.</p><button onClick={() => { setCartOpen(false); shopCategory("All"); }} className="dark-button">Explore the edit <ArrowUpRight size={17}/></button></div> :
        <><div className="cart-items">{cart.map((item) => { const product = products.find((p) => p.id === item.id)!; return <div className="cart-item" key={item.id + item.size}><div className="cart-item-image"><Image src={product.image} alt="" fill sizes="100px" style={{ objectPosition: product.position }}/></div><div className="cart-item-info"><p>{product.category}</p><h3>{product.name}</h3><span>{item.size} / {product.color}</span><div className="quantity"><button onClick={() => changeQuantity(item.id, item.size, -1)} aria-label={`Remove one ${product.name}`}><Minus size={14}/></button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id, item.size, 1)} disabled={item.quantity >= 10} aria-label={`Add one ${product.name}`}><Plus size={14}/></button></div></div><strong>{formatPrice(product.price * item.quantity)}</strong></div>; })}</div><div className="cart-summary"><div><span>Preview subtotal</span><strong>{formatPrice(subtotal)}</strong></div><p>Sample products and prices. Checkout will open after the final catalog and payment setup are complete.</p>{checkoutError && <p className="checkout-error" role="alert">{checkoutError}</p>}<button className="dark-button checkout-button" disabled={checkoutBusy || !checkoutAvailable} onClick={checkout}>{checkoutAvailable ? checkoutBusy ? "Preparing checkout…" : "Continue to checkout" : "Checkout coming soon"} <ArrowUpRight size={17}/></button><button className="continue-shopping" onClick={() => setCartOpen(false)}>Continue shopping</button></div></>}
      </SheetContent>
    </Sheet>
  </main>;
}

