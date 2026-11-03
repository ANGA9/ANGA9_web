"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight, Minus, Plus, ShoppingCart, Loader2, Check, CheckCircle2,
  PackageOpen, AlertTriangle, ArrowLeft, Heart, Share2, Truck, Store, ChevronDown, ChevronUp, Play, Lock, Zap, ArrowDown,
  Building2, ShieldCheck, FileText, Star, Award, Layers
} from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { api } from "@/lib/api";
import { useCart } from "@/lib/CartContext";
import { useWishlist } from "@/lib/WishlistContext";
import { useAuth } from "@/lib/AuthContext";
import { useLoginSheet } from "@/lib/LoginSheetContext";
import toast from "react-hot-toast";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import RecentlyViewed from "@/components/customer/RecentlyViewed";
import ProductReviews from "@/components/customer/ProductReviews";
import ProductQA from "@/components/customer/ProductQA";
import { recommendationsApi } from "@/lib/recommendationsApi";
import ProductRail from "@/components/customer/ProductRail";
import type { Product } from "@/components/customer/ProductCard";
import { dealsApi, type Deal } from "@/lib/dealsApi";
import DealTimer from "@/components/customer/DealTimer";
import DealAlerts from "@/components/customer/DealAlerts";
import { Button } from "@/components/ui/button";
import { cdnUrl, parseImageArray } from "@/lib/utils";


// Mirrors VARIANT_FIELDS in product-service (no name/is_active columns in DB)
interface ProductVariant {
  id: string;
  sku: string;
  /** Absolute price for this variant; null = use the product's wholesale price */
  price_override: number | null;
  attributes: Record<string, string> | null;
  image_url: string | null;
}

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

