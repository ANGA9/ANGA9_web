"use client";

import Link from "next/link";
import { Search, Bell, ShoppingCart, Menu, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

export default function CustomerTopNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-anga-border bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden text-anga-text-secondary hover:text-anga-text"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {/* Logo */}
        <Link href="/customer" className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6C47FF] text-white font-bold text-sm">
            A
          </div>
          <span className="text-lg font-bold text-anga-text tracking-tight hidden sm:block">
            ANGA
          </span>
        </Link>

        {/* Search bar */}
        <div className="relative flex-1 max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-anga-text-secondary" />
          <input
            type="text"
            placeholder="Search products, categories, sellers..."
            className="h-10 w-full rounded-full border border-anga-border bg-anga-bg pl-11 pr-4 text-sm text-anga-text placeholder:text-anga-text-secondary/60 focus:border-[#6C47FF] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/20 transition-colors"
          />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Notifications */}
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-anga-text-secondary hover:bg-anga-bg hover:text-anga-text transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[9px] font-bold text-white">
              2
            </span>
          </button>

          {/* Cart */}
          <Link
            href="/customer/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-anga-text-secondary hover:bg-anga-bg hover:text-anga-text transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#6C47FF] text-[9px] font-bold text-white">
              3
            </span>
          </Link>

          {/* Avatar */}
          <Link href="/customer/account">
            <Avatar className="h-9 w-9 cursor-pointer">
              <AvatarFallback className="bg-[#6C47FF]/10 text-[#6C47FF] font-semibold text-sm">
                MP
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-anga-border bg-white px-4 py-3 space-y-1">
          {[
            { label: "Shop", href: "/customer" },
            { label: "My Orders", href: "/customer/orders" },
            { label: "Saved Items", href: "/customer/wishlist" },
            { label: "My Account", href: "/customer/account" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-anga-text-secondary hover:bg-anga-bg hover:text-anga-text transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
