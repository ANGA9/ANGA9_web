"use client";

import { useEffect, useState } from "react";
import { Bell, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
      <div>
        <h1 className="text-lg font-semibold text-anga-text">Dashboard</h1>
        <p className="text-xs text-anga-text-secondary">Welcome back, Admin</p>
      </div>

      <div className="flex items-center gap-3">
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