interface SellerInfo {
  id: string;
  full_name: string;
  seller_profiles?: {
    store_name: string;
    storefront_published: boolean;
  } | {
    store_name: string;
    storefront_published: boolean;
  }[] | any;
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
  videos?: string[];
  tags: string[];
  categories_details?: ProductCategory[];
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

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|avi|mkv)([?#]|$)/i.test(url);
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const cart = useCart();
  const wishlist = useWishlist();
  const { user } = useAuth();
  const { open: openLoginSheet } = useLoginSheet();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [alsoBoughtProducts, setAlsoBoughtProducts] = useState<Product[]>([]);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const { addItem: addRecentlyViewed } = useRecentlyViewed();

  const productId = params?.id;
  const { addItem, count: cartCount } = cart;
  const cartItem = cart?.items?.find(i => i.productId === (product?.id || productId));
  const cartItemQty = cartItem ? (cartItem.qty || 1) : 0;

  // Fix: scroll to top on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const productRes = await api.get<{ product: ProductDetail }>(`/api/products/${productId}`);
      setProduct(productRes.product);
      
      if (productRes.product.product_variants?.length) {
        setSelectedVariant(productRes.product.product_variants[0].id);
      }
      setQuantity(productRes.product.min_order_qty || 1);

      // Auxiliary calls — failure in secondary rails must NEVER crash the product page
      Promise.allSettled([
        api.get<InventoryItem[]>(`/api/inventory/${productId}`, { silent: true }),
        recommendationsApi.getSimilar(productId),
        recommendationsApi.getAlsoBought(productId),
        dealsApi.getDeals({ product_id: productId, active_only: true }),
      ]).then(([invResult, simResult, alsoResult, dealsResult]) => {
        if (invResult.status === 'fulfilled' && invResult.value) {
          setInventory(invResult.value);
        }
        if (simResult.status === 'fulfilled' && simResult.value) {
          setSimilarProducts(simResult.value);
        }
        if (alsoResult.status === 'fulfilled' && alsoResult.value) {
          setAlsoBoughtProducts(alsoResult.value);
        }
        if (dealsResult.status === 'fulfilled' && dealsResult.value) {
          setActiveDeal(dealsResult.value?.[0] || null);
        }
      });
    } catch {
      setError("Failed to load product. It may not exist or has been removed.");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Track recently viewed and send telemetry
  useEffect(() => {
    if (product) {
      addRecentlyViewed({
        id: product.id,
        name: product.name,
        price: product.sale_price ?? product.base_price,
        originalPrice: product.base_price,
        imageUrl: product.images?.[0],
      });
      // Telemetry: Record view for recommendation engine
      recommendationsApi.recordView(product.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

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
    let base = product.sale_price ?? product.base_price;
    if (activeDeal) {
      if (activeDeal.type === 'quantity') {
        if (activeDeal.quantity_threshold && quantity >= activeDeal.quantity_threshold) {
          base = activeDeal.deal_price;
        }
      } else {
        base = activeDeal.deal_price;
      }
    }
    const defaultPrice = base;
    if (selectedVariant) {
      const variant = product.product_variants?.find((v) => v.id === selectedVariant);
      // price_override is an absolute variant price, not an offset
      if (variant && variant.price_override != null) return variant.price_override;
    }
    return defaultPrice;
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add products to cart", { icon: <Lock size={18} color="#1A6FD4" />, duration: 3500 });
      openLoginSheet();
      return;
    }
    if (adding) return;
    setAdding(true);
    try {
      await addItem(product!.id, quantity, selectedVariant || undefined);
      setAdded(true);
      toast.success(`${product!.name} added to cart!`, { icon: <ShoppingCart size={18} color="#059669" /> });
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
  const handleWishlistToggle = async () => {
    if (!product || togglingWishlist) return;
    setTogglingWishlist(true);
    try {
      await wishlist.toggleItem(product.id);
    } finally {
      setTogglingWishlist(false);
    }
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

  // ── Wholesale Tier Calculations ──
  const tier1Min = product.min_order_qty || 1;
  const tier2Min = Math.max(10, tier1Min * 5);
  const tier3Min = Math.max(50, tier1Min * 20);

  const tier1Price = currentPrice;
  const tier2Price = Math.round(currentPrice * 0.93); // 7% wholesale discount
  const tier3Price = Math.round(currentPrice * 0.85); // 15% super-bulk discount

  const activeTier = quantity >= tier3Min ? 3 : quantity >= tier2Min ? 2 : 1;
  const activeWholesaleUnitPrice = activeTier === 3 ? tier3Price : activeTier === 2 ? tier2Price : tier1Price;
  const computedTotal = activeWholesaleUnitPrice * quantity;
  const totalSavings = (product.base_price * quantity) - computedTotal;
  const exclGstPrice = Math.round(activeWholesaleUnitPrice / 1.18);
  const gstAmount = computedTotal - Math.round(computedTotal / 1.18);
  const totalPrice = currentPrice * quantity;
  const discount = product.sale_price && product.base_price > product.sale_price
    ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
    : 0;
  const variants = product.product_variants || [];
  const sellerProfiles = Array.isArray(product.users?.seller_profiles) 
    ? product.users?.seller_profiles[0] 
    : product.users?.seller_profiles;
  const storePublished = sellerProfiles?.storefront_published === true;
  const storeName = sellerProfiles?.store_name;
  const displaySellerName = storePublished && storeName ? storeName : (product.users?.full_name || "ANGA9 Seller");
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
            <Share2 className="w-5 h-5 text-black" />
          </button>
          <button onClick={handleWishlistToggle} disabled={togglingWishlist} className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-70" aria-label="Toggle wishlist">
            {togglingWishlist ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : (
              <Heart className="w-5 h-5 transition-colors" style={{ color: isSaved ? "#DC2626" : "#000000" }} fill={isSaved ? "#DC2626" : "transparent"} />
            )}
          </button>
          <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Open cart">
            <ShoppingCart className="w-5 h-5 text-black" />
            {cartCount > 0 && (
              <span 
                className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center leading-none"
                style={{ background: t.primaryCta, color: t.ctaText }}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      <nav className="hidden md:flex items-center gap-1.5 text-sm mb-6 mt-6 flex-wrap px-4" style={{ color: t.textMuted }}>
        <Link href="/" className="hover:underline" style={{ color: t.bluePrimary }}>Home</Link>
        {product.categories_details && (() => {
          const mainCat = product.categories_details.find(c => !c.parent_id);
          const subCat = product.categories_details.find(c => c.parent_id);
          return (
            <>
              {mainCat && (
                <>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <Link href={`/?category=${mainCat.slug}`} className="hover:underline" style={{ color: t.textSecondary }}>{mainCat.name}</Link>
                </>
              )}
              {subCat && (
                <>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <Link href={`/?category=${subCat.slug}`} className="hover:underline" style={{ color: t.textSecondary }}>{subCat.name}</Link>
                </>
              )}
            </>
          );
        })()}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="truncate max-w-[200px]" style={{ color: t.textPrimary }}>{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8 lg:gap-12 px-0 md:px-4">
        {/* ══════════ LEFT: Media Gallery ══════════ */}
        {(() => {
          const allMedia = [
            ...parseImageArray(product.images || (product as any).image_urls),
            ...parseImageArray(product.videos),
          ].map(url => cdnUrl(url)).filter(Boolean);
          const currentUrl = allMedia[selectedImage] || allMedia[0] || "";
          const currentIsVideo = isVideoUrl(currentUrl);

          return (
            <div>
              {/* MOBILE SWIPE GALLERY (<md) */}
              <div
                className="md:hidden flex overflow-x-auto snap-x snap-mandatory"
                style={{ background: t.bgBlueTint, scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain" }}
                onScroll={(e) => {
                  const scrollLeft = e.currentTarget.scrollLeft;
                  const clientWidth = e.currentTarget.clientWidth;
                  const index = Math.round(scrollLeft / clientWidth);
                  if (index !== selectedImage && index >= 0 && index < allMedia.length) {
                    setSelectedImage(index);
                  }
                }}
              >
                {allMedia.length > 0 ? (
                  allMedia.map((url, idx) => {
                    const isVid = isVideoUrl(url);
                    return (
                      <div key={idx} className="w-full shrink-0 snap-center snap-always flex items-center justify-center aspect-[4/5] relative">
                        {isVid ? (
                          <video src={url} controls className="w-full h-full object-contain bg-black" />
                        ) : (
                          <img src={url} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-contain" />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full shrink-0 flex items-center justify-center aspect-[4/5]">
                    <PackageOpen className="w-20 h-20" style={{ color: t.bluePrimary, opacity: 0.3 }} />
                  </div>
                )}
              </div>

              {/* MOBILE DOT INDICATORS */}
              {allMedia.length > 1 && (
                <div className="md:hidden flex items-center justify-center gap-1.5 mt-4 mb-2">
                  {allMedia.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === selectedImage ? "w-5" : "w-1.5"
                      }`}
                      style={{ background: idx === selectedImage ? t.bluePrimary : "#D1D5DB" }}
                    />
                  ))}
                </div>
              )}

              {/* DESKTOP SINGLE IMAGE (md+) */}
              <div
                className="hidden md:flex relative items-center justify-center overflow-hidden rounded-xl h-[550px]"
                style={{ background: t.bgBlueTint }}
              >
                {allMedia.length > 0 ? (
                  currentIsVideo ? (
                    <video
                      key={currentUrl}
                      src={currentUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                      style={{ background: "#000" }}
                    />
                  ) : (
                    <img src={currentUrl} alt={product.name} className="w-full h-full object-contain" />
                  )
                ) : (
                  <PackageOpen className="w-20 h-20" style={{ color: t.bluePrimary, opacity: 0.3 }} />
                )}
              </div>

              {/* DESKTOP THUMBNAILS (Hidden on mobile) */}
              {allMedia.length > 1 && (
                <div className="hidden md:flex gap-2 mt-3 overflow-x-auto px-0" style={{ scrollbarWidth: "none" }}>
                  {allMedia.map((url, idx) => {
                    const isVid = isVideoUrl(url);
                    return (
                      <button key={idx} onClick={() => setSelectedImage(idx)}
                        className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors relative"
                        style={{ borderColor: idx === selectedImage ? t.bluePrimary : t.border, background: isVid ? "#111" : t.bgBlueTint }}>
                        {isVid ? (
                          <>
                            <video src={url} muted preload="metadata" className="w-full h-full object-cover opacity-70" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="w-5 h-5 text-white drop-shadow-md" fill="white" />
                            </div>
                          </>
                        ) : (
                          <img src={url} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-contain" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* ══════════ RIGHT: Product Info (Wholesale Formatting) ══════════ */}
        <div className="px-4 md:px-0 mt-4 md:mt-0">

          {/* ── Wholesale Verified Store Card ── */}
          <div className="mb-3.5 p-3 rounded-2xl border border-gray-200/90 bg-white flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5 text-[#1A6FD4]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-[14.5px] text-gray-900 truncate">{displaySellerName}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    Verified Wholesaler
                  </span>
                </div>
                <p className="text-[11.5px] text-gray-500 truncate mt-0.5">
                  Direct Factory Mill • Ships from Textile Hub
                </p>
              </div>
            </div>
            {storePublished && product.users?.id && (
              <Link
                href={`/sellers/${product.users.id}`}
                className="shrink-0 ml-2 px-3 py-1.5 rounded-lg text-[12px] font-bold text-[#1A6FD4] bg-blue-50/80 hover:bg-blue-100 active:scale-95 transition-all"
              >
                Visit Store →
              </Link>
            )}
          </div>

          {/* Product Title */}
          <h1 className="font-semibold leading-snug mb-2 text-[19px] sm:text-[22px] md:text-[24px] text-gray-900">
            {product.name}
          </h1>

          {/* Subtitle / Rating & B2B Spec Row (Zero Emojis) */}
          <div className="flex items-center gap-2 mb-3 text-[12.5px] text-gray-600 flex-wrap">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200/60">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>4.3</span>
            </div>
            <span>•</span>
            <span className="text-gray-500 font-medium">32 bulk orders</span>
            <span>•</span>
            <span className="text-gray-500 uppercase tracking-wide">SKU: {product.slug.slice(0, 8).toUpperCase()}</span>
          </div>

          {/* ── Wholesale Price Display ── */}
          <div className="mb-2">
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <span className="font-black text-2xl md:text-3xl text-gray-900 tracking-tight">
                {formatINR(activeWholesaleUnitPrice)}
              </span>
              <span className="text-sm font-semibold text-gray-500">/ piece</span>
              {product.base_price > activeWholesaleUnitPrice && (
                <>
                  <span className="line-through font-medium text-base text-gray-400">
                    {formatINR(product.base_price)}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-black bg-green-50 text-green-700 border border-green-200">
                    Save {formatINR(product.base_price - activeWholesaleUnitPrice)} ({discount}% OFF)
                  </span>
                </>
              )}
            </div>
            <p className="text-[12px] text-gray-500 mt-1 font-medium">
              Excl. GST: {formatINR(exclGstPrice)} • 18% GST invoice &amp; Input Tax Credit (ITC) available
            </p>
          </div>

          {/* Deal Timer */}
          {activeDeal && activeDeal.ends_at && (
            <div className="my-2">
              <DealTimer endsAt={activeDeal.ends_at} />
            </div>
          )}

          {/* ── Wholesale Tiered Pricing Table (B2B Bulk Incentive) ── */}
          <div className="my-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-black uppercase tracking-wider text-gray-700">Wholesale Volume Tiers</span>
              <span className="text-[11px] font-semibold text-[#1A6FD4]">Save up to 15% on bulk</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {/* Tier 1 */}
              <button
                type="button"
                onClick={() => setQuantity(tier1Min)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  activeTier === 1 
                    ? "border-[#1A6FD4] bg-blue-50/60 shadow-xs ring-1 ring-[#1A6FD4]" 
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className="text-[11px] font-bold text-gray-500 block leading-tight">{tier1Min}–{tier2Min - 1} pcs</span>
                <span className="text-[15px] font-black text-gray-900 block mt-0.5">{formatINR(tier1Price)}</span>
                <span className="text-[10px] font-semibold text-gray-400 block mt-0.5">Base Rate</span>
              </button>

              {/* Tier 2 */}
              <button
                type="button"
                onClick={() => setQuantity(tier2Min)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  activeTier === 2 
                    ? "border-[#1A6FD4] bg-blue-50/60 shadow-xs ring-1 ring-[#1A6FD4]" 
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className="text-[11px] font-bold text-gray-500 block leading-tight">{tier2Min}–{tier3Min - 1} pcs</span>
                <span className="text-[15px] font-black text-gray-900 block mt-0.5">{formatINR(tier2Price)}</span>
                <span className="text-[10px] font-black text-green-600 block mt-0.5">Save 7%</span>
              </button>

              {/* Tier 3 */}
              <button
                type="button"
                onClick={() => setQuantity(tier3Min)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  activeTier === 3 
                    ? "border-[#1A6FD4] bg-blue-50/60 shadow-xs ring-1 ring-[#1A6FD4]" 
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className="text-[11px] font-bold text-gray-500 block leading-tight">{tier3Min}+ pcs</span>
                <span className="text-[15px] font-black text-gray-900 block mt-0.5">{formatINR(tier3Price)}</span>
                <span className="text-[10px] font-black text-green-600 block mt-0.5">Save 15% Super</span>
              </button>
            </div>
          </div>

          {/* ── Wholesale Lot & Pack Info ── */}
          <div className="mb-4 p-3 rounded-xl border border-gray-100 bg-gray-50/70 flex items-center justify-between text-[12.5px]">
            <div>
              <span className="font-bold text-gray-800">Minimum Order (MOQ):</span>{" "}
              <span className="font-semibold text-[#1A6FD4]">{product.min_order_qty} {product.unit || "piece"}{product.min_order_qty > 1 ? "s" : ""}</span>
            </div>
            <span className="text-[11.5px] font-medium text-gray-500">Sample Piece Allowed</span>
          </div>

          {/* Variants */}
          {variants.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold mb-2 text-gray-900">Select Variant / Size</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button key={v.id} onClick={() => setSelectedVariant(v.id)}
                    className="rounded-xl border px-3.5 py-2 text-sm font-medium transition-all active:scale-95 shadow-2xs"
                    style={{
                      borderColor: selectedVariant === v.id ? t.bluePrimary : t.border,
                      background: selectedVariant === v.id ? "#EEF2FF" : "#FFFFFF",
                      color: selectedVariant === v.id ? t.bluePrimary : t.textPrimary,
                    }}>
                    {v.attributes ? Object.values(v.attributes).join(" / ") : v.sku}
                    {v.price_override != null && v.price_override !== (product.sale_price ?? product.base_price) && (
                      <span className="ml-1 text-xs text-gray-400">
                        ({formatINR(v.price_override)})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Bulk Quantity Stepper & Quick Volume Presets ── */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-900">Select Order Quantity</p>
              <span className="text-xs text-gray-500">MOQ: {product.min_order_qty}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden shadow-2xs">
                <button onClick={() => setQuantity((q) => Math.max(product.min_order_qty, q - 1))}
                  className="flex items-center justify-center w-11 h-11 transition-colors hover:bg-gray-50 active:bg-gray-100"
                  disabled={quantity <= product.min_order_qty}>
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
                <span className="flex items-center justify-center min-w-[56px] px-3 h-11 text-base font-black border-x border-gray-200 text-gray-900">
                  {quantity}
                </span>
                <button onClick={() => setQuantity((q) => (stock.quantity && q < stock.quantity ? q + 1 : q + 1))}
                  className="flex items-center justify-center w-11 h-11 transition-colors hover:bg-gray-50 active:bg-gray-100">
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Quick Preset Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[10, 25, 50, 100].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuantity(preset)}
                    className="px-2.5 py-2 rounded-xl text-[12px] font-bold border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-gray-700 active:scale-95 transition-all shadow-2xs"
                  >
                    {preset} pcs
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Total Wholesale Amount Summary Box ── */}
          <div className="mb-5 mt-2 p-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-blue-100/70">
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Total Wholesale Order</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-[24px] md:text-[28px] font-black text-gray-900 leading-none">
                    {formatINR(computedTotal)}
                  </span>
                  <span className="text-[12.5px] font-medium text-gray-500">
                    ({quantity} pcs × {formatINR(activeWholesaleUnitPrice)})
                  </span>
                </div>
              </div>
              {computedTotal > 10000 ? (
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[12px] font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-800 border border-green-200">
                    <Truck className="w-3.5 h-3.5 text-green-700" /> Free Freight
                  </span>
                </div>
              ) : (
                <div className="text-right">
                  <span className="text-[12px] font-medium text-gray-500">
                    Freight ₹500
                  </span>
                </div>
              )}
            </div>
            <div className="pt-2.5 grid grid-cols-2 gap-2 text-[12px]">
              <div className="text-gray-600">
                <span>GST (18% ITC Eligible):</span> <strong className="text-gray-900 font-semibold">{formatINR(gstAmount)}</strong>
              </div>
              <div className="text-right text-green-700 font-bold">
                <span>Retail Margin:</span> {formatINR(totalSavings > 0 ? totalSavings : Math.round(computedTotal * 0.4))}
              </div>
            </div>
          </div>

          {/* ── Wholesale Trust & Logistics Strip (Zero Emojis) ── */}
          <div className="grid grid-cols-3 gap-2 my-5">
            <div className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/70 flex flex-col items-center text-center">
              <Truck className="w-4 h-4 text-[#1A6FD4] mb-1" />
              <span className="text-[11.5px] font-bold text-gray-900 leading-tight">Fast Freight</span>
              <span className="text-[10px] text-gray-500 mt-0.5">Ships 24–48h</span>
            </div>
            <div className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/70 flex flex-col items-center text-center">
              <ShieldCheck className="w-4 h-4 text-[#1A6FD4] mb-1" />
              <span className="text-[11.5px] font-bold text-gray-900 leading-tight">Transit Insured</span>
              <span className="text-[10px] text-gray-500 mt-0.5">100% Inspected</span>
            </div>
            <div className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/70 flex flex-col items-center text-center">
              <FileText className="w-4 h-4 text-[#1A6FD4] mb-1" />
              <span className="text-[11.5px] font-bold text-gray-900 leading-tight">GST Invoice</span>
              <span className="text-[10px] text-gray-500 mt-0.5">Full ITC Credit</span>
            </div>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex gap-3 items-center">
            {cartItemQty > 0 ? (
              <div className="flex-1 h-[52px] rounded-xl border-[1.5px] border-[#1A6FD4] bg-[#F8FAFC] flex items-center justify-between px-3">
                <button
                  type="button"
                  onClick={() => {
                    if (cartItemQty <= 1) {
                      cart.removeItem(product.id);
                    } else {
                      cart.updateQty(product.id, cartItemQty - 1);
                    }
                  }}
                  className="w-12 h-full flex items-center justify-center text-xl font-bold text-[#1A6FD4] hover:bg-blue-100/50 rounded-lg active:scale-90 transition-all select-none"
                >
                  −
                </button>
                <span className="font-bold text-[#1A1A2E] text-base select-none">{cartItemQty} in Bag</span>
                <button
                  type="button"
                  onClick={() => {
                    cart.updateQty(product.id, cartItemQty + 1);
                  }}
                  className="w-12 h-full flex items-center justify-center text-xl font-bold text-[#1A6FD4] hover:bg-blue-100/50 rounded-lg active:scale-90 transition-all select-none"
                >
                  +
                </button>
              </div>
            ) : (
              <Button
                variant="secondary-cta"
                className="flex-1 h-[52px] rounded-xl text-[15.5px] font-semibold border-[1.5px] border-[#1A6FD4] bg-[#F8FAFC] text-[#1A6FD4] hover:bg-blue-50/70 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2.5 shadow-xs disabled:opacity-50"
                onClick={handleAddToCart}
                disabled={adding || stock.status === "out"}
              >
                {adding ? (
                  <Loader2 className="size-5 animate-spin text-[#1A6FD4]" />
                ) : (
                  <ShoppingCart className="size-5 text-[#1A6FD4]" />
                )}
                {adding ? "Adding..." : "Add to Bag"}
              </Button>
            )}

            <Button
              variant="cta"
              className="flex-1 h-[52px] rounded-xl text-[15.5px] font-semibold bg-[#1A6FD4] hover:bg-[#1558B0] active:scale-[0.98] text-white border-0 shadow-none hover:shadow-none transition-all duration-150 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:shadow-none"
              onClick={async () => {
                if (stock.status !== "out") {
                  await handleAddToCart();
                  router.push('/cart');
                }
              }}
              disabled={adding || stock.status === "out"}
            >
              <Zap className="size-5 fill-current" /> Buy Wholesale
            </Button>

            <Button
              variant="outline"
              className="size-[52px] shrink-0 rounded-xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/80 active:scale-[0.95] transition-all duration-150 flex items-center justify-center shadow-xs disabled:opacity-50"
              onClick={handleWishlistToggle}
              disabled={togglingWishlist}
              aria-label="Toggle wishlist"
            >
              {togglingWishlist ? (
                <Loader2 className="size-5 animate-spin text-gray-400" />
              ) : (
                <Heart
                  className="size-5 transition-transform group-hover/button:scale-110"
                  strokeWidth={1.8}
                  style={{ color: isSaved ? "#DC2626" : "#4B5563" }}
                  fill={isSaved ? "#DC2626" : "transparent"}
                />
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleShare}
              className="size-[52px] shrink-0 rounded-xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/80 active:scale-[0.95] transition-all duration-150 flex items-center justify-center shadow-xs"
              aria-label="Share product"
            >
              <Share2 className="size-5 text-gray-700 hover:text-gray-900 transition-colors" strokeWidth={1.8} />
            </Button>
          </div>

          {/* ── Wholesale Specifications Table ── */}
          <div className="mt-7 border-t border-gray-100 pt-5">
            <h2 className="font-bold text-[16px] text-gray-900 mb-3">
              Wholesale Specifications &amp; Quality
            </h2>
            <div className="rounded-xl border border-gray-200/90 overflow-hidden divide-y divide-gray-100 text-[12.5px] bg-white">
              <div className="grid grid-cols-2 p-2.5 bg-gray-50/50">
                <span className="text-gray-500 font-medium">Fabric / Material</span>
                <span className="text-gray-900 font-semibold">{product.tags?.find(t => t.toLowerCase().includes('cotton') || t.toLowerCase().includes('fabric')) || "100% Premium Combed Cotton"}</span>
              </div>
              <div className="grid grid-cols-2 p-2.5">
                <span className="text-gray-500 font-medium">Minimum Order (MOQ)</span>
                <span className="text-gray-900 font-semibold">{product.min_order_qty} {product.unit || "piece"}{product.min_order_qty > 1 ? "s" : ""}</span>
              </div>
              <div className="grid grid-cols-2 p-2.5 bg-gray-50/50">
                <span className="text-gray-500 font-medium">Packaging Format</span>
                <span className="text-gray-900 font-semibold">Master Poly-pack in Corrugated Carton</span>
              </div>
              <div className="grid grid-cols-2 p-2.5">
                <span className="text-gray-500 font-medium">HSN Code &amp; GST</span>
                <span className="text-gray-900 font-semibold">HSN 6203 • 18% GST (Tax Invoice Included)</span>
              </div>
              <div className="grid grid-cols-2 p-2.5 bg-gray-50/50">
                <span className="text-gray-500 font-medium">Country of Origin</span>
                <span className="text-gray-900 font-semibold">India</span>
              </div>
            </div>
          </div>
{/* Description */}
          <div className="mt-8 border-t pt-6" style={{ borderColor: t.border }}>
            <h2 className="font-display font-semibold text-[18px] sm:text-[20px] md:text-[22px] tracking-tight mb-3 text-[#1A1A2E]">Description</h2>
            {product.description ? (
              <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap" style={{ color: t.textSecondary }}>
                {descriptionLong && !descExpanded ? (
                  <>{product.description.slice(0, 150)}...</>
                ) : (
                  product.description
                )}
              </div>
            ) : null}
            {product.description && descriptionLong && (
              <button onClick={() => setDescExpanded(!descExpanded)}
                className="flex items-center gap-1 mt-2 text-sm font-semibold transition-colors hover:opacity-80"
                style={{ color: t.bluePrimary }}>
                {descExpanded ? <><ChevronUp className="w-4 h-4" /> Show less</> : <><ChevronDown className="w-4 h-4" /> Read more</>}
              </button>
            )}
            
            {/* Inline Categories */}
            {product.categories_details && product.categories_details.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {(() => {
                  const mainCat = product.categories_details.find(c => !c.parent_id);
                  const subCat = product.categories_details.find(c => c.parent_id);
                  return (
                    <>
                      {mainCat && (
                        <Link href={`/?category=${mainCat.slug}`} className="rounded-full px-3 py-1.5 text-xs md:text-sm font-medium transition-colors hover:bg-gray-200"
                          style={{ background: '#F1F5F9', color: '#475569' }}>
                          {mainCat.name}
                        </Link>
                      )}
                      {subCat && (
                        <Link href={`/?category=${subCat.slug}`} className="rounded-full px-3 py-1.5 text-xs md:text-sm font-medium transition-colors hover:bg-gray-200"
                          style={{ background: '#F1F5F9', color: '#475569' }}>
                          {subCat.name}
                        </Link>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════ MOBILE STICKY CTA BAR (<md) ══════════ */}
      <div className="md:hidden fixed bottom-[calc(56px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 bg-white/95 backdrop-blur-md rounded-t-2xl border-t border-x border-gray-100 shadow-[0_-6px_24px_rgba(0,0,0,0.06)]">
        <div className="px-4 py-2.5 flex gap-2.5 items-center w-full">
          <div className="shrink-0 pr-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total ({quantity} pcs)</span>
            <span className="text-[17px] font-black text-gray-900 leading-none">{formatINR(computedTotal)}</span>
          </div>
          {cartItemQty > 0 ? (
            <div className="flex-1 h-[48px] rounded-xl border-[1.5px] border-[#1A6FD4] bg-[#F8FAFC] flex items-center justify-between px-2">
              <button
                type="button"
                onClick={() => {
                  if (!product) return;
                  if (cartItemQty <= 1) {
                    cart.removeItem(product.id);
                  } else {
                    cart.updateQty(product.id, cartItemQty - 1);
                  }
                }}
                className="w-10 h-full flex items-center justify-center text-xl font-bold text-[#1A6FD4] hover:bg-blue-100/50 rounded-lg active:scale-90 transition-all select-none"
              >
                −
              </button>
              <span className="font-bold text-[#1A1A2E] text-sm select-none">{cartItemQty} in Bag</span>
              <button
                type="button"
                onClick={() => {
                  if (!product) return;
                  cart.updateQty(product.id, cartItemQty + 1);
                }}
                className="w-10 h-full flex items-center justify-center text-xl font-bold text-[#1A6FD4] hover:bg-blue-100/50 rounded-lg active:scale-90 transition-all select-none"
              >
                +
              </button>
            </div>
          ) : (
            <Button
              variant="secondary-cta"
              className="flex-1 h-[48px] rounded-xl text-[14px] font-bold border-[1.5px] border-[#1A6FD4] bg-[#F8FAFC] text-[#1A6FD4] hover:bg-blue-50/70 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
              onClick={handleAddToCart}
              disabled={adding || stock.status === "out"}
            >
              {adding ? (
                <Loader2 className="w-[18px] h-[18px] animate-spin text-[#1A6FD4]" />
              ) : (
                <ShoppingCart className="w-[18px] h-[18px] text-[#1A6FD4]" />
              )}
              {adding ? "Adding..." : "Add to Bag"}
            </Button>
          )}

          <Button
            variant="cta"
            className="flex-1 h-[48px] rounded-xl text-[14px] font-bold bg-[#1A6FD4] hover:bg-[#1558B0] active:scale-[0.98] text-white border-0 shadow-none transition-all duration-150 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:shadow-none"
            onClick={async () => {
              if (stock.status !== "out") {
                await handleAddToCart();
                router.push('/cart');
              }
            }}
            disabled={adding || stock.status === "out"}
          >
            <Zap className="w-[18px] h-[18px] fill-current" /> Buy Wholesale
          </Button>
        </div>
      </div>

      {/* ══════════ BOTTOM SECTIONS ══════════ */}
      <div className="max-w-7xl mx-auto w-full">
        {/* ══════════ REVIEWS ══════════ */}
        <div className="px-4 md:px-8 pb-6 mt-16">
          <ProductReviews productId={product.id} />
        </div>

        {/* ══════════ RECOMMENDATIONS ══════════ */}
        <ProductRail title="Similar Products" products={similarProducts} />

        {/* ══════════ RECENTLY VIEWED ══════════ */}
        <RecentlyViewed excludeId={product.id} />

        {/* ══════════ Q&A ══════════ */}
        <div className="px-4 md:px-8 pb-6">
          <ProductQA productId={product.id} />
        </div>

        {/* ══════════ CUSTOMERS ALSO BOUGHT ══════════ */}
        <ProductRail title="Customers Also Bought" products={alsoBoughtProducts} />
      </div>
    </div>
  );
}
