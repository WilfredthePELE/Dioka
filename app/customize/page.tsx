"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Crown,
  RotateCcw,
  Scissors,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useStore } from "@/lib/store-context";
import { type Product, type Category } from "@/lib/products";

// Configurable models based on the Dioka catalogue
interface CustomBaseModel {
  id: string;
  name: string;
  category: Category;
  basePrice: number;
  image: string;
  defaultColor: string;
  availableSizes: string[];
  description: string;
  specs: string;
}

const BASE_MODELS: CustomBaseModel[] = [
  // Bags
  {
    id: "arc-shoulder-bag",
    name: "Arc Leather Shoulder Bag",
    category: "Bags",
    basePrice: 285,
    image: "/dioka-brown-bag.webp",
    defaultColor: "Cognac Brown",
    availableSizes: ["Standard (32 × 24 cm)", "Grand (38 × 29 cm)"],
    description: "Curved silhouette crafted to rest effortlessly on the shoulder. Magnetic clasp & internal zip compartment.",
    specs: "32cm W × 24cm H × 9cm D · Strap drop: 28cm",
  },
  {
    id: "atelier-weekender",
    name: "Voyager Travel Duffle",
    category: "Bags",
    basePrice: 640,
    image: "/dioka_weekender_bag_1791376853630.jpg",
    defaultColor: "Espresso Brown",
    availableSizes: ["Carry-on 37L (52 × 31 cm)", "Extended 50L (60 × 35 cm)"],
    description: "Generous travel companion with laptop compartment, dual-zip top, and protective brass base feet.",
    specs: "52cm W × 31cm H × 23cm D · Airline carry-on approved",
  },
  {
    id: "atelier-saddle-bag",
    name: "Classic Saddle Crossbody Bag",
    category: "Bags",
    basePrice: 320,
    image: "/dioka_saddle_bag_1791376838607.jpg",
    defaultColor: "Classic Black",
    availableSizes: ["Standard (26 × 19 cm)"],
    description: "Structured everyday crossbody with curved flap, turn-lock closure, and dual interior compartments.",
    specs: "26cm W × 19cm H × 7.5cm D · Strap: 45–56cm",
  },
  // Footwear
  {
    id: "column-ankle-boot",
    name: "Chelsea Heeled Ankle Boot",
    category: "Footwear",
    basePrice: 340,
    image: "/dioka-footwear-editorial.png",
    defaultColor: "Black",
    availableSizes: ["EU 38", "EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45"],
    description: "45mm stacked heel, memory-foam arch bed, and Goodyear-welted resoleable construction.",
    specs: "45mm heel · Goodyear welted · Inner side zipper",
  },
  {
    id: "square-toe-chelsea",
    name: "Heritage Pull-On Chelsea Boot",
    category: "Footwear",
    basePrice: 380,
    image: "/dioka_chelsea_boots_1791376865127.jpg",
    defaultColor: "Raw Umber Brown",
    availableSizes: ["EU 38", "EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45"],
    description: "Heavy oiled leather with high-resilience stretch side panels and all-weather Vibram traction soles.",
    specs: "38mm heel · Storm-welted · Stretch side panels",
  },
  {
    id: "lug-atelier-derby",
    name: "Lug-Sole Leather Derby",
    category: "Footwear",
    basePrice: 320,
    image: "/dioka_derby_shoes_1791376877192.jpg",
    defaultColor: "Polished Black",
    availableSizes: ["EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45"],
    description: "4-eyelet dress derby with shock-absorbing cork footbed and ultralight Italian lug outsole.",
    specs: "Extralight lug sole · Cork footbed · Blind eyelets",
  },
  // Jackets
  {
    id: "transit-leather-jacket",
    name: "Classic Lambskin Leather Jacket",
    category: "Jackets",
    basePrice: 560,
    image: "/dioka-jacket-editorial.png",
    defaultColor: "Black",
    availableSizes: ["XS", "S", "M", "L", "XL", "XXL"],
    description: "Tailored lambskin with sharp point collar, pleated action back, and two internal passport pockets.",
    specs: "0.9mm drum-dyed lambskin · Cupro satin lining",
  },
  {
    id: "belted-leather-trench",
    name: "Belted Leather Trench Coat",
    category: "Jackets",
    basePrice: 780,
    image: "/dioka_trench_coat_1791376905616.jpg",
    defaultColor: "Cognac Brown",
    availableSizes: ["XS", "S", "M", "L", "XL"],
    description: "Statement mid-length trench with removable tie belt, storm flap, and deep walking vent.",
    specs: "114cm center length · Calf nappa · Horn buttons",
  },
  {
    id: "shearling-flight-bomber",
    name: "Merino Aviator Bomber Jacket",
    category: "Jackets",
    basePrice: 890,
    image: "/dioka_shearling_jacket_1791376893868.jpg",
    defaultColor: "Distressed Espresso",
    availableSizes: ["S", "M", "L", "XL", "XXL"],
    description: "Double-faced Spanish Merino shearling with plush curly wool interior and twin throat latch buckles.",
    specs: "100% Merino shearling · Solid brass buckles",
  },
];

