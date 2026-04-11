"use client";

import { ShoppingCart, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Product {
  id: string;
  name: string;
  seller: string;
  category: string;
  categoryColor: string;
  originalPrice: number;
  price: number;
  minOrder: number;
  badge?: "TOP RATED" | "NEW ARRIVAL";
  inWishlist?: boolean;
}

const categoryBg: Record<string, string> = {
  Furniture: "#F5F0EB",
  Electronics: "#F0F4F8",
  "Home Decor": "#FDF3E7",
  Industrial: "#EAF3EE",
  Retail: "#F2EFE9",
  "Office Essentials": "#F2EFE9",
};

function formatINR(value: number) {
  return "\u20B9" + value.toLocaleString("en-IN");
}

interface ProductCardProps {
  product: Product;
  showWishlistRemove?: boolean;
}

export default function ProductCard({
  product,
  showWishlistRemove,
}: ProductCardProps) {
  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const bgColor = categoryBg[product.category] ?? "#F2EFE9";

  return (
    <div className="group rounded-xl border border-[#E5E0D8] bg-white overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5">
      {/* Image placeholder */}
      <div
        className="relative h-48 flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <span className="text-4xl font-bold text-[#C8C1B5] opacity-40">
          {product.category.charAt(0)}
        </span>

        {/* Badge */}
        {product.badge && (
          <span
            className={cn(
              "absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
              product.badge === "TOP RATED"
                ? "bg-[#F2EFE9] text-[#44403C]"
                : "bg-[#FDF3E7] text-[#7C4F1A]"
            )}
          >
            {product.badge}
          </span>
        )}

        {/* Discount */}
        {discount > 0 && (
          <span className="absolute top-3 right-3 rounded-full bg-[#C4873A] px-2 py-0.5 text-[10px] font-bold text-white">
            -{discount}%
          </span>
        )}

        {/* Wishlist heart */}
        <button
          className={cn(
            "absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-colors",
            showWishlistRemove
              ? "text-[#C4873A] hover:bg-[#FDF3E7]"
              : "text-[#A8A09A] hover:text-[#C4873A]"
          )}
        >
          <Heart
            className="h-4 w-4"
            fill={showWishlistRemove ? "currentColor" : "none"}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-[11px] font-medium text-[#A8A09A] mb-1">
          {product.seller}
        </p>
        <h3 className="text-sm font-medium text-[#1C1917] leading-snug mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-lg font-medium text-[#1C1917]">
            {formatINR(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-[#A8A09A] line-through">
              {formatINR(product.originalPrice)}
            </span>
          )}
        </div>

        <p className="text-[11px] text-[#A8A09A] mb-3">
          Min order: {product.minOrder} units
        </p>

        {/* Add to Cart */}
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C4873A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#B37530] active:translate-y-px">
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
