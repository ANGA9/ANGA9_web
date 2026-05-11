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
import { ArrowLeft } from "lucide-react";

export default function CustomerShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isCheckout = pathname === "/checkout";
  const isWishlist = pathname === "/wishlist";
  const isCart = pathname === "/cart";
  const isNotifications = pathname === "/notifications";
  const isProductDetail = pathname?.startsWith("/products/");
  const isOrders = pathname === "/orders";
  const isAccount = pathname === "/account";
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
          <div className="min-h-screen" style={{ background: t.bgPage }}>

            {/* ══════════ WCAG 2.4.1: Skip to content ══════════ */}
            <a href="#main-content" className="skip-to-content">
              Skip to main content
            </a>

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
              className={`${isMenu ? '' : 'mx-auto'} ${isCheckout || isMenu ? "pb-0" : "pb-20 md:pb-0"}`}
              style={isMenu ? undefined : { maxWidth: 1400 }}
            >
              {children}
            </main>

            {/* ══════════ MOBILE BOTTOM NAV (<md) ══════════ */}
            {!isCheckout && <MobileBottomNav />}

            {/* ══════════ MOBILE LOGIN SHEET ══════════ */}
            <LoginSheet />
          </div>
        </WishlistProvider>
      </CartProvider>
    </LoginSheetProvider>
  );
}
