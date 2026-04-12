"use client";

import { PackageOpen, Heart } from "lucide-react";
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
      style={{ background: t.bgCard, borderColor: t.border }}
    >
      {/* Image area */}
      <div
        className="relative flex h-40 items-center justify-center"
        style={{ background: t.bgBlueTint }}
      >
        <PackageOpen className="h-8 w-8" style={{ color: t.bluePrimary }} />

        {/* Badge */}
        {product.badge && (
          <span
            className="absolute top-3 left-3 rounded-md px-2 py-0.5 text-[10px] font-bold"
            style={{
              background:
                product.badge === "Top Rated" ? t.bgBlueTint : t.yellowCta,
              color:
                product.badge === "Top Rated" ? t.bluePrimary : t.ctaText,
            }}
          >
            {product.badge}
          </span>
        )}

        {/* Discount badge */}
        {discount > 0 && (
          <span
            className="absolute top-3 right-3 rounded-md px-2 py-0.5 text-[10px] font-bold text-white"
            style={{ background: t.bluePrimary }}
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
              style={{ color: t.outOfStock }}
              fill={t.outOfStock}
            />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-3.5 py-3">
        <p className="text-[11px] mb-0.5" style={{ color: t.textMuted }}>
          {product.seller}
        </p>
        <h3
          className="text-sm font-semibold leading-snug mb-1.5 line-clamp-2"
          style={{ color: t.textPrimary, lineHeight: 1.35 }}
        >
          {product.name}
        </h3>

        {/* Price row */}
        <div className="flex items-baseline gap-1.5 mb-1">
          <span
            className="text-lg font-bold"
            style={{ color: t.textPrimary }}
          >
            {formatINR(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <span
              className="text-xs line-through"
              style={{ color: t.textMuted }}
            >
              {formatINR(product.originalPrice)}
            </span>
          )}
        </div>

        <p className="text-[11px] mb-2.5" style={{ color: "#6B7280" }}>
          Min order: {product.minOrder}
        </p>

        {/* Add to Cart */}
        <button
          className="flex w-full items-center justify-center rounded-[10px] py-2.5 text-[13px] font-bold transition-opacity hover:opacity-90 active:translate-y-px"
          style={{ background: t.yellowCta, color: t.ctaText }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
