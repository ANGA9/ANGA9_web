"use client";

import { Search, Bell, Store } from "lucide-react";

export default function SellerHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-seller-border bg-white px-6">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-anga-text-secondary" />
        <input
          type="text"
          placeholder="Search products, orders..."
          className="h-10 w-full rounded-lg border border-seller-border bg-seller-bg pl-10 pr-4 text-sm text-anga-text placeholder:text-anga-text-secondary/60 focus:border-[#1A6FD4] focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/20 transition-colors"
        />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3 ml-4">
        {/* Notification bell */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-seller-border text-anga-text-secondary hover:bg-seller-bg hover:text-anga-text transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white">
            4
          </span>
        </button>

        {/* View Store */}
        <button className="flex h-10 items-center gap-1.5 rounded-lg bg-[#1A6FD4] px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1560B8]">
          <Store className="h-4 w-4" />
          <span className="hidden sm:inline">View Store</span>
        </button>
      </div>
    </header>
  );
}
