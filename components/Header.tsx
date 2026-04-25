"use client";

import { useEffect, useState } from "react";
import { Search, Bell, Plus, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function Header() {
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get<{ pendingProducts?: number }>("/api/users/admin-stats", { silent: true });
        setPendingCount(res?.pendingProducts ?? 0);
      } catch { /* ignore - admin stats may not be available */ }
    }
    fetchStats();
  }, []);

  function handleLogout() {
    document.cookie = "portal=; path=/; max-age=0";
    router.push("/admin/login");
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-anga-border bg-white px-6">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-anga-text-secondary" />
        <input
          type="text"
          placeholder="Search products, orders, sellers..."
          className="h-10 w-full rounded-lg border border-anga-border bg-anga-bg pl-10 pr-4 text-sm text-anga-text placeholder:text-anga-text-secondary/60 focus:border-[#1A6FD4] focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/10 transition-colors"
        />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3 ml-4">
        {/* Notification bell — links to reviews page */}
        <Link
          href="/admin/reviews"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-anga-border text-anga-text-secondary hover:bg-anga-bg hover:text-anga-text transition-colors"
        >
          <Bell className="h-5 w-5" />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF4D4D] text-xs md:text-sm font-bold text-white">
              {pendingCount > 99 ? "99+" : pendingCount}
            </span>
          )}
        </Link>

        {/* New Product CTA */}
        <Button className="bg-[#1A6FD4] hover:bg-[#155bb5] text-white gap-1.5 h-10 px-4 rounded-lg shadow-sm">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Product</span>
        </Button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-anga-border text-anga-text-secondary hover:bg-[#FEF2F2] hover:text-[#EF4444] transition-colors"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
