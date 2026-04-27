"use client";

import ProductCard from "@/components/customer/ProductCard";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { useWishlist } from "@/lib/WishlistContext";
import EmptyState from "@/components/shared/EmptyState";
import { useRouter } from "next/navigation";
import { Heart, Loader2, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import toast from "react-hot-toast";

export default function CustomerWishlistPage() {
  const { items, loading, removeItem } = useWishlist();
  const cart = useCart();
  const router = useRouter();

  // Transform backend WishlistItem into ProductCard's Product shape
  const products = items.map((item) => ({
    id: item.productId,
    name: item.name,
    seller: item.seller_name,
    category: "",
    originalPrice: item.base_price,
    price: item.sale_price ?? item.base_price,
    minOrder: "1 pc",
    imageUrl: item.images?.[0] || undefined,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#4338CA]" />
      </div>
    );
  }

  const handleMoveAllToCart = async () => {
    // Basic implementation: Add all items to cart (CartContext handles individual api calls or we can assume there's a batch add if available)
    try {
      for (const product of products) {
        await cart.addItem(product.id);
      }
      toast.success("All items added to bag!");
    } catch (error) {
      toast.error("Some items couldn't be added.");
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-2 sm:px-4 py-6 md:py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 mt-2">
        <div>
          <h1
            className="text-[24px] md:text-[32px] font-black tracking-tight mb-1"
            style={{ color: t.textPrimary }}
          >
            My Wishlist
          </h1>
          <p className="text-[14px] md:text-[16px] font-medium" style={{ color: t.textSecondary }}>
            {products.length} {products.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
        
        {products.length > 0 && (
          <button
            onClick={handleMoveAllToCart}
            className="mt-4 md:mt-0 flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-[14px] font-bold transition-all hover:bg-gray-50 border border-gray-200 active:scale-95 shadow-sm bg-white text-[#1A1A2E]"
          >
            <ShoppingCart className="w-4 h-4" />
            Move All to Bag
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save items you like to view them later."
          actionLabel="Continue Shopping"
          onAction={() => router.push("/")}
          accentColor={t.bluePrimary}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 mt-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlistContext={true}
              onRemoveWishlist={() => removeItem(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