const LEATHERS = [
  {
    id: "tuscan-calf",
    name: "Full-Grain Tuscan Calfskin",
    priceAddon: 0,
    description: "Supple yet durable European calfskin. Smooth natural grain that deepens with wear.",
    tag: "Atelier Classic",
  },
  {
    id: "buttery-lamb",
    name: "Drum-Dyed French Lambskin",
    priceAddon: 45,
    description: "Extremely soft 0.9mm nappa lambskin with immediate drape and zero break-in period.",
    tag: "Ultra Soft",
  },
  {
    id: "oiled-pullup",
    name: "Waxed Pull-Up Leather",
    priceAddon: 30,
    description: "Richly conditioned with hot oils & waxes. Creates dramatic shade shifts with every crease.",
    tag: "Vintage Patina",
  },
  {
    id: "merino-shearling",
    name: "Spanish Merino Shearling",
    priceAddon: 120,
    description: "Natural curly wool shearling offering exceptional insulation and iconic heritage texture.",
    tag: "Cold-Weather Luxury",
  },
];

const COLOR_PALETTE = [
  { name: "Cognac Brown", hex: "#8a4f27", border: "#6c3a19", code: "cognac" },
  { name: "Espresso Dark Brown", hex: "#342217", border: "#22150e", code: "espresso" },
  { name: "Obsidian Black", hex: "#161616", border: "#000000", code: "black" },
  { name: "Forest Emerald", hex: "#123d32", border: "#0b261f", code: "emerald" },
  { name: "Oxblood Bordeaux", hex: "#5b1f2b", border: "#3c131c", code: "oxblood" },
  { name: "Saddle Tan", hex: "#c78e58", border: "#a6713e", code: "tan" },
];

const HARDWARE_OPTIONS = [
  { id: "polished-brass", name: "Polished Solid Brass", color: "#d4af37", note: "Classic warm gold shine" },
  { id: "brushed-antique", name: "Antique Brushed Brass", color: "#bfa36f", note: "Vintage muted artisan tone" },
  { id: "palladium-silver", name: "Palladium Silver", color: "#dcdde1", note: "Polished high-durability silver" },
  { id: "matte-gunmetal", name: "Matte Gunmetal", color: "#485460", note: "Contemporary discreet dark finish" },
];

const LININGS = [
  { id: "herringbone-cotton", name: "Italian Herringbone Cotton", note: "Heavy-duty breathable natural weave (Cream)" },
  { id: "cupro-satin", name: "Silky Cupro Satin", note: "Fluid, anti-static jacquard lining (Emerald green)" },
  { id: "merino-flannel", name: "Merino Wool Flannel", note: "Brushed insulating luxury flannel (Charcoal)" },
];

const FOIL_STYLES = [
  { id: "gold-foil", name: "24k Hot-Foil Gold", color: "#d4af37", badge: "Gold Stamped" },
  { id: "silver-foil", name: "Sterling Silver Foil", color: "#e0e0e0", badge: "Silver Stamped" },
  { id: "blind-stamp", name: "Blind Debossed", color: "#4a3b32", badge: "Heat Stamped (No Foil)" },
];

