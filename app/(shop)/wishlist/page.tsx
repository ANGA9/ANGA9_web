import ProductCard, { type Product } from "@/components/customer/ProductCard";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";

const savedProducts: Product[] = [
  {
    id: "w1",
    name: "Premium Mesh Office Chair",
    seller: "Rajesh Furniture",
    category: "Ergonomic",
    originalPrice: 18000,
    price: 12499,
    minOrder: "5 units",
    badge: "Top Rated",
  },
  {
    id: "w2",
    name: "Modular L-Shape Workstation",
    seller: "Sharma Interiors",
    category: "Furniture",
    originalPrice: 13500,
    price: 8990,
    minOrder: "2 units",
    badge: "New Arrival",
  },
  {
    id: "w3",
    name: "LED Panel Light 40W",
    seller: "Bright Solutions",
    category: "Lighting",
    originalPrice: 4800,
    price: 3299,
    minOrder: "10 units",
    badge: "Top Rated",
  },
  {
    id: "w4",
    name: "Executive Standing Desk",
    seller: "WorkSpace Co.",
    category: "Furniture",
    originalPrice: 28000,
    price: 21500,
    minOrder: "1 unit",
    badge: "New Arrival",
  },
];

export default function CustomerWishlistPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-8 py-6">
      <h1
        className="text-xl font-bold mb-1"
        style={{ color: t.textPrimary }}
      >
        Saved Items
      </h1>
      <p className="text-sm mb-6" style={{ color: t.textSecondary }}>
        {savedProducts.length} products saved for later
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showWishlistHeart
          />
        ))}
      </div>
    </div>
  );
}
