"use client";

import { useEffect, useState } from "react";
import {
  Minus,
  Plus,
  Trash2,
  PackageOpen,
  ShoppingBag,
  ArrowLeft,
  Tag,
  Truck,
  ShieldCheck,
  ChevronRight,
  Loader2,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { useLoginSheet } from "@/lib/LoginSheetContext";
import CartSummary from "@/components/customer/CartSummary";
import EmptyState from "@/components/shared/EmptyState";
import toast from "react-hot-toast";
import { recommendationsApi } from "@/lib/recommendationsApi";
import ProductRail from "@/components/customer/ProductRail";
import type { Product } from "@/components/customer/ProductCard";

function formatINR(value: number) {
  return "\u20B9" + value.toLocaleString("en-IN");
}

export default function CustomerCartPage() {
  const { items, loading, updateQty, removeItem, refreshCart } = useCart();
  const { user } = useAuth();
  const { open: openLoginSheet } = useLoginSheet();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [alsoBoughtProducts, setAlsoBoughtProducts] = useState<Product[]>([]);
  const router = useRouter();

  const handleProceedToCheckout = () => {
    if (!user) {
      toast("Please login to place your order", { icon: <Lock size={18} color="#1A6FD4" /> });
      openLoginSheet();
      return;
    }
    setIsPlacingOrder(true);
    setTimeout(() => router.push("/checkout"), 800);
  };

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const primaryCartItem = items[0]?.productId;
  useEffect(() => {
    if (primaryCartItem) {
      recommendationsApi.getAlsoBought(primaryCartItem).then(setAlsoBoughtProducts);
    } else {
      setAlsoBoughtProducts([]);
    }
  }, [primaryCartItem]);

  const subtotal = items.reduce(
    (sum, item) => sum + (item.effective_price ?? item.sale_price ?? item.base_price) * item.qty,
    0
  );
  const totalOriginal = items.reduce(
    (sum, item) => sum + item.base_price * item.qty,
    0
  );
  const totalSavings = totalOriginal - subtotal;
  const gst = Math.round(subtotal * 0.18);
  const delivery = subtotal > 10000 ? 0 : 500;
  const total = subtotal + gst + delivery;

  // Optimistic: updateQty mutates local state synchronously (CartContext),
  // so the new qty paints on the very next frame — no lock, no spinner.
  // Rapid taps each fire their own background PATCH; the context's per-item
  // sequence counter ignores stale failures.
  const handleUpdateQty = (productId: string, currentQty: number, delta: number, minOrderQty: number = 1) => {
    const newQty = Math.max(minOrderQty, currentQty + delta);
    if (newQty !== currentQty) {
      void updateQty(productId, newQty);
    }
  };

  const handleRemove = async (productId: string) => {
    setRemovingItems(prev => new Set(prev).add(productId));
    await removeItem(productId);
    setRemovingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  if (loading && items.length === 0) {
    return (
      <div className="w-full relative bg-white min-h-screen">
        {/* ══════════ MOBILE SKELETON ══════════ */}
        <div className="block md:hidden pb-32">
          <header className="flex items-center px-4 h-14 bg-white border-b border-gray-100 sticky top-0 z-40">
            <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse mr-3" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </header>
          <div className="flex flex-col gap-2 mt-2 px-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 relative pt-10">
                <div className="flex gap-4">
                  <div className="w-[90px] h-[90px] rounded-xl bg-gray-200 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-1/3 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse mt-3" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                  <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse" />
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 px-4">
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-3">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="flex justify-between"><div className="h-3 w-24 bg-gray-100 rounded animate-pulse"/><div className="h-3 w-16 bg-gray-100 rounded animate-pulse"/></div>
              <div className="flex justify-between"><div className="h-3 w-20 bg-gray-100 rounded animate-pulse"/><div className="h-3 w-12 bg-gray-100 rounded animate-pulse"/></div>
              <div className="border-t border-gray-200 pt-3 mt-2 flex justify-between items-center">
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"/><div className="h-6 w-24 bg-gray-200 rounded animate-pulse"/>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ DESKTOP SKELETON ══════════ */}
        <div className="hidden md:block mx-auto max-w-[1280px] px-8 py-10">
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-12 xl:col-span-8 space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="flex items-center gap-6 rounded-xl border border-gray-200 p-5 bg-white shadow-sm">
                  <div className="h-24 w-24 rounded-xl bg-gray-200 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-1/4 bg-gray-100 rounded animate-pulse" />
                  </div>
                  <div className="w-24 shrink-0"><div className="h-6 w-16 bg-gray-200 rounded animate-pulse" /></div>
                  <div className="w-32 h-11 bg-gray-200 rounded-xl animate-pulse shrink-0" />
                  <div className="w-28 shrink-0 flex justify-end"><div className="h-6 w-20 bg-gray-200 rounded animate-pulse" /></div>
                </div>
              ))}
            </div>
            <div className="col-span-12 xl:col-span-4">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-4">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="flex justify-between"><div className="h-4 w-24 bg-gray-100 rounded animate-pulse"/><div className="h-4 w-16 bg-gray-100 rounded animate-pulse"/></div>
                <div className="flex justify-between"><div className="h-4 w-20 bg-gray-100 rounded animate-pulse"/><div className="h-4 w-12 bg-gray-100 rounded animate-pulse"/></div>
                <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between items-center">
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"/><div className="h-7 w-28 bg-gray-200 rounded animate-pulse"/>
                </div>
                <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse mt-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative bg-white">
      {/* ══════════ MOBILE VIEW ══════════ */}
      <div className="block md:hidden min-h-screen pb-32">
        {/* Header */}
        <header className="flex items-center px-4 h-14 bg-white border-b border-gray-100 sticky top-0 z-40">
          <Link href="/" className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </Link>
          <h1 className="text-[17px] font-medium text-gray-900 leading-tight">
            Shopping Bag
          </h1>
        </header>

        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your bag is empty"
            description="There is nothing in your bag. Let's add some items."
            actionLabel="Shop Now"
            onAction={() => router.push("/")}
            accentColor={t.primaryCta}
          />
        ) : (
          <>
            {totalSavings > 0 && (
              <div
                className="px-4 py-2.5 flex items-center gap-2 animate-in slide-in-from-top duration-300"
                style={{ background: "#E8F5E9" }}
              >
                <Tag className="w-4 h-4 text-[#2E7D32]" />
                <span className="text-[13px] font-bold text-[#2E7D32]">
                  Yay! You&apos;re saving {formatINR(totalSavings)} on this order!
                </span>
              </div>
            )}

            <div className="flex flex-col gap-2 mt-2 px-4 md:px-0">
              {items.map((item) => {
                const price = item.sale_price ?? item.base_price;
                const disc = item.base_price > price
                  ? Math.round(((item.base_price - price) / item.base_price) * 100)
                  : 0;
                return (
                  <div key={item.productId} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 relative group pt-10">
                    {/* Remove Element (Top Right) */}
                    <button
                      onClick={() => handleRemove(item.productId)}
                      disabled={removingItems.has(item.productId)}
                      className="absolute top-4 right-4 flex items-center gap-1.5 text-[13px] font-bold text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      {removingItems.has(item.productId) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      <span>Remove</span>
                    </button>

                    <div className="flex gap-4">
                      {/* Product Image */}
                      <Link href={`/products/${item.productId}`} className="shrink-0">
                        <div
                          className="w-[90px] h-[90px] rounded-xl flex items-center justify-center overflow-hidden border border-gray-50"
                          style={{ background: "#F8FBFF" }}
                        >
                          {item.images?.[0] ? (
                            <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <PackageOpen className="w-8 h-8" style={{ color: t.bluePrimary }} />
                          )}
                        </div>
                      </Link>

                      <div className="flex-1 min-w-0 pr-2">
                        <Link href={`/products/${item.productId}`}>
                          <h3 className="text-[15px] font-bold text-gray-900 leading-snug line-clamp-2 hover:underline">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-[12px] text-gray-500 mt-0.5 font-medium">{item.unit || 'Unit pack'}</p>
                        {disc > 0 && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[12px] text-gray-400 line-through font-medium">
                              {formatINR(item.base_price)}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-green-700 bg-green-50 text-[11px] font-bold">
                              {disc}% below MRP
                            </span>
                          </div>
                        )}
                        
                        {/* Delivery Info */}
                        <div className="flex items-center gap-1.5 mt-2">
                          <Truck className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-[12px] text-gray-600 font-medium">
                            {delivery === 0 ? (
                              <>Free Delivery by <span className="font-bold text-gray-900">Thu, May 2</span></>
                            ) : (
                              "Standard Delivery"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                      {/* Individual Price */}
                      <div>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Price</p>
                        <span className="text-[16px] font-black text-gray-900">{formatINR(price)}</span>
                      </div>
                      {/* Qty Selector */}
                      <div className="flex items-center rounded-xl overflow-hidden border border-gray-200 bg-gray-50/30">
                        <button
                          onClick={() => handleUpdateQty(item.productId, item.qty, -1, item.min_order_qty)}
                          disabled={item.qty <= (item.min_order_qty || 1)}
                          className="w-11 h-11 flex items-center justify-center transition-colors hover:bg-white active:bg-gray-100 text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <div className="w-11 h-11 flex items-center justify-center font-bold text-gray-900 bg-white text-[15px] border-x border-gray-100">
                          {item.qty}
                        </div>
                        <button
                          onClick={() => handleUpdateQty(item.productId, item.qty, 1)}
                          className="w-11 h-11 flex items-center justify-center transition-colors hover:bg-white active:bg-gray-100 text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-[12px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Item Total</p>
                        <p className="text-[18px] font-black text-gray-900">
                          {formatINR(price * item.qty)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>




            <div className="mt-4 mb-4 px-4 md:px-0">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="text-[15px] font-black text-gray-900 mb-4 uppercase tracking-wider">
                  Price Details
                </h3>
                <div className="space-y-3 text-[15px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">MRP Total ({items.length} items)</span>
                    <span className="text-gray-900 font-bold">{formatINR(totalOriginal)}</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Savings vs MRP</span>
                      <span className="text-green-600 font-bold">
                        − {formatINR(totalSavings)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">GST (18%)</span>
                    <span className="text-gray-900 font-bold">{formatINR(gst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Delivery Charges</span>
                    {delivery === 0 ? (
                      <span className="text-green-600 font-bold">FREE</span>
                    ) : (
                      <span className="text-gray-900 font-bold">{formatINR(delivery)}</span>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-300 pt-4 mt-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[17px] font-black text-gray-900">Total Amount</span>
                      <span className="text-[22px] font-black text-gray-900 leading-none tracking-tight">
                        {formatINR(total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Cross-sell Rail */}
            {alsoBoughtProducts.length > 0 && (
              <ProductRail title="You may also need" products={alsoBoughtProducts} compact />
            )}

            <div className="bg-white mt-4 pb-12 px-4 md:px-0">
              <div className="flex flex-col items-center gap-4 py-8 border-t border-gray-100">
                <div className="flex items-center gap-6 opacity-40">
                  <ShieldCheck className="w-6 h-6" />
                  <Truck className="w-6 h-6" />
                  <Tag className="w-6 h-6" />
                </div>
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider text-center">
                  100% Secure Payments • Free Easy Returns
                </p>
              </div>
            </div>

            {/* Sticky Bottom Order Bar (Positioned above MobileBottomNav) */}
            <div className="fixed bottom-[calc(60px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 bg-white border-t border-gray-100 animate-in slide-in-from-bottom duration-500">

              <div className="px-4 py-3 flex gap-4 items-center">
                <div className="hidden xs:flex flex-col">
                  <span className="text-[18px] font-black text-gray-900 leading-none">{formatINR(total)}</span>
                  <span className="text-[12px] font-bold text-[#1A6FD4] mt-0.5">VIEW DETAILS</span>
                </div>
                
                <button
                  disabled={isPlacingOrder}
                  onClick={handleProceedToCheckout}
                  className="flex-1 h-[52px] bg-[#4338CA] text-white rounded-xl text-[18px] font-black flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-70"
                >
                  {isPlacingOrder ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <span>Place Order</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ══════════ DESKTOP VIEW ══════════ */}
      <div className="hidden md:block mx-auto max-w-[1280px] px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-baseline gap-3">
            <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">
              Shopping Bag
            </h1>
            <span className="text-[18px] font-bold text-gray-400">
              ({items.length} {items.length === 1 ? "Item" : "Items"})
            </span>
          </div>
          <Link href="/" className="text-sm font-bold text-[#1A6FD4] hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>
 
        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your bag is empty"
            description="Time to start shopping and fill it with wonderful things!"
            actionLabel="Start Shopping"
            onAction={() => router.push("/")}
            accentColor={t.primaryCta}
          />
        ) : (
          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-12 xl:col-span-8 space-y-4">
              {items.map((item) => {
                const price = item.sale_price ?? item.base_price;
                const disc = item.base_price > price
                  ? Math.round(((item.base_price - price) / item.base_price) * 100)
                  : 0;
                return (
                  <div
                    key={item.productId}
                    className="flex items-center gap-6 rounded-xl border p-5 bg-white shadow-sm hover:shadow-md transition-shadow relative group"
                    style={{ borderColor: t.border }}
                  >
                    <Link href={`/products/${item.productId}`} className="shrink-0">
                      <div
                        className="flex h-24 w-24 items-center justify-center rounded-xl overflow-hidden border border-gray-50"
                        style={{ background: t.bgBlueTint }}
                      >
                        {item.images?.[0] ? (
                          <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                        ) : (
                          <PackageOpen className="h-8 w-8" style={{ color: t.bluePrimary }} />
                        )}
                      </div>
                    </Link>
   
                    <div className="flex-1 min-w-0 pr-2">
                      <Link href={`/products/${item.productId}`}>
                        <h3 className="text-[17px] font-bold text-gray-900 truncate hover:underline">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-[13px] font-medium text-gray-500 mt-1 uppercase tracking-wider">
                        {item.unit || 'Unit pack'}
                      </p>
                    </div>
   
                    {/* Individual Price */}
                    <div className="shrink-0 text-left w-24">
                      <span className="text-[18px] font-black text-gray-900 block">
                        {formatINR(price)}
                      </span>
                      {disc > 0 && (
                        <span className="text-[13px] text-gray-400 line-through font-medium">
                          {formatINR(item.base_price)}
                        </span>
                      )}
                    </div>
   
                    <div className="flex items-center rounded-xl overflow-hidden border border-gray-200 bg-gray-50/30 shrink-0">
                      <button
                        onClick={() => handleUpdateQty(item.productId, item.qty, -1, item.min_order_qty)}
                        disabled={item.qty <= (item.min_order_qty || 1)}
                        className="flex h-11 w-11 items-center justify-center transition-colors hover:bg-white active:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <Minus className="h-4 w-4 text-gray-600" />
                      </button>
                      <span
                        className="flex h-11 w-12 items-center justify-center text-[15px] font-black bg-white border-x border-gray-100"
                        style={{ color: t.textPrimary }}
                      >
                        {item.qty}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(item.productId, item.qty, 1)}
                        className="flex h-11 w-11 items-center justify-center transition-colors hover:bg-white active:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <Plus className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
   
                    <p className="text-[20px] font-black shrink-0 w-28 text-right" style={{ color: t.textPrimary }}>
                      {formatINR(price * item.qty)}
                    </p>
  
                    {/* Remove Element (Top Right) */}
                    <button
                      onClick={() => handleRemove(item.productId)}
                      disabled={removingItems.has(item.productId)}
                      className="absolute top-4 right-5 flex items-center gap-1.5 text-[13px] font-bold text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      {removingItems.has(item.productId) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      <span>Remove</span>
                    </button>
                  </div>
                );
              })}
            </div>
   
            <div className="col-span-12 xl:col-span-4">
              <CartSummary subtotal={subtotal} />
            </div>
          </div>
        )}
        
        {/* Desktop Cross-sell Rail */}
        {items.length > 0 && alsoBoughtProducts.length > 0 && (
          <div className="mt-8">
            <ProductRail title="You may also need" products={alsoBoughtProducts} />
          </div>
        )}
      </div>
    </div>
  );
}
