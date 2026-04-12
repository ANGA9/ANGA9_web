"use client";

import { useState } from "react";
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
  const [isWishlisted, setIsWishlisted] = useState(
    product.inWishlist ?? false
  );

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const bgColor = categoryBg[product.category] ?? "#F3F4F6";

  const toggleWishlist = () => setIsWishlisted((prev) => !prev);

  return (
    <div className="group rounded-xl border border-[#E5E7EB] bg-white overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5">
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

        {/* Hover-reveal wishlist heart (top-right, Myntra-style) */}
        <button
          onClick={toggleWishlist}
          className={cn(
            "absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#E5E3FF] shadow-sm transition-all",
            "opacity-0 group-hover:opacity-100",
            isWishlisted && "opacity-100"
          )}
        >
          <Heart
            className="h-4 w-4 text-[#E24B4A]"
            fill={isWishlisted ? "#E24B4A" : "none"}
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

        {/* Button row: Add to Cart | Wishlist */}
        <div className="flex gap-2">
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#6C47FF] px-3 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#5538DD] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/40 active:translate-y-px">
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>

          <button
            onClick={toggleWishlist}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors active:translate-y-px",
              isWishlisted
                ? "bg-[#FFF5F5] border-[1.5px] border-[#E24B4A] text-[#1A1A2E]"
                : "bg-white border-[1.5px] border-[#1A1A2E] text-[#1A1A2E] hover:bg-[#FFF5F5] hover:border-[#E24B4A]"
            )}
          >
            <Heart
              className="h-[15px] w-[15px] text-[#E24B4A]"
              fill={isWishlisted ? "#E24B4A" : "none"}
            />
            {isWishlisted ? "Wishlisted" : "Wishlist"}
          </button>
        </div>
      </div>
    </div>
  );
}
