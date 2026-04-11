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
  { name: "Home Decor", icon: Sofa, color: "#78716C" },
  { name: "Electronics", icon: Monitor, color: "#78716C" },
  { name: "Retail", icon: ShoppingBag, color: "#78716C" },
  { name: "Industrial", icon: HardHat, color: "#78716C" },
  { name: "Furniture", icon: Armchair, color: "#78716C" },
  { name: "Office Essentials", icon: Briefcase, color: "#78716C" },
];

const products: Product[] = [
  {
    id: "p1",
    name: "Ergonomic Mesh Office Chair \u2014 Lumbar Support, Adjustable Arms",
    seller: "Prestige Interiors",
    category: "Furniture",
    categoryColor: "#78716C",
    originalPrice: 12500,
    price: 8750,
    minOrder: 10,
    badge: "TOP RATED",
  },
  {
    id: "p2",
    name: "Modular Workstation Unit \u2014 4-Seater with Cable Management",
    seller: "Office World India",
    category: "Furniture",
    categoryColor: "#78716C",
    originalPrice: 34000,
    price: 27200,
    minOrder: 2,
    badge: "NEW ARRIVAL",
  },
  {
    id: "p3",
    name: "Executive High-Back Chair \u2014 Premium Leather, 180\u00B0 Recline",
    seller: "Prestige Interiors",
    category: "Furniture",
    categoryColor: "#78716C",
    originalPrice: 18000,
    price: 14400,
    minOrder: 5,
  },
  {
    id: "p4",
    name: "3-Tier Steel Storage Rack \u2014 Heavy Duty, 500kg Capacity",
    seller: "Metro Industrial",
    category: "Industrial",
    categoryColor: "#78716C",
    originalPrice: 8500,
    price: 6800,
    minOrder: 4,
    badge: "TOP RATED",
  },
  {
    id: "p5",
    name: "LED Panel Light 60x60cm \u2014 40W, Daylight, Box of 20",
    seller: "Sharma Electricals",
    category: "Electronics",
    categoryColor: "#44403C",
    originalPrice: 15000,
    price: 11250,
    minOrder: 20,
  },
  {
    id: "p6",
    name: "Indoor Ceramic Planter Set \u2014 6 Piece, Matte Finish, Assorted",
    seller: "Green Decor Co",
    category: "Home Decor",
    categoryColor: "#78716C",
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
        <h2 className="text-lg font-semibold text-[#1C1917] mb-4">
          Shop by Category
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className="flex flex-col items-center gap-2 rounded-xl border border-[#E5E0D8] bg-white p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F2EFE9]">
                <cat.icon className="h-6 w-6 text-[#44403C]" />
              </div>
              <span className="text-xs font-medium text-[#1C1917] text-center leading-tight">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Discover Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1C1917]">
            Discover Products for You
          </h2>
          <button className="text-sm font-medium text-[#44403C] hover:underline">
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