export default function CustomizePage() {
  const { formatPrice, addToCart, showToast } = useStore();

  // Active configuration state
  const [selectedCategory, setSelectedCategory] = useState<Category>("Bags");
  const [selectedModelId, setSelectedModelId] = useState<string>("arc-shoulder-bag");
  const [selectedLeatherId, setSelectedLeatherId] = useState<string>("tuscan-calf");
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [selectedHardwareId, setSelectedHardwareId] = useState<string>("polished-brass");
  const [selectedLiningId, setSelectedLiningId] = useState<string>("herringbone-cotton");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [monogramEnabled, setMonogramEnabled] = useState(true);
  const [monogramText, setMonogramText] = useState("DK");
  const [monogramFoilId, setMonogramFoilId] = useState("gold-foil");
  const [monogramPlacement, setMonogramPlacement] = useState("Exterior Flap");
  const [customNotes, setCustomNotes] = useState("");
  const [isCommissioning, setIsCommissioning] = useState(false);

  // Filter models for category
  const categoryModels = useMemo(() => {
    return BASE_MODELS.filter((m) => m.category === selectedCategory);
  }, [selectedCategory]);

  // Current active model
  const currentModel = useMemo(() => {
    return BASE_MODELS.find((m) => m.id === selectedModelId) || categoryModels[0];
  }, [selectedModelId, categoryModels]);

  // When category changes, keep active model valid
  const handleSelectCategory = (cat: Category) => {
    setSelectedCategory(cat);
    const firstOfCat = BASE_MODELS.find((m) => m.category === cat);
    if (firstOfCat) {
      setSelectedModelId(firstOfCat.id);
      setSelectedSize(firstOfCat.availableSizes[0] || "");
    }
  };

  const currentLeather = useMemo(() => {
    return LEATHERS.find((l) => l.id === selectedLeatherId) || LEATHERS[0];
  }, [selectedLeatherId]);

  const currentHardware = useMemo(() => {
    return HARDWARE_OPTIONS.find((h) => h.id === selectedHardwareId) || HARDWARE_OPTIONS[0];
  }, [selectedHardwareId]);

  const currentLining = useMemo(() => {
    return LININGS.find((l) => l.id === selectedLiningId) || LININGS[0];
  }, [selectedLiningId]);

  const currentFoil = useMemo(() => {
    return FOIL_STYLES.find((f) => f.id === monogramFoilId) || FOIL_STYLES[0];
  }, [monogramFoilId]);

  // Calculate customized price
  const totalPrice = useMemo(() => {
    let price = currentModel.basePrice;
    price += currentLeather.priceAddon;
    if (monogramEnabled && monogramText.trim()) {
      price += 25; // Bespoke hot-stamping fee
    }
    return price;
  }, [currentModel, currentLeather, monogramEnabled, monogramText]);

  const activeSize = selectedSize || currentModel.availableSizes[0] || "Custom Fit";

  // Handle adding customized commission to cart
  const handleAddToBag = () => {
    setIsCommissioning(true);

    const bespokeProduct: Product = {
      id: `bespoke-${currentModel.id}-${Date.now().toString(36)}`,
      name: `Bespoke ${currentModel.name} · ${selectedColor.name}`,
      category: currentModel.category,
      price: totalPrice,
      image: currentModel.image,
      position: "center center",
      sizes: [activeSize],
      color: `${selectedColor.name} (${currentLeather.name})`,
      subtitle: `Bespoke Commission · ${currentLeather.name}`,
      description: `Bespoke Dioka atelier piece. Leather: ${currentLeather.name} in ${selectedColor.name}. Hardware: ${currentHardware.name}. Lining: ${currentLining.name}. Monogram: ${
        monogramEnabled && monogramText.trim() ? `${monogramText.toUpperCase()} (${currentFoil.name} on ${monogramPlacement})` : "None"
      }. ${customNotes ? `Notes: ${customNotes}` : ""}`,
      materials: `${currentLeather.name}, ${currentHardware.name}, ${currentLining.name}.`,
      dimensions: currentModel.specs,
      care: "Individually handcrafted. Includes breathable cotton storage bag, organic beeswax leather balm, and certificate of origin.",
      details: [
        `Hand-selected leather: ${currentLeather.name} in ${selectedColor.name}`,
        `Hardware: ${currentHardware.name}`,
        `Interior lining: ${currentLining.name}`,
        `Personalization: ${monogramEnabled && monogramText.trim() ? `${monogramText.toUpperCase()} (${currentFoil.name})` : "Standard Atelier Mark"}`,
        `Made-to-order turnaround: 10–14 business days in European Atelier`,
      ],
      inStock: true,
      stockQuantity: 5,
      rating: 5,
      reviews: 1,
    };

    addToCart(bespokeProduct, activeSize, 1);
    showToast(`Added Bespoke ${currentModel.name} to your bag!`);

    setTimeout(() => {
      setIsCommissioning(false);
    }, 600);
  };

  return (
    <main>
      <SiteHeader />

      {/* Breadcrumbs */}
      <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "16px 5% 0" }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: "12px", color: "#888", display: "flex", gap: "8px" }}>
          <Link href="/" style={{ color: "#666", textDecoration: "none" }}>
            Home
          </Link>
          <span>/</span>
          <span style={{ color: "#123d32", fontWeight: 700 }}>Customize (Atelier Bespoke)</span>
        </nav>
      </div>

      {/* Hero Header */}
      <section style={{ maxWidth: "1320px", margin: "0 auto", padding: "20px 5% 36px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px", borderBottom: "1px solid #e2ddd5", paddingBottom: "24px" }}>
          <div style={{ maxWidth: "760px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(18, 61, 50, 0.08)", padding: "4px 10px", borderRadius: "2px", marginBottom: "8px" }}>
              <Crown size={14} color="#123d32" />
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#123d32" }}>
                DIOKA BESPOKE ATELIER
              </span>
            </div>
            <h1 style={{ fontFamily: "var(--dioka-font)", fontSize: "clamp(34px, 4.5vw, 56px)", lineHeight: "1", margin: "0 0 12px", color: "#123d32", fontWeight: 600 }}>
              Customize Your Creation
            </h1>
            <p style={{ fontSize: "16px", color: "#596f64", lineHeight: "1.5", margin: 0 }}>
              Work directly with our European workshop. Select your hide, finish, hardware, and personalized 24k gold or blind debossed initials. Hand-stitched to order in 10 to 14 days.
            </p>
          </div>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 600, color: "#123d32" }}>
              <Scissors size={16} color="#5b1f2b" />
              <span>Cut & Stitched by Master Artisans</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 600, color: "#123d32" }}>
              <Truck size={16} color="#166534" />
              <span>Complimentary Worldwide Courier</span>
            </div>
          </div>
        </div>

        {/* 1. Category Switcher */}
        <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
          {(["Bags", "Footwear", "Jackets"] as Category[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleSelectCategory(cat)}
              style={{
                padding: "10px 24px",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: ".06em",
                textTransform: "uppercase",
                borderRadius: "2px",
                border: selectedCategory === cat ? "2px solid #123d32" : "1px solid #d4cdc5",
                background: selectedCategory === cat ? "#123d32" : "#fff",
                color: selectedCategory === cat ? "#fff" : "#333",
                cursor: "pointer",
                transition: "all .2s ease",
              }}
            >
              {cat === "Footwear" ? "Shoes & Boots" : cat === "Jackets" ? "Leather Jackets" : cat}
            </button>
          ))}
        </div>
      </section>

      {/* Main Customizer Workspace */}
      <section style={{ maxWidth: "1320px", margin: "0 auto", padding: "0 5% 72px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "40px", alignItems: "start" }}>

          {/* LEFT: Live Interactive Preview Card */}
          <div style={{ position: "sticky", top: "90px" }}>
            <div
              style={{
                background: "#fbfaf7",
                border: "1px solid #e2ddd5",
                borderRadius: "4px",
                padding: "24px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
              }}
            >
              {/* Image Frame */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "1.02",
                  background: "#eee8de",
                  borderRadius: "2px",
                  overflow: "hidden",
                  border: "1px solid #dcd4c8",
                }}
              >
                <Image
                  src={currentModel.image}
                  alt={currentModel.name}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 50vw"
                  style={{ objectFit: "cover" }}
                />

                {/* Live Color Accent Badge */}
                <div
                  style={{
                    position: "absolute",
                    top: "14px",
                    left: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(255, 255, 255, 0.94)",
                    padding: "6px 12px",
                    borderRadius: "999px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                >
                  <span
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: selectedColor.hex,
                      border: `1px solid ${selectedColor.border}`,
                    }}
                  />
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#123d32", textTransform: "uppercase", letterSpacing: ".06em" }}>
                    {selectedColor.name}
                  </span>
                </div>

                {/* Monogram Stamp Visual Overlay */}
                {monogramEnabled && monogramText.trim() && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "20px",
                      right: "20px",
                      background: "rgba(25, 20, 18, 0.88)",
                      backdropFilter: "blur(4px)",
                      color: currentFoil.color,
                      border: `1px solid ${currentFoil.color}`,
                      padding: "8px 16px",
                      borderRadius: "3px",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "9px", letterSpacing: ".12em", textTransform: "uppercase", color: "#bbb" }}>
                      MONOGRAM STAMP ({monogramPlacement})
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--dioka-font)",
                        fontSize: "20px",
                        fontWeight: 700,
                        letterSpacing: "4px",
                        color: currentFoil.color,
                        textShadow: currentFoil.id === "gold-foil" ? "0 0 8px rgba(212, 175, 55, 0.6)" : "none",
                      }}
                    >
                      {monogramText.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Commission Summary Box */}
              <div style={{ marginTop: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#888" }}>
                      CUSTOM COMMISSION SPECIFICATION
                    </span>
                    <h3 style={{ fontFamily: "var(--dioka-font)", fontSize: "24px", margin: "2px 0 0", color: "#123d32" }}>
                      {currentModel.name}
                    </h3>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "11px", color: "#888", display: "block" }}>ESTIMATED TOTAL</span>
                    <strong style={{ fontSize: "24px", color: "#5b1f2b", fontFamily: "var(--dioka-sans)" }}>
                      {formatPrice(totalPrice)}
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px 16px",
                    marginTop: "16px",
                    padding: "14px",
                    background: "#fff",
                    border: "1px solid #e5dfd5",
                    borderRadius: "3px",
                    fontSize: "12px",
                  }}
                >
                  <div>
                    <span style={{ color: "#888", display: "block" }}>Leather:</span>
                    <strong style={{ color: "#123d32" }}>{currentLeather.name}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#888", display: "block" }}>Color Shade:</span>
                    <strong style={{ color: "#123d32" }}>{selectedColor.name}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#888", display: "block" }}>Hardware:</span>
                    <strong style={{ color: "#123d32" }}>{currentHardware.name}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#888", display: "block" }}>Interior Lining:</span>
                    <strong style={{ color: "#123d32" }}>{currentLining.name}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#888", display: "block" }}>Selected Size:</span>
                    <strong style={{ color: "#123d32" }}>{activeSize}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#888", display: "block" }}>Personalization:</span>
                    <strong style={{ color: "#123d32" }}>
                      {monogramEnabled && monogramText.trim() ? `${monogramText.toUpperCase()} (${currentFoil.name})` : "Standard Atelier Crest"}
                    </strong>
                  </div>
                </div>

                {/* Primary Add to Bag Button */}
                <button
                  type="button"
                  onClick={handleAddToBag}
                  disabled={isCommissioning}
                  className="dark-button"
                  style={{
                    width: "100%",
                    marginTop: "18px",
                    padding: "16px",
                    fontSize: "14px",
                    fontWeight: 700,
                    letterSpacing: ".08em",
                    justifyContent: "center",
                    gap: "10px",
                  }}
                >
                  <ShoppingBag size={18} />
                  {isCommissioning ? "Commissioning in Atelier..." : `Commission Piece · ${formatPrice(totalPrice)}`}
                </button>

                <p style={{ textAlign: "center", fontSize: "12px", color: "#777", margin: "10px 0 0" }}>
                  Handmade for you in Europe · Free express shipping & 30-day exchange guarantee
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Customization Controls & Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

            {/* STEP 1: Select Base Model */}
            <div style={{ borderBottom: "1px solid #e5dfd5", paddingBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "50%", background: "#123d32", color: "#fff", fontSize: "12px", fontWeight: 700 }}>
                  1
                </span>
                <h2 style={{ fontSize: "18px", margin: 0, color: "#123d32", fontWeight: 700 }}>
                  Select Silhouette ({categoryModels.length} available)
                </h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                {categoryModels.map((model) => {
                  const isSelected = model.id === currentModel.id;
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        setSelectedModelId(model.id);
                        setSelectedSize(model.availableSizes[0] || "");
                      }}
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        border: isSelected ? "2px solid #123d32" : "1px solid #d4cdc5",
                        background: isSelected ? "rgba(18, 61, 50, 0.04)" : "#fff",
                        borderRadius: "3px",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#123d32" }}>
                        {model.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#5b1f2b", fontWeight: 600, marginTop: "4px" }}>
                        Base {formatPrice(model.basePrice)}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: "13px", color: "#666", marginTop: "10px", lineHeight: "1.4" }}>
                {currentModel.description}
              </p>
            </div>

            {/* STEP 2: Leather Material Selection */}
            <div style={{ borderBottom: "1px solid #e5dfd5", paddingBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "50%", background: "#123d32", color: "#fff", fontSize: "12px", fontWeight: 700 }}>
                  2
                </span>
                <h2 style={{ fontSize: "18px", margin: 0, color: "#123d32", fontWeight: 700 }}>
                  Choose Leather Grade & Texture
                </h2>
              </div>

              <div style={{ display: "grid", gap: "10px" }}>
                {LEATHERS.map((leather) => {
                  const isSelected = leather.id === selectedLeatherId;
                  return (
                    <div
                      key={leather.id}
                      onClick={() => setSelectedLeatherId(leather.id)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "14px 16px",
                        border: isSelected ? "2px solid #123d32" : "1px solid #d4cdc5",
                        background: isSelected ? "rgba(18, 61, 50, 0.04)" : "#fff",
                        borderRadius: "3px",
                        cursor: "pointer",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <strong style={{ fontSize: "14px", color: "#123d32" }}>{leather.name}</strong>
                          <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", background: "#f1ede6", padding: "2px 6px", borderRadius: "2px", color: "#666" }}>
                            {leather.tag}
                          </span>
                        </div>
                        <p style={{ fontSize: "12px", color: "#666", margin: "4px 0 0" }}>
                          {leather.description}
                        </p>
                      </div>
                      <div style={{ textAlign: "right", whiteSpace: "nowrap", marginLeft: "12px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: leather.priceAddon > 0 ? "#5b1f2b" : "#166534" }}>
                          {leather.priceAddon === 0 ? "Included" : `+${formatPrice(leather.priceAddon)}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STEP 3: Color Finish */}
            <div style={{ borderBottom: "1px solid #e5dfd5", paddingBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "50%", background: "#123d32", color: "#fff", fontSize: "12px", fontWeight: 700 }}>
                  3
                </span>
                <h2 style={{ fontSize: "18px", margin: 0, color: "#123d32", fontWeight: 700 }}>
                  Select Dye & Color Tone ({selectedColor.name})
                </h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {COLOR_PALETTE.map((color) => {
                  const isSelected = color.name === selectedColor.name;
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 12px",
                        border: isSelected ? "2px solid #123d32" : "1px solid #d4cdc5",
                        background: isSelected ? "rgba(18, 61, 50, 0.05)" : "#fff",
                        borderRadius: "3px",
                        cursor: "pointer",
                      }}
                    >
                      <span
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          backgroundColor: color.hex,
                          border: `1px solid ${color.border}`,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#123d32", textAlign: "left" }}>
                        {color.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 4: Hardware & Solid Brass Finish */}
            <div style={{ borderBottom: "1px solid #e5dfd5", paddingBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "50%", background: "#123d32", color: "#fff", fontSize: "12px", fontWeight: 700 }}>
                  4
                </span>
                <h2 style={{ fontSize: "18px", margin: 0, color: "#123d32", fontWeight: 700 }}>
                  Hardware & Metal Accents
                </h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                {HARDWARE_OPTIONS.map((hw) => {
                  const isSelected = hw.id === selectedHardwareId;
                  return (
                    <button
                      key={hw.id}
                      type="button"
                      onClick={() => setSelectedHardwareId(hw.id)}
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        border: isSelected ? "2px solid #123d32" : "1px solid #d4cdc5",
                        background: isSelected ? "rgba(18, 61, 50, 0.04)" : "#fff",
                        borderRadius: "3px",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            backgroundColor: hw.color,
                            border: "1px solid rgba(0,0,0,0.2)",
                          }}
                        />
                        <strong style={{ fontSize: "13px", color: "#123d32" }}>{hw.name}</strong>
                      </div>
                      <span style={{ fontSize: "11px", color: "#666", display: "block", marginTop: "4px" }}>
                        {hw.note}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 5: Interior Lining Fabric */}
            <div style={{ borderBottom: "1px solid #e5dfd5", paddingBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "50%", background: "#123d32", color: "#fff", fontSize: "12px", fontWeight: 700 }}>
                  5
                </span>
                <h2 style={{ fontSize: "18px", margin: 0, color: "#123d32", fontWeight: 700 }}>
                  Interior Lining Fabric ({currentLining.name})
                </h2>
              </div>

              <div style={{ display: "grid", gap: "10px" }}>
                {LININGS.map((lining) => {
                  const isSelected = lining.id === selectedLiningId;
                  return (
                    <button
                      key={lining.id}
                      type="button"
                      onClick={() => setSelectedLiningId(lining.id)}
                      style={{
                        padding: "12px 14px",
                        textAlign: "left",
                        border: isSelected ? "2px solid #123d32" : "1px solid #d4cdc5",
                        background: isSelected ? "rgba(18, 61, 50, 0.04)" : "#fff",
                        borderRadius: "3px",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "13px", color: "#123d32", display: "block" }}>{lining.name}</strong>
                        <span style={{ fontSize: "12px", color: "#666" }}>{lining.note}</span>
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#166534" }}>Included</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 6: Monogramming & Initials */}
            <div style={{ borderBottom: "1px solid #e5dfd5", paddingBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "50%", background: "#123d32", color: "#fff", fontSize: "12px", fontWeight: 700 }}>
                    6
                  </span>
                  <h2 style={{ fontSize: "18px", margin: 0, color: "#123d32", fontWeight: 700 }}>
                    Personalized Initials & Stamping
                  </h2>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={monogramEnabled}
                    onChange={(e) => setMonogramEnabled(e.target.checked)}
                  />
                  Enable Monogram (+{formatPrice(25)})
                </label>
              </div>

              {monogramEnabled && (
                <div style={{ background: "#f8f6f1", padding: "16px", borderRadius: "3px", border: "1px solid #e0dad0" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "14px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px", color: "#123d32" }}>
                        Initials (1–4 Letters)
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={monogramText}
                        onChange={(e) => setMonogramText(e.target.value.toUpperCase())}
                        placeholder="e.g. DK"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          fontSize: "16px",
                          fontWeight: 700,
                          letterSpacing: "3px",
                          border: "1px solid #ccc",
                          borderRadius: "2px",
                          textTransform: "uppercase",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px", color: "#123d32" }}>
                        Placement
                      </label>
                      <select
                        value={monogramPlacement}
                        onChange={(e) => setMonogramPlacement(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          fontSize: "13px",
                          border: "1px solid #ccc",
                          borderRadius: "2px",
                          background: "#fff",
                        }}
                      >
                        <option value="Exterior Flap">Exterior Flap / Clasp</option>
                        <option value="Interior Atelier Badge">Interior Atelier Leather Badge</option>
                        <option value="Detachable Luggage Tag">Detachable Clochette Tag</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px", color: "#123d32" }}>
                      Foil Embossing Style
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                      {FOIL_STYLES.map((foil) => {
                        const isSelected = foil.id === monogramFoilId;
                        return (
                          <button
                            key={foil.id}
                            type="button"
                            onClick={() => setMonogramFoilId(foil.id)}
                            style={{
                              padding: "8px 10px",
                              fontSize: "12px",
                              fontWeight: 600,
                              borderRadius: "2px",
                              border: isSelected ? "2px solid #123d32" : "1px solid #d4cdc5",
                              background: isSelected ? "#123d32" : "#fff",
                              color: isSelected ? "#fff" : "#333",
                              cursor: "pointer",
                            }}
                          >
                            {foil.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 7: Size & Fit Selection */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "50%", background: "#123d32", color: "#fff", fontSize: "12px", fontWeight: 700 }}>
                  7
                </span>
                <h2 style={{ fontSize: "18px", margin: 0, color: "#123d32", fontWeight: 700 }}>
                  Size & Fitting
                </h2>
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                {currentModel.availableSizes.map((sz) => {
                  const isSelected = activeSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      style={{
                        padding: "8px 16px",
                        fontSize: "13px",
                        fontWeight: 600,
                        borderRadius: "2px",
                        border: isSelected ? "2px solid #123d32" : "1px solid #d4cdc5",
                        background: isSelected ? "#123d32" : "#fff",
                        color: isSelected ? "#fff" : "#333",
                        cursor: "pointer",
                      }}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px", color: "#123d32" }}>
                  Special Artisan Instructions / Fitting Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="e.g. Extended 5cm shoulder strap, wider instep fit, or specific gift packaging..."
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "13px",
                    border: "1px solid #d4cdc5",
                    borderRadius: "2px",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Atelier Craftsmanship Pillars */}
      <section style={{ background: "#f5f2eb", padding: "60px 5%", borderTop: "1px solid #e0dad0" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 40px" }}>
            <p className="eyebrow" style={{ color: "#5b1f2b" }}>THE DIOKA COMMISSION PROMISE</p>
            <h2 style={{ fontFamily: "var(--dioka-font)", fontSize: "36px", color: "#123d32", margin: "4px 0" }}>
              Heirloom Craftsmanship
            </h2>
            <p style={{ color: "#666", fontSize: "15px" }}>
              Every bespoke piece is crafted one at a time by veteran leather artisans in our European workshops.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
            <div style={{ background: "#fff", padding: "24px", border: "1px solid #e2ddd5" }}>
              <Sparkles size={24} color="#123d32" style={{ marginBottom: "12px" }} />
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#123d32", margin: "0 0 6px" }}>
                Hand-Selected Hides
              </h3>
              <p style={{ fontSize: "13px", color: "#666", margin: 0, lineHeight: "1.5" }}>
                We inspect every square decimeter of leather for tensile strength, grain consistency, and natural patina potential.
              </p>
            </div>

            <div style={{ background: "#fff", padding: "24px", border: "1px solid #e2ddd5" }}>
              <ShieldCheck size={24} color="#123d32" style={{ marginBottom: "12px" }} />
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#123d32", margin: "0 0 6px" }}>
                2-Year Atelier Guarantee
              </h3>
              <p style={{ fontSize: "13px", color: "#666", margin: 0, lineHeight: "1.5" }}>
                Stitching, zippers, brass hardware, and structural edges are covered under our full 2-year complimentary workshop warranty.
              </p>
            </div>

            <div style={{ background: "#fff", padding: "24px", border: "1px solid #e2ddd5" }}>
              <RotateCcw size={24} color="#123d32" style={{ marginBottom: "12px" }} />
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#123d32", margin: "0 0 6px" }}>
                Fit Perfection Guarantee
              </h3>
              <p style={{ fontSize: "13px", color: "#666", margin: 0, lineHeight: "1.5" }}>
                If your footwear or jacket requires an adjustment upon arrival, our atelier provides complimentary tailoring adjustments.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
