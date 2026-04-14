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
    <div className="py-6">
      {/* Hero */}
      <HeroBanner />

      {/* Shop by Category */}
      <section style={{ marginTop: 40 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <h2
            className="font-bold"
            style={{ color: "#1A1A2E", fontSize: 20 }}
          >
            Shop by category
          </h2>
          <button
            className="font-medium transition-opacity hover:opacity-80"
            style={{ color: "#1A6FD4", fontSize: 13 }}
          >
            View All
          </button>
        </div>
        <div
          className="grid grid-cols-3 sm:grid-cols-6"
          style={{ gap: 12 }}
        >
          {categories.map((cat) => (
            <button
              key={cat.name}
              className="flex flex-col items-center border cursor-pointer transition-all duration-150 hover:border-[#1A6FD4] hover:scale-[1.03]"
              style={{
                background: "#FFFFFF",
                borderColor: "#E8EEF4",
                borderRadius: 16,
                padding: "20px 12px",
                textAlign: "center",
              }}
            >
              <div
                className="flex items-center justify-center rounded-full transition-colors duration-150"
                style={{
                  width: 52,
                  height: 52,
                  background: "#EAF2FF",
                  marginBottom: 10,
                }}
              >
                <cat.icon
                  style={{ width: 22, height: 22, color: "#1A6FD4" }}
                />
              </div>
              <span
                className="font-medium text-center leading-tight"
                style={{ color: "#1A1A2E", fontSize: 13 }}
              >
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Discover Products */}
      <section style={{ marginTop: 48 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <h2
            className="font-bold"
            style={{ color: "#1A1A2E", fontSize: 20 }}
          >
            Discover products for you
          </h2>
          <button
            className="font-medium transition-opacity hover:opacity-80"
            style={{ color: "#1A6FD4", fontSize: 13 }}
          >
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
