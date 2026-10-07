export type Category = "Bags" | "Footwear" | "Jackets";
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
};

export const products: Product[] = [
  {
    id: "arc-shoulder-bag",
    name: "Arc Shoulder Bag",
    category: "Bags",
    price: 285,
    image: "/dioka-brown-bag.webp",
    position: "center center",
    sizes: ["One size"],
    color: "Cognac",
    description: "A fluid shape that sits close and carries beautifully. The easy everyday piece with a sense of occasion.",
  },
  {
    id: "column-ankle-boot",
    name: "Column Ankle Boot",
    category: "Footwear",
    price: 340,
    image: "/dioka-footwear-editorial.png",
    position: "center center",
    sizes: ["EU 38", "EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45"],
    color: "Black",
    description: "A clean line, a grounded heel, and the kind of presence that never asks for attention.",
  },
  {
    id: "transit-leather-jacket",
    name: "Transit Leather Jacket",
    category: "Jackets",
    price: 560,
    image: "/dioka-jacket-editorial.png",
    position: "center center",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Black",
    description: "A leather layer with an easy attitude. Cut to move between seasons, settings, and styles.",
  },
];

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price);

