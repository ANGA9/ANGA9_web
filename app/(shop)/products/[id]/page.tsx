"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight, Minus, Plus, ShoppingCart, Loader2, Check,
  PackageOpen, AlertTriangle, ArrowLeft, Heart, Share2, Truck, Store, ChevronDown, ChevronUp,
} from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { api } from "@/lib/api";
import { useCart } from "@/lib/CartContext";
import { useWishlist } from "@/lib/WishlistContext";
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

interface SellerInfo {
  id: string;
  full_name: string;
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
  users?: SellerInfo;
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
  const wishlist = useWishlist();
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
  const [descExpanded, setDescExpanded] = useState(false);

  const productId = params.id;

  // Fix: scroll to top on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

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

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: product?.name, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const isSaved = product ? wishlist.hasItem(product.id) : false;
  const handleWishlistToggle = () => {
    if (!product) return;
    wishlist.toggleItem(product.id);
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="animate-pulse">
          <div className="h-4 w-48 rounded bg-gray-200 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square rounded-xl bg-gray-100" />
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
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl" style={{ backgroundColor: `${t.outOfStock}15` }}>
          <AlertTriangle className="h-8 w-8" style={{ color: t.outOfStock }} />
        </div>
        <h3 className="text-base font-semibold" style={{ color: t.textPrimary }}>Product not found</h3>
        <p className="mt-1 max-w-sm text-sm" style={{ color: t.textSecondary }}>
          {error || "This product doesn't exist or has been removed."}
        </p>
        <button onClick={() => router.push("/")} className="mt-4 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:opacity-90" style={{ backgroundColor: t.bluePrimary }}>
          Back to Home
        </button>
      </div>
    );
  }

  const stock = getStockInfo();
  const currentPrice = getCurrentPrice();
  const totalPrice = currentPrice * quantity;
  const discount = product.sale_price && product.base_price > product.sale_price
    ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
    : 0;
  const variants = product.product_variants?.filter((v) => v.is_active) || [];
  const sellerName = product.users?.full_name || "ANGA9 Seller";
  const deliveryFree = totalPrice > 10000;
  const descriptionLong = (product.description?.length || 0) > 150;

  return (
    <div className="pb-40 md:pb-6">

      {/* ══════════ MOBILE HEADER (<md) ══════════ */}
      <header className="flex md:hidden items-center justify-between px-4 h-14 bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center flex-1 min-w-0">
          <button onClick={() => router.back()} className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors shrink-0">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-[15px] font-medium text-gray-900 leading-tight truncate pr-2">
            {product.name}
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleShare} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Share">
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
          <button onClick={handleWishlistToggle} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Toggle wishlist">
            <Heart className="w-5 h-5 transition-colors" style={{ color: isSaved ? "#DC2626" : "#9CA3AF" }} fill={isSaved ? "#DC2626" : "transparent"} />
          </button>
        </div>
      </header>

      {/* ══════════ DESKTOP BREADCRUMB (md+) ══════════ */}
      <nav className="hidden md:flex items-center gap-1.5 text-sm mb-6 mt-6 flex-wrap px-4" style={{ color: t.textMuted }}>
        <Link href="/" className="hover:underline" style={{ color: t.bluePrimary }}>Home</Link>
        {product.categories && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span style={{ color: t.textSecondary }}>{product.categories.name}</span>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="truncate max-w-[200px]" style={{ color: t.textPrimary }}>{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8 lg:gap-12 px-0 md:px-4">
        {/* ══════════ LEFT: Images ══════════ */}
        <div>
          <div
            className="relative flex items-center justify-center overflow-hidden md:rounded-xl"
            style={{ background: t.bgBlueTint, aspectRatio: "4/5" }}
          >
            {product.images && product.images.length > 0 ? (
              <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-contain" />
            ) : (
              <PackageOpen className="w-20 h-20" style={{ color: t.bluePrimary, opacity: 0.3 }} />
            )}
            {discount > 0 && (
              <span className="absolute top-4 left-4 rounded-lg text-sm font-bold text-white px-3 py-1" style={{ background: t.bluePrimary }}>
                -{discount}%
              </span>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto px-4 md:px-0">
              {product.images.map((img, idx) => (
                <button key={idx} onClick={() => setSelectedImage(idx)}
                  className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors"
                  style={{ borderColor: idx === selectedImage ? t.bluePrimary : t.border, background: t.bgBlueTint }}>
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ══════════ RIGHT: Product Info ══════════ */}
        <div className="px-4 md:px-0 mt-4 md:mt-0">
          {/* Category */}
          {product.categories && (
            <span className="inline-block rounded-full px-3 py-0.5 text-xs font-medium mb-3" style={{ background: `${t.bluePrimary}15`, color: t.bluePrimary }}>
              {product.categories.name}
            </span>
          )}

          {/* Name */}
          <h1 className="font-bold leading-tight mb-1" style={{ color: t.textPrimary, fontSize: 'clamp(22px, 4vw, 30px)' }}>
            {product.name}
          </h1>

          {/* Seller */}
          <div className="flex items-center gap-1.5 mb-4">
            <Store className="w-3.5 h-3.5" style={{ color: t.textMuted }} />
            <span className="text-sm font-medium" style={{ color: t.textSecondary }}>{sellerName}</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="font-bold" style={{ color: t.textPrimary, fontSize: 'clamp(28px, 5vw, 36px)' }}>
              {formatINR(currentPrice)}
            </span>
            {discount > 0 && (
              <>
                <span className="line-through text-sm md:text-base" style={{ color: t.textMuted }}>
                  {formatINR(product.base_price)}
                </span>
                <span className="text-sm font-semibold" style={{ color: t.inStock }}>{discount}% off</span>
              </>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full" style={{
              background: stock.status === "in" ? t.inStock : stock.status === "low" ? t.lowStock : t.outOfStock,
            }} />
            <span className="text-sm font-medium" style={{
              color: stock.status === "in" ? t.inStock : stock.status === "low" ? t.lowStock : stock.status === "out" ? t.outOfStock : t.textMuted,
            }}>
              {stock.status === "in" ? "In Stock" : stock.status === "low" ? `Low Stock — ${stock.quantity} left` : stock.status === "out" ? "Out of Stock" : "Stock info unavailable"}
            </span>
          </div>



          {/* Min order */}
          <p className="text-sm mb-5" style={{ color: t.textSecondary }}>
            Min order: {product.min_order_qty} {product.unit}{product.min_order_qty > 1 ? "s" : ""}
          </p>

          {/* Variants */}
          {variants.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-semibold mb-2" style={{ color: t.textPrimary }}>Variants</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button key={v.id} onClick={() => setSelectedVariant(v.id)}
                    className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                    style={{
                      borderColor: selectedVariant === v.id ? t.bluePrimary : t.border,
                      background: selectedVariant === v.id ? `${t.bluePrimary}10` : "#FFFFFF",
                      color: selectedVariant === v.id ? t.bluePrimary : t.textPrimary,
                    }}>
                    {v.name || v.sku}
                    {v.price_offset !== 0 && (
                      <span className="ml-1 text-xs" style={{ color: t.textMuted }}>
                        ({v.price_offset > 0 ? "+" : ""}{formatINR(v.price_offset)})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Picker */}
          <div className="mb-2">
            <p className="text-sm font-semibold mb-2" style={{ color: t.textPrimary }}>Quantity</p>
            <div className="inline-flex items-center rounded-xl border overflow-hidden" style={{ borderColor: t.border }}>
              <button onClick={() => setQuantity((q) => Math.max(product.min_order_qty, q - 1))}
                className="flex items-center justify-center w-12 h-12 transition-colors hover:bg-gray-50 active:bg-gray-100"
                disabled={quantity <= product.min_order_qty}>
                <Minus className="w-4 h-4" style={{ color: t.textSecondary }} />
              </button>
              <span className="flex items-center justify-center w-14 h-12 text-base font-bold border-x" style={{ borderColor: t.border, color: t.textPrimary }}>
                {quantity}
              </span>
              <button onClick={() => setQuantity((q) => q + 1)}
                className="flex items-center justify-center w-12 h-12 transition-colors hover:bg-gray-50 active:bg-gray-100"
                disabled={stock.status === "out"}>
                <Plus className="w-4 h-4" style={{ color: t.textSecondary }} />
              </button>
            </div>
          </div>

          {/* Total Price Box */}
          <div className="mb-6 mt-2 p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4" style={{ backgroundColor: '#F8FBFF', borderColor: '#EAF2FF' }}>
            <div>
              <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Amount</p>
              <div className="flex items-center gap-2">
                <span className="text-[24px] md:text-[28px] font-black leading-none" style={{ color: t.textPrimary }}>
                  {formatINR(totalPrice)}
                </span>
                {quantity > 1 && (
                  <span className="text-[13px] font-medium px-2 py-0.5 rounded bg-white border text-gray-500">
                    {quantity} × {formatINR(currentPrice)}
                  </span>
                )}
              </div>
            </div>
            {deliveryFree ? (
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[13px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                  <Truck className="w-3.5 h-3.5" /> Free Delivery
                </span>
              </div>
            ) : (
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[13px] font-medium text-gray-500">
                  <Truck className="w-4 h-4 text-gray-400" /> Delivery ₹500
                </span>
              </div>
            )}
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex gap-3">
            <button onClick={handleAddToCart} disabled={adding || stock.status === "out"}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl text-base font-bold transition-opacity hover:opacity-90 active:translate-y-px disabled:opacity-50"
              style={{
                background: added ? t.inStock : stock.status === "out" ? t.textMuted : "#FFFFFF",
                color: added ? "#FFFFFF" : t.textPrimary,
                border: `2px solid ${added ? t.inStock : stock.status === "out" ? t.textMuted : t.border}`,
                padding: "14px 0",
              }}>
              {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
              {adding ? "Adding..." : added ? "Added!" : stock.status === "out" ? "Out of Stock" : "Add to Cart"}
            </button>

            <button onClick={async () => { if (stock.status !== "out") { await handleAddToCart(); router.push('/cart'); } }}
              disabled={adding || stock.status === "out"}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl text-base font-bold transition-opacity hover:opacity-90 active:translate-y-px disabled:opacity-50"
              style={{ background: stock.status === "out" ? t.textMuted : "#4338CA", color: "#FFFFFF", border: "2px solid transparent", padding: "14px 0" }}>
              Buy Now
            </button>

            <button onClick={handleWishlistToggle}
              className="flex items-center justify-center w-14 rounded-xl border-2 transition-colors hover:bg-gray-50"
              style={{ borderColor: isSaved ? "#DC2626" : t.border }} aria-label="Toggle wishlist">
              <Heart className="w-5 h-5" style={{ color: isSaved ? "#DC2626" : "#9CA3AF" }} fill={isSaved ? "#DC2626" : "transparent"} />
            </button>

            <button onClick={handleShare}
              className="flex items-center justify-center w-14 rounded-xl border-2 transition-colors hover:bg-gray-50"
              style={{ borderColor: t.border }} aria-label="Share product">
              <Share2 className="w-5 h-5" style={{ color: t.textSecondary }} />
            </button>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-8 border-t pt-6" style={{ borderColor: t.border }}>
              <h2 className="font-semibold text-base mb-3" style={{ color: t.textPrimary }}>Description</h2>
              <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap" style={{ color: t.textSecondary }}>
                {descriptionLong && !descExpanded ? (
                  <>{product.description.slice(0, 150)}...</>
                ) : (
                  product.description
                )}
              </div>
              {descriptionLong && (
                <button onClick={() => setDescExpanded(!descExpanded)}
                  className="flex items-center gap-1 mt-2 text-sm font-semibold transition-colors hover:opacity-80"
                  style={{ color: t.bluePrimary }}>
                  {descExpanded ? <><ChevronUp className="w-4 h-4" /> Show less</> : <><ChevronDown className="w-4 h-4" /> Read more</>}
                </button>
              )}
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mt-6">
              <h2 className="font-semibold text-sm mb-2" style={{ color: t.textPrimary }}>Tags</h2>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="rounded-full px-3 py-1 text-xs md:text-sm font-medium"
                    style={{ background: t.bgBlueTint, color: t.bluePrimary }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════ MOBILE STICKY CTA BAR (<md) ══════════ */}
      <div className="md:hidden fixed bottom-[calc(60px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.10)]">
        <div className="px-4 py-3 flex gap-3 items-center">
          <button onClick={handleAddToCart} disabled={adding || stock.status === "out"}
            className="flex-1 h-[48px] rounded-xl text-[15px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60 border-2"
            style={{
              background: added ? t.inStock : "#FFFFFF",
              color: added ? "#FFFFFF" : t.textPrimary,
              borderColor: added ? t.inStock : t.border,
            }}>
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            {adding ? "Adding" : added ? "Added!" : "Add to Cart"}
          </button>
          <button onClick={async () => { if (stock.status !== "out") { await handleAddToCart(); router.push('/cart'); } }}
            disabled={adding || stock.status === "out"}
            className="flex-1 h-[48px] rounded-xl text-[15px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60 shadow-lg shadow-indigo-100"
            style={{ background: "#4338CA", color: "#FFFFFF" }}>
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
