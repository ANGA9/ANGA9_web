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
  const hasOwnMobileHeader = isCheckout || isWishlist || isCart || isNotifications || isProductDetail || isOrders || isAccount;

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
              <CategoryStrip />
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
              className={`mx-auto ${isCheckout ? "pb-0" : "pb-20 md:pb-0"}`}
              style={{ maxWidth: 1400 }}
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
