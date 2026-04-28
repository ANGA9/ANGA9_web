"use client";

import ProductCard from "@/components/customer/ProductCard";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { useWishlist } from "@/lib/WishlistContext";
import EmptyState from "@/components/shared/EmptyState";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Loader2, ShoppingCart, ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import toast from "react-hot-toast";
import { useState } from "react";

export default function CustomerWishlistPage() {
  const { items, loading, removeItem, clearWishlist } = useWishlist();
  const cart = useCart();
  const router = useRouter();
  const [movingAll, setMovingAll] = useState(false);

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
    if (movingAll) return;
    setMovingAll(true);
    try {
      for (const product of products) {
        await cart.addItem(product.id);
      }
      // After adding all to cart, clear the wishlist
      await clearWishlist();
      toast.success("All items moved to bag!");
    } catch (error) {
      toast.error("Some items couldn't be moved.");
    }
    setMovingAll(false);
  };

  return (
    <div className="w-full">
      {/* ══════════ MOBILE HEADER (<md) ══════════ */}
      <header className="flex md:hidden items-center px-4 h-14 bg-white border-b border-gray-100 sticky top-0 z-40">
        <Link href="/" className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </Link>
        <h1 className="text-[17px] font-medium text-gray-900 leading-tight">
          Wishlist
        </h1>
      </header>

      <div className="mx-auto max-w-[1400px] px-2 sm:px-4 py-6 md:py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 mt-2">
          <div>
            <div className="flex items-baseline gap-3">
              <h1
                className="hidden md:block text-[24px] md:text-[32px] font-medium tracking-tight mb-1"
                style={{ color: t.textPrimary }}
              >
                My Wishlist
              </h1>
              <span className="hidden md:block text-[18px] font-bold text-gray-400">
                ({products.length} {products.length === 1 ? "Item" : "Items"})
              </span>
            </div>
            <p className="text-[14px] md:text-[16px] font-medium" style={{ color: t.textSecondary }}>
              {products.length} {products.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>
          
          {products.length > 0 && (
            <button
              onClick={handleMoveAllToCart}
              disabled={movingAll}
              className="mt-4 md:mt-0 flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-[14px] font-semibold transition-all hover:bg-gray-50 border border-gray-200 active:scale-95 shadow-sm bg-white text-[#1A1A2E] disabled:opacity-60"
            >
              {movingAll ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 mt-4">
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
    </div>
  );
}
