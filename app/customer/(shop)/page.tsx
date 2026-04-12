import {
  Home,
  Cpu,
  ShoppingBag,
  Factory,
  Armchair,
  Briefcase,
} from "lucide-react";
import HeroBanner from "@/components/customer/HeroBanner";
import ProductCard, { type Product } from "@/components/customer/ProductCard";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";

const categories = [
  { name: "Home Decor", icon: Home },
  { name: "Electronics", icon: Cpu },
  { name: "Retail", icon: ShoppingBag },
  { name: "Industrial", icon: Factory },
  { name: "Furniture", icon: Armchair },
  { name: "Office Essentials", icon: Briefcase },
];

const products: Product[] = [
  {
    id: "p1",
    name: "Premium Mesh Office Chair",
    seller: "Rajesh Furniture",
    category: "Ergonomic",
    originalPrice: 18000,
    price: 12499,
    minOrder: "5 units",
    badge: "Top Rated",
  },
  {
    id: "p2",
    name: "Modular L-Shape Workstation",
    seller: "Sharma Interiors",
    category: "Furniture",
    originalPrice: 13500,
    price: 8990,
    minOrder: "2 units",
    badge: "New Arrival",
  },
  {
    id: "p3",
    name: "LED Panel Light 40W",
    seller: "Bright Solutions",
    category: "Lighting",
    originalPrice: 4800,
    price: 3299,
    minOrder: "10 units",
    badge: "Top Rated",
  },
  {
    id: "p4",
    name: "Executive Standing Desk",
    seller: "WorkSpace Co.",
    category: "Furniture",
    originalPrice: 28000,
    price: 21500,
    minOrder: "1 unit",
    badge: "New Arrival",
  },
  {
    id: "p5",
    name: "Wireless Keyboard + Mouse Combo",
    seller: "TechNest India",
    category: "Electronics",
    originalPrice: 3500,
    price: 2199,
    minOrder: "5 units",
    badge: "Top Rated",
  },
  {
    id: "p6",
    name: "4-Drawer Steel Filing Cabinet",
    seller: "OfficePro Depot",
    category: "Storage",
    originalPrice: 10200,
    price: 7800,
    minOrder: "2 units",
    badge: "Top Rated",
  },
];

export default function CustomerHomePage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-8 py-6 space-y-8">
      {/* Hero */}
      <HeroBanner />

      {/* Shop by Category */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg font-semibold"
            style={{ color: t.textPrimary }}
          >
            Shop by category
          </h2>
          <button
            className="text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: t.bluePrimary }}
          >
            View All
          </button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className="flex flex-col items-center gap-2.5 rounded-[14px] border p-5 transition-all hover:scale-[1.02] hover:border-[#1A6FD4]"
              style={{ background: t.bgCard, borderColor: t.border }}
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full"
                style={{ background: t.bgBlueTint }}
              >
                <cat.icon
                  className="h-4 w-4"
                  style={{ color: t.bluePrimary }}
                />
              </div>
              <span
                className="text-[13px] font-medium text-center leading-tight"
                style={{ color: t.textPrimary }}
              >
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Discover Products */}
      <section>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: t.textPrimary }}
        >
          Discover products for you
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
