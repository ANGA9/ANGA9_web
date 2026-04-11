import ProductCard, { type Product } from "@/components/customer/ProductCard";
import { Heart } from "lucide-react";

const savedProducts: Product[] = [
  {
    id: "w1",
    name: "Ergonomic Mesh Office Chair — Lumbar Support, Adjustable Arms",
    seller: "Prestige Interiors",
    category: "Furniture",
    categoryColor: "#7C3AED",
    originalPrice: 12500,
    price: 8750,
    minOrder: 10,
    badge: "TOP RATED",
    inWishlist: true,
  },
  {
    id: "w2",
    name: "3-Tier Steel Storage Rack — Heavy Duty, 500kg Capacity",
    seller: "Metro Industrial",
    category: "Industrial",
    categoryColor: "#EF4444",
    originalPrice: 8500,
    price: 6800,
    minOrder: 4,
    inWishlist: true,
  },
  {
    id: "w3",
    name: "LED Panel Light 60x60cm — 40W, Daylight, Box of 20",
    seller: "Sharma Electricals",
    category: "Electronics",
    categoryColor: "#6C47FF",
    originalPrice: 15000,
    price: 11250,
    minOrder: 20,
    inWishlist: true,
  },
  {
    id: "w4",
    name: "Indoor Ceramic Planter Set — 6 Piece, Matte Finish, Assorted",
    seller: "Green Decor Co",
    category: "Home Decor",
    categoryColor: "#14B8A6",
    originalPrice: 4200,
    price: 3150,
    minOrder: 12,
    badge: "NEW ARRIVAL",
    inWishlist: true,
  },
];

export default function CustomerWishlistPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <div className="flex items-center gap-2 mb-1">
        <Heart className="h-5 w-5 text-[#EF4444]" fill="#EF4444" />
        <h1 className="text-xl font-bold text-anga-text">Saved Items</h1>
      </div>
      <p className="text-sm text-anga-text-secondary mb-6">
        {savedProducts.length} products saved for later
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {savedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showWishlistRemove
          />
        ))}
      </div>
    </div>
  );
}
