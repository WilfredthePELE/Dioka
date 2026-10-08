export type Category = "Bags" | "Footwear" | "Jackets";
export type Filter = "All" | Category;

export type Product = {
  id: string;
  name: string;
  category: Category;
  price: number;
  image: string;
  position: string;
  sizes: string[];
  color: string;
  description: string;
  subtitle?: string;
  materials?: string;
  dimensions?: string;
  care?: string;
  details?: string[];
  inStock?: boolean;
  stockQuantity?: number;
  rating?: number;
  reviews?: number;
};

export const products: Product[] = [
  // --- BAGS ---
  {
    id: "arc-shoulder-bag",
    name: "Arc Leather Shoulder Bag",
    category: "Bags",
    price: 285,
    image: "/dioka-brown-bag.webp",
    position: "center center",
    sizes: ["One size"],
    color: "Cognac Brown",
    description: "A sleek, curved shoulder bag designed to carry your daily essentials in effortless style. Handcrafted from genuine full-grain European calfskin with smooth brass hardware.",
    subtitle: "Everyday curved leather shoulder bag",
    materials: "100% full-grain calfskin leather, brushed solid brass hardware, bonded soft suede lining.",
    dimensions: "32cm W × 24cm H × 9cm D · Strap drop: 28cm",
    care: "Wipe with a clean, soft cloth. Treat with natural leather cream twice a year to keep it supple.",
    details: [
      "Curved ergonomic shape that rests comfortably on your shoulder",
      "Magnetic snap closure for quick and secure access",
      "Interior zip pocket and key clip to keep essentials organized",
      "Hand-finished leather edges built for daily durability"
    ],
    inStock: true,
    rating: 4.9,
    reviews: 38,
  },
  {
    id: "saddle-courier-bag",
    name: "Classic Saddle Crossbody Bag",
    category: "Bags",
    price: 360,
    image: "/dioka_saddle_bag_1791376838607.jpg",
    position: "center center",
    sizes: ["One size"],
    color: "Classic Black",
    description: "A structured, everyday crossbody with a curved saddle flap and signature brass lock. Spacious enough for your phone, wallet, keys, and daily essentials from morning to night.",
    subtitle: "Structured leather crossbody bag",
    materials: "Smooth Italian box calfskin, polished palladium-finish brass hardware, soft microfiber interior.",
    dimensions: "26cm W × 19cm H × 7.5cm D · Adjustable crossbody strap: 45–56cm",
    care: "Protect from heavy rain. Gently buff with a dry microfiber cloth.",
    details: [
      "Structured silhouette that holds its shape",
      "Adjustable crossbody leather strap for a customized fit",
      "Front turn-lock clasp with easy one-handed release",
      "Two interior compartments with dedicated phone sleeve"
    ],
    inStock: true,
    rating: 5.0,
    reviews: 24,
  },
  {
    id: "atelier-weekender",
    name: "Voyager Leather Travel Duffle",
    category: "Bags",
    price: 640,
    image: "/dioka_weekender_bag_1791376853630.jpg",
    position: "center center",
    sizes: ["One size"],
    color: "Espresso Brown",
    description: "Your ultimate weekend travel companion. Made from heavy-duty pebble-grain leather with smooth two-way zippers, rolled carry handles, and a detachable padded shoulder strap.",
    subtitle: "Spacious carry-on travel duffle bag",
    materials: "Heavy pebble-grain Tuscan leather, heavy-duty brass zippers, durable herringbone cotton lining.",
    dimensions: "52cm W × 31cm H × 23cm D · Capacity: 37L (Airline carry-on approved)",
    care: "Store in breathable dust bag when not in use. Treat with leather conditioner before long trips.",
    details: [
      "Airline carry-on approved size (fits in all overhead bins)",
      "Dedicated padded 16-inch laptop compartment inside",
      "Detachable padded leather shoulder strap and luggage tag",
      "Reinforced bottom panel with protective metal feet"
    ],
    inStock: true,
    rating: 4.9,
    reviews: 41,
  },

  // --- FOOTWEAR ---
  {
    id: "column-ankle-boot",
    name: "Chelsea Heeled Ankle Boot",
    category: "Footwear",
    price: 340,
    image: "/dioka-footwear-editorial.png",
    position: "center center",
    sizes: ["EU 38", "EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45"],
    color: "Black",
    description: "Timeless Chelsea ankle boots featuring clean lines, a comfortable 45mm stacked leather heel, and a smooth inner side zipper. Cushioned arch support for all-day comfort.",
    subtitle: "Everyday stacked-heel leather ankle boots",
    materials: "Full-grain calfskin leather upper, breathable leather lining, resoleable Goodyear-welted leather and rubber sole.",
    dimensions: "Heel height: 45mm · Shaft height: 16cm",
    care: "Use cedar shoe trees between wears. Condition and buff with neutral leather balm.",
    details: [
      "Cushioned memory-foam insole with built-in arch support",
      "Smooth side zipper with leather pull tab for easy on and off",
      "Durable Goodyear-welted construction designed to be resoled",
      "Snug, flattering fit around the ankle"
    ],
    inStock: true,
    rating: 4.8,
    reviews: 56,
  },
  {
    id: "square-toe-chelsea",
    name: "Heritage Pull-On Chelsea Boot",
    category: "Footwear",
    price: 380,
    image: "/dioka_chelsea_boots_1791376865127.jpg",
    position: "center center",
    sizes: ["EU 38", "EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45"],
    color: "Raw Umber Brown",
    description: "Classic pull-on Chelsea boots crafted in rich oiled leather that patinas beautifully with wear. Fitted with heavy-duty elastic side panels and all-weather rubber traction soles.",
    subtitle: "Pull-on oiled leather Chelsea boots",
    materials: "Oiled pull-up calf leather, vegetable-tanned leather insole, stacked heel with Vibram rubber half-sole.",
    dimensions: "Heel height: 38mm · Shaft height: 15cm",
    care: "Brush off dirt with horsehair brush. Apply leather oil periodically to maintain water resistance.",
    details: [
      "Heavyweight stretch-knit elastic panels for easy slip-on comfort",
      "Sturdy front and rear pull tabs",
      "Water-resistant storm-welted perimeter",
      "Natural amber leather edge finish"
    ],
    inStock: true,
    rating: 4.9,
    reviews: 33,
  },
  {
    id: "lug-atelier-derby",
    name: "Lug-Sole Leather Derby Shoes",
    category: "Footwear",
    price: 320,
    image: "/dioka_derby_shoes_1791376877192.jpg",
    position: "center center",
    sizes: ["EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45"],
    color: "Polished Black",
    description: "Modern 4-eyelet lace-up derbies mounted on an ultralight lug sole. The perfect balance between formal polish and streetwear ease, pairing effortlessly with denim or tailored trousers.",
    subtitle: "Ultralight lug-sole lace-up derby shoes",
    materials: "Polished full-grain calfskin leather, soft calf lining, lightweight Extralight lug sole.",
    dimensions: "Sole thickness: 30mm heel, 18mm forefoot",
    care: "Wipe with damp cloth and dry naturally. Buff with soft cotton flannel cloth.",
    details: [
      "Clean blind eyelets for a sharp dress profile",
      "Shock-absorbing cork footbed that molds to your feet",
      "Includes two pairs of round waxed cotton laces",
      "All-weather lug sole with featherweight comfort"
    ],
    inStock: true,
    rating: 4.9,
    reviews: 29,
  },

  // --- JACKETS ---
  {
    id: "transit-leather-jacket",
    name: "Classic Lambskin Leather Jacket",
    category: "Jackets",
    price: 560,
    image: "/dioka-jacket-editorial.png",
    position: "center center",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Black",
    description: "An easy-going leather jacket with a relaxed tailored fit, sharp point collar, and discreet side welt pockets. Crafted from buttery-soft drum-dyed lambskin that needs zero break-in.",
    subtitle: "Tailored lambskin leather jacket",
    materials: "100% drum-dyed lambskin leather, silky cupro-cotton satin lining, matte black hardware.",
    dimensions: "Center back length: 65cm (Size M) · True to size tailored fit",
    care: "Professional leather clean only. Hang on a wide wooden hanger.",
    details: [
      "Ultra-soft 0.9mm lambskin leather that feels broken-in from day one",
      "Two deep interior chest pockets with secure button closure",
      "Pleated shoulder back for full range of motion",
      "Smooth two-way heavy-duty front zipper"
    ],
    inStock: true,
    rating: 4.9,
    reviews: 64,
  },
  {
    id: "belted-leather-trench",
    name: "Belted Leather Trench Coat",
    category: "Jackets",
    price: 780,
    image: "/dioka_trench_coat_1791376905616.jpg",
    position: "center center",
    sizes: ["XS", "S", "M", "L", "XL"],
    color: "Cognac Brown",
    description: "A statement mid-length leather trench coat featuring a removable tie belt, classic storm flap, and deep side pockets. Tailored from supple European calfskin with a fluid, flattering drape.",
    subtitle: "Mid-length belted calfskin trench coat",
    materials: "Supple calf nappa leather, full cupro lining, genuine horn buttons.",
    dimensions: "Center back length: 114cm (Size M) · Relaxed overcoat fit",
    care: "Store in a breathable garment bag. Condition seasonally.",
    details: [
      "Removable self-tie leather belt with belt loops",
      "Raglan shoulder cut for easy layering over sweaters",
      "Deep back walking vent with hidden button tab",
      "Water-repellent protective leather treatment"
    ],
    inStock: true,
    rating: 5.0,
    reviews: 18,
  },
  {
    id: "shearling-flight-bomber",
    name: "Shearling Aviator Bomber Jacket",
    category: "Jackets",
    price: 890,
    image: "/dioka_shearling_jacket_1791376893868.jpg",
    position: "center center",
    sizes: ["S", "M", "L", "XL", "XXL"],
    color: "Distressed Espresso",
    description: "Maximum cold-weather insulation meets iconic aviator heritage. Crafted from genuine double-faced Spanish Merino shearling with plush curly wool interior and twin collar buckle straps.",
    subtitle: "Heavyweight Merino shearling bomber jacket",
    materials: "100% Spanish Merino shearling leather with natural plush wool interior.",
    dimensions: "Center back length: 68cm (Size M) · Relaxed aviator fit",
    care: "Specialist shearling dry cleaner only. Brush wool with soft suede brush.",
    details: [
      "Plush curly Merino wool collar and cuffs for cold-weather warmth",
      "Dual collar throat latch straps with solid brass roller buckles",
      "Adjustable side waist buckles for a tailored fit",
      "Heavyweight antiqued brass front zipper"
    ],
    inStock: true,
    rating: 4.9,
    reviews: 27,
  },
];

