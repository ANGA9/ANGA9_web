"use client";

import CustomerTopNav from "@/components/customer/CustomerTopNav";
import CategoryStrip from "@/components/customer/CategoryStrip";
import MobileTopHeader from "@/components/customer/MobileTopHeader";
import MobileBottomNav from "@/components/customer/MobileBottomNav";
import LoginSheet from "@/components/customer/LoginSheet";
import { LoginSheetProvider } from "@/lib/LoginSheetContext";
import { CartProvider } from "@/lib/CartContext";
import { WishlistProvider } from "@/lib/WishlistContext";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import ChatWidget from "@/components/chatbot/ChatWidget";
import { useAuth } from "@/lib/AuthContext";
import { useState } from "react";

export default function CustomerShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showBanner, setShowBanner] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const isCheckout = pathname === "/checkout";
  const isWishlist = pathname === "/wishlist";
  const isCart = pathname === "/cart";
  const isNotifications = pathname === "/notifications";
  const isProductDetail = pathname?.startsWith("/products/");
  const isOrders = pathname === "/orders";
  const isAccount = pathname === "/account" || pathname?.startsWith("/account/");
  const isMenu = pathname === "/menu";
  const isSearchExplore = pathname === "/search/explore";
  const isSearch = pathname === "/search";
  const isHomepage = pathname === "/";
  const isHelp = pathname?.startsWith("/help");
  const hasOwnMobileHeader = isCheckout || isWishlist || isCart || isNotifications || isProductDetail || isOrders || isAccount || isMenu || isSearchExplore || isSearch || isHelp;

  return (
    <LoginSheetProvider>
      <CartProvider>
        <WishlistProvider>
          <div className={`${isMenu ? 'h-[100dvh] overflow-hidden' : 'min-h-[100dvh]'} flex flex-col`} style={{ background: t.bgPage }}>

            {/* ══════════ WCAG 2.4.1: Skip to content ══════════ */}
            <a href="#main-content" className="skip-to-content">
              Skip to main content
            </a>

            {/* ══════════ GLOBAL ANNOUNCEMENT BANNER ══════════ */}
            {showBanner && (
              <>
                <style dangerouslySetInnerHTML={{ __html: `
                  @keyframes marquee {
                    0% { transform: translateX(100vw); }
                    100% { transform: translateX(-100%); }
                  }
                  .animate-marquee {
                    display: inline-block;
                    white-space: nowrap;
                    animation: marquee 20s linear infinite;
                    will-change: transform;
                  }
                `}} />
                <div className="shrink-0 bg-gradient-to-r from-[#8B5CF6] to-[#1A6FD4] text-white overflow-hidden py-2.5 relative z-[60] shadow-sm flex items-center pr-10">
                  <div className="animate-marquee font-black tracking-wide text-[14px] uppercase flex items-center gap-4 flex-1">
                    <span>🚀 This app will be launched on 16th July! Get ready! 🚀</span>
                    <span className="opacity-50">•</span>
                    <span>🚀 This app will be launched on 16th July! Get ready! 🚀</span>
                    <span className="opacity-50">•</span>
                    <span>🚀 This app will be launched on 16th July! Get ready! 🚀</span>
                  </div>
                  <button 
                    onClick={() => setShowBanner(false)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
                    aria-label="Dismiss banner"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </>
            )}

            {/* ══════════ DESKTOP NAV (md+) ══════════ */}
            <div className="hidden md:block">
              <CustomerTopNav />
              {isHomepage ? (
                <CategoryStrip />
              ) : (
                <div className="border-b bg-white" style={{ borderColor: t.border }}>
                  <div className="mx-auto flex h-11 items-center" style={{ maxWidth: 1400, padding: "0 48px" }}>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 font-medium text-gray-500 hover:text-[#1A6FD4] transition-colors"
                      style={{ fontSize: '16px' }}
                    >
                      <ArrowLeft style={{ width: 18, height: 18 }} />
                      Back to Home
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* ══════════ MOBILE NAV (<md) ══════════ */}
            {!hasOwnMobileHeader && (
              <div className="block md:hidden sticky top-0 z-40">
                <MobileTopHeader />
              </div>
            )}

            {/* ══════════ PAGE CONTENT ══════════ */}
            <main
              id="main-content"
              className={`${isMenu ? 'flex-1 flex flex-col min-h-0' : 'flex-1 mx-auto'} ${isCheckout || isMenu ? "pb-0" : "pb-20 md:pb-0"}`}
              style={{ width: "100%", ...(isMenu ? {} : { maxWidth: 1400 }) }}
            >
              {children}
            </main>

            {/* ══════════ MOBILE BOTTOM NAV (<md) ══════════ */}
            {!isCheckout && <MobileBottomNav />}

            {/* ══════════ CHAT WIDGET — logged-in users only ══════════ */}
            {isHomepage && !authLoading && user && (
              <div className="block">
                <ChatWidget surface="customer" />
              </div>
            )}

            {/* ══════════ MOBILE LOGIN SHEET ══════════ */}
            <LoginSheet />
          </div>
        </WishlistProvider>
      </CartProvider>
    </LoginSheetProvider>
  );
}
