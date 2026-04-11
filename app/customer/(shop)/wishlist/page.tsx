import ProductCard, { type Product } from "@/components/customer/ProductCard";
import { Heart } from "lucide-react";

const savedProducts: Product[] = [
  {
    id: "w1",
    name: "Ergonomic Mesh Office Chair \u2014 Lumbar Support, Adjustable Arms",
    seller: "Prestige Interiors",
    category: "Furniture",
    categoryColor: "#78716C",
    originalPrice: 12500,
    price: 8750,
    minOrder: 10,
    badge: "TOP RATED",
    inWishlist: true,
  },
  {
    id: "w2",
    name: "3-Tier Steel Storage Rack \u2014 Heavy Duty, 500kg Capacity",
    seller: "Metro Industrial",
    category: "Industrial",
    categoryColor: "#78716C",
    originalPrice: 8500,
    price: 6800,
    minOrder: 4,
    inWishlist: true,
  },
  {
    id: "w3",
    name: "LED Panel Light 60x60cm \u2014 40W, Daylight, Box of 20",
    seller: "Sharma Electricals",
    category: "Electronics",
    categoryColor: "#78716C",
    originalPrice: 15000,
    price: 11250,
    minOrder: 20,
    inWishlist: true,
  },
  {
    id: "w4",
    name: "Indoor Ceramic Planter Set \u2014 6 Piece, Matte Finish, Assorted",
    seller: "Green Decor Co",
    category: "Home Decor",
    categoryColor: "#78716C",
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
        <Heart className="h-5 w-5 text-[#C4873A]" fill="#C4873A" />
        <h1 className="text-xl font-bold text-[#1C1917]">Saved Items</h1>
      </div>
      <p className="text-sm text-[#78716C] mb-6">
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
