"use client";

import { Search, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-anga-border bg-white px-6">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-anga-text-secondary" />
        <input
          type="text"
          placeholder="Search products, orders, sellers..."
          className="h-10 w-full rounded-lg border border-anga-border bg-anga-bg pl-10 pr-4 text-sm text-anga-text placeholder:text-anga-text-secondary/60 focus:border-[#6C47FF] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/20 transition-colors"
        />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3 ml-4">
        {/* Notification bell */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-anga-border text-anga-text-secondary hover:bg-anga-bg hover:text-anga-text transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white">
            3
          </span>
        </button>

        {/* New Product CTA */}
        <Button className="bg-[#6C47FF] hover:bg-[#5835DB] text-white gap-1.5 h-10 px-4 rounded-lg shadow-sm">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Product</span>
        </Button>
      </div>
    </header>
  );
}
