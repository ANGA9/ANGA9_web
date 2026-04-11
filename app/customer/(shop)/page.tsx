import {
  Monitor,
  Sofa,
  ShoppingBag,
  HardHat,
  Armchair,
  Briefcase,
} from "lucide-react";
import HeroBanner from "@/components/customer/HeroBanner";
import ProductCard, { type Product } from "@/components/customer/ProductCard";

const categories = [
  { name: "Home Decor", icon: Sofa, color: "#14B8A6" },
  { name: "Electronics", icon: Monitor, color: "#6C47FF" },
  { name: "Retail", icon: ShoppingBag, color: "#F59E0B" },
  { name: "Industrial", icon: HardHat, color: "#EF4444" },
  { name: "Furniture", icon: Armchair, color: "#7C3AED" },
  { name: "Office Essentials", icon: Briefcase, color: "#0F6E56" },
];

const products: Product[] = [
  {
    id: "p1",
    name: "Ergonomic Mesh Office Chair — Lumbar Support, Adjustable Arms",
    seller: "Prestige Interiors",
    category: "Furniture",
    categoryColor: "#7C3AED",
    originalPrice: 12500,
    price: 8750,
    minOrder: 10,
    badge: "TOP RATED",
  },
  {
    id: "p2",
    name: "Modular Workstation Unit — 4-Seater with Cable Management",
    seller: "Office World India",
    category: "Furniture",
    categoryColor: "#7C3AED",
    originalPrice: 34000,
    price: 27200,
    minOrder: 2,
    badge: "NEW ARRIVAL",
  },
  {
    id: "p3",
    name: "Executive High-Back Chair — Premium Leather, 180° Recline",
    seller: "Prestige Interiors",
    category: "Furniture",
    categoryColor: "#7C3AED",
    originalPrice: 18000,
    price: 14400,
    minOrder: 5,
  },
  {
    id: "p4",
    name: "3-Tier Steel Storage Rack — Heavy Duty, 500kg Capacity",
    seller: "Metro Industrial",
    category: "Industrial",
    categoryColor: "#EF4444",
    originalPrice: 8500,
    price: 6800,
    minOrder: 4,
    badge: "TOP RATED",
  },
  {
    id: "p5",
    name: "LED Panel Light 60x60cm — 40W, Daylight, Box of 20",
    seller: "Sharma Electricals",
    category: "Electronics",
    categoryColor: "#6C47FF",
    originalPrice: 15000,
    price: 11250,
    minOrder: 20,
  },
  {
    id: "p6",
    name: "Indoor Ceramic Planter Set — 6 Piece, Matte Finish, Assorted",
    seller: "Green Decor Co",
    category: "Home Decor",
    categoryColor: "#14B8A6",
    originalPrice: 4200,
    price: 3150,
    minOrder: 12,
    badge: "NEW ARRIVAL",
  },
];

export default function CustomerHomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-8">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Shop by Category */}
      <section>
        <h2 className="text-lg font-semibold text-anga-text mb-4">
          Shop by Category
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className="flex flex-col items-center gap-2 rounded-xl border border-anga-border bg-white p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${cat.color}15` }}
              >
                <cat.icon className="h-6 w-6" style={{ color: cat.color }} />
              </div>
              <span className="text-xs font-medium text-anga-text text-center leading-tight">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Discover Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-anga-text">
            Discover Products for You
          </h2>
          <button className="text-sm font-medium text-[#6C47FF] hover:underline">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
