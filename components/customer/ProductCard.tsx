"use client";

import { useState } from "react";
import Link from "next/link";
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
    <Link
      href={`/products/${product.id}`}
      className="group block overflow-hidden rounded-[14px] border transition-colors hover:border-[#1A6FD4]"
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
          className="rounded-full px-3 py-0.5 text-xs md:text-sm font-medium"
          style={{ background: "rgba(26,111,212,0.1)", color: "#1A6FD4" }}
        >
          {product.category}
        </span>

        {/* Badge — bottom-left */}
        {product.badge && (
          <span
            className="absolute bottom-3 left-3 rounded-md px-2 py-0.5 text-xs md:text-sm font-bold"
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
            className="absolute top-3 right-3 rounded-[6px] text-xs md:text-sm font-bold text-white"
            style={{ background: "#1A6FD4", padding: "3px 7px" }}
          >
            -{discount}%
          </span>
        )}

        {/* Wishlist heart (filled red, for wishlist page) */}
        {showWishlistHeart && (
          <button
            onClick={(e) => { e.preventDefault(); onRemoveWishlist?.(); }}
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
        <p className="text-xs md:text-sm mb-0.5" style={{ color: "#9CA3AF" }}>
          {product.seller}
        </p>
        <h3
          className="font-semibold mb-1.5 overflow-hidden"
          style={{
            color: "#1A1A2E",
            fontSize: '16px',
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
            style={{ color: "#1A1A2E", fontSize: '24px' }}
          >
            {formatINR(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <span
              className="line-through"
              style={{ color: "#9CA3AF", fontSize: '12px', marginLeft: 8 }}
            >
              {formatINR(product.originalPrice)}
            </span>
          )}
        </div>

        <p className="text-xs md:text-sm" style={{ color: "#6B7280", marginTop: 2 }}>
          Min order: {product.minOrder}
        </p>
      </div>
    </Link>
  );
}
