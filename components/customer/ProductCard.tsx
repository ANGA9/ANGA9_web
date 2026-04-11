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

  return (
    <div className="group rounded-xl border border-anga-border bg-white overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5">
      {/* Image placeholder */}
      <div
        className="relative h-48 flex items-center justify-center"
        style={{ backgroundColor: `${product.categoryColor}12` }}
      >
        <span
          className="text-4xl font-bold opacity-20"
          style={{ color: product.categoryColor }}
        >
          {product.category.charAt(0)}
        </span>

        {/* Badge */}
        {product.badge && (
          <span
            className={cn(
              "absolute top-3 left-3 rounded-md px-2 py-0.5 text-[10px] font-bold text-white",
              product.badge === "TOP RATED"
                ? "bg-[#6C47FF]"
                : "bg-[#22C55E]"
            )}
          >
            {product.badge}
          </span>
        )}

        {/* Discount */}
        {discount > 0 && (
          <span className="absolute top-3 right-3 rounded-md bg-[#EF4444] px-2 py-0.5 text-[10px] font-bold text-white">
            -{discount}%
          </span>
        )}

        {/* Wishlist heart */}
        <button
          className={cn(
            "absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-colors",
            showWishlistRemove
              ? "text-[#EF4444] hover:bg-[#EF4444]/10"
              : "text-anga-text-secondary hover:text-[#EF4444]"
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
        <p className="text-[11px] font-medium text-anga-text-secondary mb-1">
          {product.seller}
        </p>
        <h3 className="text-sm font-semibold text-anga-text leading-snug mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-lg font-bold text-[#6C47FF]">
            {formatINR(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-anga-text-secondary line-through">
              {formatINR(product.originalPrice)}
            </span>
          )}
        </div>

        <p className="text-[11px] text-anga-text-secondary mb-3">
          Min order: {product.minOrder} units
        </p>

        {/* Add to Cart */}
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#6C47FF] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#5835DB] active:translate-y-px">
          <ShoppingCart className="h-4 w-4" />
          {showWishlistRemove ? "Add to Cart" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
