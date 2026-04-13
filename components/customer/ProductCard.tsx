"use client";

import { PackageOpen, Heart, ShoppingCart } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";

export interface Product {
  id: string;
  name: string;
  seller: string;
  category: string;
  originalPrice: number;
  price: number;
  minOrder: string;
  badge?: "Top Rated" | "New Arrival";
}

function formatINR(value: number) {
  return "\u20B9" + value.toLocaleString("en-IN");
}

interface ProductCardProps {
  product: Product;
  showWishlistHeart?: boolean;
  onRemoveWishlist?: () => void;
}

export default function ProductCard({
  product,
  showWishlistHeart,
  onRemoveWishlist,
}: ProductCardProps) {
  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div
      className="group overflow-hidden rounded-[14px] border transition-colors hover:border-[#1A6FD4]"
      style={{ background: "#FFFFFF", borderColor: "#E8EEF4" }}
    >
      {/* Image area */}
      <div
        className="relative flex h-[200px] flex-col items-center justify-center gap-2"
        style={{ background: "#EAF2FF" }}
      >
        <PackageOpen
          className="h-12 w-12"
          style={{ color: "#1A6FD4", opacity: 0.35 }}
        />
        {/* Category pill */}
        <span
          className="rounded-full px-3 py-0.5 text-[10px] font-medium"
          style={{ background: "rgba(26,111,212,0.1)", color: "#1A6FD4" }}
        >
          {product.category}
        </span>

        {/* Badge — bottom-left */}
        {product.badge && (
          <span
            className="absolute bottom-3 left-3 rounded-md px-2 py-0.5 text-[10px] font-bold"
            style={{
              background:
                product.badge === "Top Rated" ? "#EAF2FF" : "#FFCC00",
              color:
                product.badge === "Top Rated" ? "#1A6FD4" : "#1A1A2E",
            }}
          >
            {product.badge}
          </span>
        )}

        {/* Discount badge — top-right */}
        {discount > 0 && (
          <span
            className="absolute top-3 right-3 rounded-[6px] text-[11px] font-bold text-white"
            style={{ background: "#1A6FD4", padding: "3px 7px" }}
          >
            -{discount}%
          </span>
        )}

        {/* Wishlist heart (filled red, for wishlist page) */}
        {showWishlistHeart && (
          <button
            onClick={onRemoveWishlist}
            className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm transition-opacity hover:opacity-80"
          >
            <Heart
              className="h-4 w-4"
              style={{ color: "#DC2626" }}
              fill="#DC2626"
            />
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px" }}>
        <p className="text-[11px] mb-0.5" style={{ color: "#9CA3AF" }}>
          {product.seller}
        </p>
        <h3
          className="font-semibold mb-1.5 overflow-hidden"
          style={{
            color: "#1A1A2E",
            fontSize: 15,
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {product.name}
        </h3>

        {/* Price row */}
        <div className="flex items-baseline mb-1">
          <span
            className="font-bold"
            style={{ color: "#1A1A2E", fontSize: 20 }}
          >
            {formatINR(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <span
              className="line-through"
              style={{ color: "#9CA3AF", fontSize: 12, marginLeft: 8 }}
            >
              {formatINR(product.originalPrice)}
            </span>
          )}
        </div>

        <p className="text-[11px]" style={{ color: "#6B7280", marginTop: 2 }}>
          Min order: {product.minOrder}
        </p>

        {/* Button row */}
        <div className="flex" style={{ gap: 8, marginTop: 12 }}>
          <button
            className="flex flex-1 items-center justify-center rounded-[10px] text-[13px] font-bold transition-opacity hover:opacity-90 active:translate-y-px"
            style={{
              background: "#FFCC00",
              color: "#1A1A2E",
              padding: "10px 0",
              gap: 6,
            }}
          >
            <ShoppingCart style={{ width: 15, height: 15 }} />
            Add to Cart
          </button>
          <button
            className="flex shrink-0 items-center justify-center rounded-[10px] border transition-colors hover:border-[#DC2626] hover:text-[#DC2626]"
            style={{
              width: 40,
              height: 40,
              borderColor: "#E8EEF4",
              color: "#9CA3AF",
              background: "#FFFFFF",
            }}
          >
            <Heart style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
