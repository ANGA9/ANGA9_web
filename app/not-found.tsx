"use client";

import Link from "next/link";
import { FileQuestion } from "lucide-react";
import CustomerTopNav from "@/components/customer/CustomerTopNav";
import CategoryStrip from "@/components/customer/CategoryStrip";
import MobileTopHeader from "@/components/customer/MobileTopHeader";
import MobileBottomNav from "@/components/customer/MobileBottomNav";
import { LoginSheetProvider } from "@/lib/LoginSheetContext";
import { CartProvider } from "@/lib/CartContext";
import { WishlistProvider } from "@/lib/WishlistContext";
import LoginSheet from "@/components/customer/LoginSheet";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";

export default function NotFound() {
  return (
    <LoginSheetProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="min-h-screen flex flex-col" style={{ background: t.bgPage }}>
            {/* ══════════ DESKTOP NAV (md+) ══════════ */}
            <div className="hidden md:block">
              <CustomerTopNav />
              <CategoryStrip />
            </div>

            {/* ══════════ MOBILE NAV (<md) ══════════ */}
            <div className="block md:hidden sticky top-0 z-40">
              <MobileTopHeader />
            </div>

            {/* ══════════ 404 CONTENT ══════════ */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="max-w-md w-full bg-white rounded-[24px] shadow-sm border border-gray-100 p-10 md:p-12">
                <div className="mx-auto w-20 h-20 bg-[#F0F5FF] rounded-2xl flex items-center justify-center mb-8 border border-[#DBEAFE] shadow-sm">
                  <FileQuestion className="w-10 h-10 text-[#1A6FD4]" strokeWidth={1.5} />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                  Page Not Found
                </h1>
                <p className="text-gray-500 mb-8 leading-relaxed text-sm md:text-base">
                  The page you are looking for doesn't exist or has been moved. Let's get you back to the marketplace.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold text-white bg-[#1A6FD4] rounded-xl hover:bg-[#155ab0] transition-colors shadow-sm w-full"
                >
                  Back to Home
                </Link>
              </div>
            </main>

            {/* ══════════ MOBILE BOTTOM NAV (<md) ══════════ */}
            <MobileBottomNav />

            {/* ══════════ MOBILE LOGIN SHEET ══════════ */}
            <LoginSheet />
          </div>
        </WishlistProvider>
      </CartProvider>
    </LoginSheetProvider>
  );
}
