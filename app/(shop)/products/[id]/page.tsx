"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  Loader2,
  Check,
  PackageOpen,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { api } from "@/lib/api";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { useLoginSheet } from "@/lib/LoginSheetContext";
import toast from "react-hot-toast";

interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price_offset: number;
  attributes: Record<string, string>;
  is_active: boolean;
}

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  sale_price?: number | null;
  min_order_qty: number;
  unit: string;
  status: string;
  seller_id: string;
  images: string[];
  tags: string[];
  categories?: ProductCategory;
  product_variants?: ProductVariant[];
  created_at: string;
}

interface InventoryItem {
  product_id: string;
  variant_id: string | null;
  quantity: number;
  reserved: number;
  low_stock_threshold: number;
}

function formatINR(value: number) {
  return "\u20B9" + value.toLocaleString("en-IN");
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { open: openLoginSheet } = useLoginSheet();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const productId = params.id;

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [productRes, inventoryRes] = await Promise.all([
        api.get<{ product: ProductDetail }>(`/api/products/${productId}`),
        api.get<InventoryItem[]>(`/api/inventory/${productId}`, { silent: true }),
      ]);

      setProduct(productRes.product);
      setInventory(inventoryRes || []);

      if (productRes.product.product_variants?.length) {
        const active = productRes.product.product_variants.find((v) => v.is_active);
        if (active) setSelectedVariant(active.id);
      }

      setQuantity(productRes.product.min_order_qty || 1);
    } catch {
      setError("Failed to load product. It may not exist or has been removed.");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const getStockInfo = () => {
    const variantId = selectedVariant || null;
    const inv = inventory.find(
      (i) => i.variant_id === variantId || (!i.variant_id && !variantId)
    );
    if (!inv) return { status: "unknown" as const, quantity: 0 };
    const available = inv.quantity - inv.reserved;
    if (available <= 0) return { status: "out" as const, quantity: 0 };
    if (available <= inv.low_stock_threshold)
      return { status: "low" as const, quantity: available };
    return { status: "in" as const, quantity: available };
  };

  const getCurrentPrice = () => {
    if (!product) return 0;
    let price = product.sale_price ?? product.base_price;
    if (selectedVariant) {
      const variant = product.product_variants?.find((v) => v.id === selectedVariant);
      if (variant) price += variant.price_offset;
    }
    return price;
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add products to cart", { icon: "\uD83D\uDD12", duration: 3500 });
      openLoginSheet();
      return;
    }
    if (adding) return;
    setAdding(true);
    try {
      await addItem(product!.id, quantity);
      setAdded(true);
      toast.success(`${product!.name} added to cart!`, { icon: "\uD83D\uDED2" });
      setTimeout(() => setAdded(false), 2000);
    } catch {
      toast.error("Failed to add item to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="animate-pulse">
          <div className="h-4 w-48 rounded bg-gray-200 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square rounded-2xl bg-gray-100" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 rounded bg-gray-200" />
              <div className="h-4 w-1/3 rounded bg-gray-200" />
              <div className="h-10 w-1/2 rounded bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-2/3 rounded bg-gray-200" />
              <div className="h-12 w-full rounded-xl bg-gray-200 mt-8" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${t.outOfStock}15` }}
        >
          <AlertTriangle className="h-8 w-8" style={{ color: t.outOfStock }} />
        </div>
        <h3 className="text-base font-semibold" style={{ color: t.textPrimary }}>
          Product not found
        </h3>
        <p className="mt-1 max-w-sm text-sm" style={{ color: t.textSecondary }}>
          {error || "This product doesn't exist or has been removed."}
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:opacity-90"
          style={{ backgroundColor: t.bluePrimary }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  const stock = getStockInfo();
  const currentPrice = getCurrentPrice();
  const discount =
    product.sale_price && product.base_price > product.sale_price
      ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
      : 0;
  const variants = product.product_variants?.filter((v) => v.is_active) || [];

  return (
    <div className="py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[13px] mb-6 flex-wrap" style={{ color: t.textMuted }}>
        <Link href="/" className="hover:underline" style={{ color: t.bluePrimary }}>
          Home
        </Link>
        {product.categories && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span style={{ color: t.textSecondary }}>{product.categories.name}</span>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="truncate max-w-[200px]" style={{ color: t.textPrimary }}>
          {product.name}
        </span>
      </nav>

      {/* Back button (mobile) */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-[13px] font-medium mb-4 md:hidden"
        style={{ color: t.bluePrimary }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Images */}
        <div>
          {/* Main Image */}
          <div
            className="relative flex items-center justify-center rounded-2xl overflow-hidden"
            style={{
              background: t.bgBlueTint,
              aspectRatio: "1",
            }}
          >
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <PackageOpen className="w-20 h-20" style={{ color: t.bluePrimary, opacity: 0.3 }} />
            )}

            {discount > 0 && (
              <span
                className="absolute top-4 right-4 rounded-lg text-[13px] font-bold text-white px-3 py-1"
                style={{ background: t.bluePrimary }}
              >
                -{discount}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors"
                  style={{
                    borderColor: idx === selectedImage ? t.bluePrimary : t.border,
                    background: t.bgBlueTint,
                  }}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div>
          {/* Category */}
          {product.categories && (
            <span
              className="inline-block rounded-full px-3 py-0.5 text-[11px] font-medium mb-3"
              style={{ background: `${t.bluePrimary}15`, color: t.bluePrimary }}
            >
              {product.categories.name}
            </span>
          )}

          {/* Name */}
          <h1 className="font-bold leading-tight mb-2" style={{ color: t.textPrimary, fontSize: 24 }}>
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="font-bold" style={{ color: t.textPrimary, fontSize: 28 }}>
              {formatINR(currentPrice)}
            </span>
            {discount > 0 && (
              <>
                <span className="line-through text-base" style={{ color: t.textMuted }}>
                  {formatINR(product.base_price)}
                </span>
                <span className="text-sm font-semibold" style={{ color: t.inStock }}>
                  {discount}% off
                </span>
              </>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background:
                  stock.status === "in"
                    ? t.inStock
                    : stock.status === "low"
                    ? t.lowStock
                    : t.outOfStock,
              }}
            />
            <span
              className="text-[13px] font-medium"
              style={{
                color:
                  stock.status === "in"
                    ? t.inStock
                    : stock.status === "low"
                    ? t.lowStock
                    : stock.status === "out"
                    ? t.outOfStock
                    : t.textMuted,
              }}
            >
              {stock.status === "in"
                ? "In Stock"
                : stock.status === "low"
                ? `Low Stock — ${stock.quantity} left`
                : stock.status === "out"
                ? "Out of Stock"
                : "Stock info unavailable"}
            </span>
          </div>

          {/* Min order */}
          <p className="text-[13px] mb-5" style={{ color: t.textSecondary }}>
            Min order: {product.min_order_qty} {product.unit}
            {product.min_order_qty > 1 ? "s" : ""}
          </p>

          {/* Variants */}
          {variants.length > 0 && (
            <div className="mb-5">
              <p className="text-[13px] font-semibold mb-2" style={{ color: t.textPrimary }}>
                Variants
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v.id)}
                    className="rounded-lg border px-4 py-2 text-[13px] font-medium transition-colors"
                    style={{
                      borderColor: selectedVariant === v.id ? t.bluePrimary : t.border,
                      background: selectedVariant === v.id ? `${t.bluePrimary}10` : "#FFFFFF",
                      color: selectedVariant === v.id ? t.bluePrimary : t.textPrimary,
                    }}
                  >
                    {v.name || v.sku}
                    {v.price_offset !== 0 && (
                      <span className="ml-1 text-[11px]" style={{ color: t.textMuted }}>
                        ({v.price_offset > 0 ? "+" : ""}
                        {formatINR(v.price_offset)})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Picker */}
          <div className="mb-6">
            <p className="text-[13px] font-semibold mb-2" style={{ color: t.textPrimary }}>
              Quantity
            </p>
            <div
              className="inline-flex items-center rounded-lg border"
              style={{ borderColor: t.border }}
            >
              <button
                onClick={() => setQuantity((q) => Math.max(product.min_order_qty, q - 1))}
                className="flex items-center justify-center w-10 h-10 transition-colors hover:bg-gray-50"
                disabled={quantity <= product.min_order_qty}
              >
                <Minus className="w-4 h-4" style={{ color: t.textSecondary }} />
              </button>
              <span
                className="flex items-center justify-center w-12 h-10 text-[15px] font-semibold border-x"
                style={{ borderColor: t.border, color: t.textPrimary }}
              >
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="flex items-center justify-center w-10 h-10 transition-colors hover:bg-gray-50"
                disabled={stock.status === "out"}
              >
                <Plus className="w-4 h-4" style={{ color: t.textSecondary }} />
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={adding || stock.status === "out"}
            className="w-full flex items-center justify-center gap-2 rounded-xl text-[15px] font-bold transition-opacity hover:opacity-90 active:translate-y-px disabled:opacity-50"
            style={{
              background: added ? t.inStock : stock.status === "out" ? t.textMuted : t.yellowCta,
              color: added ? "#FFFFFF" : t.ctaText,
              padding: "14px 0",
            }}
          >
            {adding ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : added ? (
              <Check className="w-5 h-5" />
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
            {adding
              ? "Adding..."
              : added
              ? "Added to Cart!"
              : stock.status === "out"
              ? "Out of Stock"
              : "Add to Cart"}
          </button>

          {/* Description */}
          {product.description && (
            <div className="mt-8 border-t pt-6" style={{ borderColor: t.border }}>
              <h2 className="font-semibold text-[15px] mb-3" style={{ color: t.textPrimary }}>
                Description
              </h2>
              <div
                className="text-[14px] leading-relaxed whitespace-pre-wrap"
                style={{ color: t.textSecondary }}
              >
                {product.description}
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mt-6">
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full px-3 py-1 text-[11px] font-medium"
                    style={{ background: t.bgBlueTint, color: t.bluePrimary }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
