"use client";

import { useState } from "react";
import Link from "next/link";
import { PackageOpen, Heart, ShoppingCart } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { useRouter } from "next/navigation";

export interface Product {
  id: string;
  name: string;
  seller: string;
  category: string;
  originalPrice: number;
  price: number;
  minOrder: string;
  badge?: "Top Rated" | "New Arrival";
  imageUrl?: string;
}

function formatINR(value: number) {
  return "\u20B9" + value.toLocaleString("en-IN");
}

interface ProductCardProps {
  product: Product;
  showWishlistHeart?: boolean; // Legacy
  onRemoveWishlist?: () => void;
  isWishlistContext?: boolean; // New context
}

export default function ProductCard({
  product,
  showWishlistHeart,
  onRemoveWishlist,
  isWishlistContext,
}: ProductCardProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(showWishlistHeart || false);
  
  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
    if (isSaved && onRemoveWishlist) {
      onRemoveWishlist();
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Dummy add to cart logic for now
    alert("Added to cart!");
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Dummy buy now logic
    router.push('/cart');
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[14px] border bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1" style={{ borderColor: t.border }}>
      <Link href={`/products/${product.id}`} className="flex flex-col flex-1">
        {/* Image area (aspect-square to reduce vertical length) */}
        <div
          className="relative w-full aspect-square flex items-center justify-center bg-gray-100 overflow-hidden"
          style={{ background: "#EAF2FF" }}
        >
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <PackageOpen className="h-10 w-10 md:h-12 md:w-12 transition-transform duration-500 group-hover:scale-110" style={{ color: "#1A6FD4", opacity: 0.35 }} />
          )}

          {/* Discount badge — top-left */}
          {discount > 0 && (
            <span
              className="absolute top-2.5 left-2.5 z-10 rounded-[6px] text-xs font-bold text-white shadow-sm"
              style={{ background: "#1A6FD4", padding: "3px 7px" }}
            >
              -{discount}%
            </span>
          )}

          {/* Status Badge — bottom-left */}
          {product.badge && (
            <span
              className="absolute bottom-2.5 left-2.5 z-10 rounded-md px-2 py-0.5 text-xs font-bold shadow-sm"
              style={{
                background: product.badge === "Top Rated" ? "#EAF2FF" : "#FFCC00",
                color: product.badge === "Top Rated" ? "#1A6FD4" : "#1A1A2E",
              }}
            >
              {product.badge}
            </span>
          )}
        </div>

        {/* Body area */}
        <div className="flex-1 flex flex-col p-3 md:p-4 relative bg-white">
          {/* Wishlist icon positioned top-right of the text area */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors z-20"
            aria-label="Toggle wishlist"
          >
            <Heart
              className="w-4 h-4 md:w-5 md:h-5 transition-colors"
              style={{ color: isSaved ? "#DC2626" : "#9CA3AF" }}
              fill={isSaved ? "#DC2626" : "transparent"}
            />
          </button>

          <p className="text-[11px] md:text-xs mb-1 pr-7 md:pr-8 truncate" style={{ color: t.textSecondary }}>
            {product.seller}
          </p>
          
          <h3
            className="font-normal mb-1.5 pr-7 md:pr-8 overflow-hidden"
            style={{
              color: t.textPrimary,
              fontSize: '15px',
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {product.name}
          </h3>

          <div className="mt-auto">
            {/* Price row */}
            <div className="flex items-baseline mb-1">
              <span className="font-bold tracking-tight" style={{ color: t.textPrimary, fontSize: '20px' }}>
                {formatINR(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="line-through ml-2" style={{ color: t.textSecondary, fontSize: '13px' }}>
                  {formatINR(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="text-xs font-medium" style={{ color: t.textSecondary, marginTop: 4 }}>
              Min order: {product.minOrder}
            </p>
          </div>
        </div>
      </Link>

      {/* Dynamic Wishlist Actions */}
      {isWishlistContext && (
        <div className="p-3 pt-0 border-t mt-2 flex gap-2 bg-white" style={{ borderColor: t.border }}>
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-bold text-sm transition-colors hover:bg-gray-50 border"
            style={{ color: t.textPrimary, borderColor: t.border }}
          >
            <ShoppingCart className="w-4 h-4" />
            Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 py-2.5 rounded-lg font-bold text-sm text-white transition-opacity hover:opacity-90 shadow-sm"
            style={{ background: "#9C27B0" }}
          >
            Buy Now
          </button>
        </div>
      )}
    </div>
  );
}