export type Currency = "USD" | "EUR" | "GBP" | "NGN";

export interface CurrencyMeta {
  rate: number;
  symbol: string;
  code: string;
  name: string;
  flag: string;
}

export const CURRENCY_CONFIG: Record<Currency, CurrencyMeta> = {
  USD: { rate: 1, symbol: "$", code: "USD", name: "US Dollar", flag: "🇺🇸" },
  EUR: { rate: 0.92, symbol: "€", code: "EUR", name: "Euro", flag: "🇪🇺" },
  GBP: { rate: 0.79, symbol: "£", code: "GBP", name: "British Pound", flag: "🇬🇧" },
  NGN: { rate: 1485, symbol: "₦", code: "NGN", name: "Nigerian Naira", flag: "🇳🇬" },
};

export const formatPrice = (
  priceInUSD: number,
  currency: Currency = "USD",
  liveRates?: Partial<Record<Currency, number>>
) => {
  const meta = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;
  const rate = liveRates?.[currency] ?? meta.rate;
  const converted = Math.round(priceInUSD * rate);

  if (currency === "NGN") {
    return `₦${new Intl.NumberFormat("en-NG", {
      maximumFractionDigits: 0,
    }).format(converted)}`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: meta.code,
    maximumFractionDigits: 0,
  }).format(converted);
};

export const convertPrice = (
  amountInUSD: number,
  targetCurrency: Currency,
  liveRates?: Partial<Record<Currency, number>>
): number => {
  const rate = liveRates?.[targetCurrency] ?? CURRENCY_CONFIG[targetCurrency]?.rate ?? 1;
  return Math.round(amountInUSD * rate);
};
