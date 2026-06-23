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
import { EmptyWishlistIllustration } from "@/components/shared/EmptyWishlistIllustration";

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
    seller_id: item.seller_id,
    category: "",
    originalPrice: item.base_price,
    price: item.sale_price ?? item.base_price,
    minOrder: `${item.min_order_qty || 1} ${item.unit || 'pc'}${(item.min_order_qty || 1) > 1 ? "s" : ""}`,
    imageUrl: item.images?.[0] || undefined,
  }));

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white animate-pulse">
        {/* ══════════ MOBILE HEADER SKELETON ══════════ */}
        <header className="flex md:hidden items-center px-4 h-14 bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="w-6 h-6 rounded-full bg-gray-200 mr-3" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </header>

        <div className="mx-auto max-w-[1400px] px-2 sm:px-4 py-4 md:py-10 pb-24 md:pb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-5 md:mb-8 mt-1 md:mt-2">
            <div>
              <div className="flex items-baseline gap-3">
                <div className="hidden md:block h-8 w-40 bg-gray-200 rounded mb-1" />
                <div className="hidden md:block h-6 w-20 bg-gray-200 rounded" />
              </div>
              <div className="h-4 w-32 bg-gray-200 rounded mt-2 md:mt-0" />
            </div>
            <div className="mt-3 md:mt-0 h-10 w-36 bg-gray-200 rounded-full md:rounded-xl" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-5 mt-2 md:mt-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl md:rounded-2xl border border-gray-100 overflow-hidden shadow-sm h-[280px] md:h-[340px] flex flex-col">
                <div className="h-[60%] bg-gray-200 w-full" />
                <div className="p-3 md:p-4 space-y-2 md:space-y-3 flex-1 flex flex-col justify-end pb-4">
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded" />
                  <div className="h-5 w-1/3 bg-gray-200 rounded mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
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
        <h1 className="text-[17px] font-medium text-gray-900 leading-tight flex-1">
          Wishlist
        </h1>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 md:px-12 py-4 md:py-10 pb-24 md:pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-5 md:mb-8 mt-1 md:mt-2 md:ml-[26px]">
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
            <p className="text-[13px] md:text-[15px]" style={{ color: t.textSecondary }}>
              {products.length} {products.length === 1 ? "item" : "items"} saved for later
            </p>
          </div>

          {products.length > 0 && (
            <button
              onClick={handleMoveAllToCart}
              disabled={movingAll}
              className="mt-3 md:mt-0 flex items-center justify-center gap-2 rounded-full md:rounded-xl px-5 py-2 md:px-6 md:py-3 text-[13px] md:text-[14px] font-semibold transition-all hover:bg-gray-50 border border-gray-200 active:scale-95 shadow-sm bg-white text-[#1A1A2E] disabled:opacity-60 w-fit"
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
            illustration={<EmptyWishlistIllustration />}
            title="Your wishlist is empty"
            description="Save items you love to view them later."
            actionLabel="Continue Shopping"
            onAction={() => router.push("/")}
            accentColor={t.primaryCta}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-5 mt-2 md:mt-4">
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

