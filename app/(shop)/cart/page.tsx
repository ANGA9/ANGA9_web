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
  Ticket,
  Loader2,
  Smartphone,
  CreditCard,
  Banknote,
  Check,
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

function formatINR(value: number) {
  return "\u20B9" + value.toLocaleString("en-IN");
}

export default function CustomerCartPage() {
  const { items, loading, updateQty, removeItem, refreshCart } = useCart();
  const { user } = useAuth();
  const { open: openLoginSheet } = useLoginSheet();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponState, setCouponState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [updatingQty, setUpdatingQty] = useState<Set<string>>(new Set());
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

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    setCouponState("loading");
    setTimeout(() => {
      if (couponCode.toUpperCase() === "ANGA9") {
        setCouponState("success");
      } else {
        setCouponState("error");
      }
    }, 800);
  };

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const subtotal = items.reduce(
    (sum, item) => sum + (item.sale_price ?? item.base_price) * item.qty,
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

  const handleUpdateQty = async (productId: string, currentQty: number, delta: number, minOrderQty: number = 1) => {
    const newQty = Math.max(minOrderQty, currentQty + delta);
    if (newQty !== currentQty) {
      setUpdatingQty(prev => new Set(prev).add(productId));
      await updateQty(productId, newQty);
      setUpdatingQty(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: t.bluePrimary }} />
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
                              {disc}% off
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
                          disabled={item.qty <= (item.min_order_qty || 1) || updatingQty.has(item.productId)}
                          className="w-11 h-11 flex items-center justify-center transition-colors hover:bg-white active:bg-gray-100 text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <div className="w-11 h-11 flex items-center justify-center font-bold text-gray-900 bg-white text-[15px] border-x border-gray-100">
                          {updatingQty.has(item.productId) ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : item.qty}
                        </div>
                        <button
                          onClick={() => handleUpdateQty(item.productId, item.qty, 1)}
                          disabled={updatingQty.has(item.productId)}
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

            <div className="mt-4 px-4 md:px-0">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <Ticket className="w-5 h-5 text-[#1A6FD4]" />
                  <span className="text-[14px] font-bold text-gray-900 uppercase tracking-wide">Apply Coupon</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 h-10">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value); setCouponState("idle"); }}
                      placeholder="Enter Coupon Code"
                      className={`flex-1 bg-white border rounded-lg px-4 text-sm focus:outline-none transition-colors ${couponState === 'error' ? 'border-red-500' : couponState === 'success' ? 'border-green-500' : 'border-gray-200 focus:border-[#1A6FD4]'}`}
                      disabled={couponState === "loading" || couponState === "success"}
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      disabled={couponState === "loading" || couponState === "success" || !couponCode.trim()}
                      className="px-6 bg-white border border-[#1A6FD4] text-[#1A6FD4] text-sm font-bold rounded-lg active:scale-95 transition-all hover:bg-blue-50 disabled:opacity-50"
                    >
                      {couponState === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : couponState === "success" ? <Check className="w-4 h-4" /> : "Apply"}
                    </button>
                  </div>
                  {couponState === "error" && <p className="text-[12px] text-red-500 font-medium ml-1">Invalid coupon code</p>}
                  {couponState === "success" && <p className="text-[12px] text-green-600 font-medium ml-1">Coupon applied successfully!</p>}
                </div>
              </div>
            </div>

            <div className="mt-4 mb-4 px-4 md:px-0">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="text-[15px] font-black text-gray-900 mb-4 uppercase tracking-wider">
                  Price Details
                </h3>
                <div className="space-y-3 text-[15px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Subtotal ({items.length} items)</span>
                    <span className="text-gray-900 font-bold">{formatINR(totalOriginal)}</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Discount</span>
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
            <div className="fixed bottom-[calc(60px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom duration-500">

              <div className="px-4 py-3 flex gap-4 items-center">
                <div className="hidden xs:flex flex-col">
                  <span className="text-[18px] font-black text-gray-900 leading-none">{formatINR(total)}</span>
                  <span className="text-[12px] font-bold text-[#1A6FD4] mt-0.5">VIEW DETAILS</span>
                </div>
                
                <button
                  disabled={isPlacingOrder}
                  onClick={handleProceedToCheckout}
                  className="flex-1 h-[52px] bg-[#4338CA] text-white rounded-xl text-[18px] font-black flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-70 shadow-lg shadow-indigo-200"
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
                        disabled={item.qty <= (item.min_order_qty || 1) || updatingQty.has(item.productId)}
                        className="flex h-11 w-11 items-center justify-center transition-colors hover:bg-white active:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <Minus className="h-4 w-4 text-gray-600" />
                      </button>
                      <span
                        className="flex h-11 w-12 items-center justify-center text-[15px] font-black bg-white border-x border-gray-100"
                        style={{ color: t.textPrimary }}
                      >
                        {updatingQty.has(item.productId) ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : item.qty}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(item.productId, item.qty, 1)}
                        disabled={updatingQty.has(item.productId)}
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
      </div>
    </div>
  );
}
