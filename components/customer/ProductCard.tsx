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
  Furniture: "#F3F4F6",
  Electronics: "#F3F4F6",
  "Home Decor": "#F3F4F6",
  Industrial: "#F3F4F6",
  Retail: "#F3F4F6",
  "Office Essentials": "#F3F4F6",
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

  const bgColor = categoryBg[product.category] ?? "#F3F4F6";

  return (
    <div className="group rounded-xl border border-[#E5E7EB] bg-white overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 hover:bg-[#F9FAFB]">
      {/* Image placeholder */}
      <div
        className="relative h-48 flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <span className="text-4xl font-bold text-[#9CA3AF] opacity-40">
          {product.category.charAt(0)}
        </span>

        {/* Badge */}
        {product.badge && (
          <span
            className={cn(
              "absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
              product.badge === "TOP RATED"
                ? "bg-[#F3F4F6] text-[#1F2937]"
                : "bg-[#FF8C00] text-white"
            )}
          >
            {product.badge}
          </span>
        )}

        {/* Discount */}
        {discount > 0 && (
          <span className="absolute top-3 right-3 rounded-full bg-[#FF8C00] px-2 py-0.5 text-[10px] font-bold text-white">
            -{discount}%
          </span>
        )}

        {/* Wishlist heart */}
        <button
          className={cn(
            "absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-colors",
            showWishlistRemove
              ? "text-[#FF8C00] hover:bg-[#FFF7ED]"
              : "text-[#6B7280] hover:text-[#FF8C00]"
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
        <p className="text-[11px] font-medium text-[#6B7280] mb-1">
          {product.seller}
        </p>
        <h3 className="text-sm font-medium text-[#1F2937] leading-snug mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-lg font-medium text-[#1F2937]">
            {formatINR(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-[#6B7280] line-through">
              {formatINR(product.originalPrice)}
            </span>
          )}
        </div>

        <p className="text-[11px] text-[#6B7280] mb-3">
          Min order: {product.minOrder} units
        </p>

        {/* Add to Cart */}
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FFD814] px-4 py-2.5 text-sm font-semibold text-[#0F1111] transition-colors hover:bg-[#F7CA00] focus:outline-none focus:ring-2 focus:ring-[#F7CA00] active:translate-y-px">
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
