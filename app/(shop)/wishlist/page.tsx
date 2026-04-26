"use client";

import ProductCard from "@/components/customer/ProductCard";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { useWishlist } from "@/lib/WishlistContext";
import EmptyState from "@/components/shared/EmptyState";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

export default function CustomerWishlistPage() {
  const { items, removeItem } = useWishlist();
  const router = useRouter();

  return (
    <div className="mx-auto max-w-[1280px] px-1 sm:px-4 py-6">
      <h1
        className="text-xl md:text-2xl font-bold mb-1"
        style={{ color: t.textPrimary }}
      >
        My Wishlist
      </h1>
      <p className="text-sm md:text-base mb-6" style={{ color: t.textSecondary }}>
        {items.length} {items.length === 1 ? 'item' : 'items'} saved for later
      </p>

      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save items you like to view them later."
          actionLabel="Continue Shopping"
          onAction={() => router.push("/")}
          accentColor={t.bluePrimary}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          {items.map((product) => (
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
