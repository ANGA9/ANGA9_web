"use client";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

import { useEffect, useState } from "react";
import {
  IndianRupee,
  ShoppingCart,
  Store,
  Package,
  ClipboardCheck,
} from "lucide-react";
import StatsCard from "@/components/StatsCard";
import RevenueChart from "@/components/RevenueChart";
import OrderStatusChart from "@/components/OrderStatusChart";
import RecentOrdersTable from "@/components/RecentOrdersTable";
import TopSellersList from "@/components/TopSellersList";
import CategoryChart from "@/components/CategoryChart";
import { api } from "@/lib/api";

function formatCount(n: number): string {
  return n.toLocaleString("en-IN");
}

function formatCurrency(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

interface StatsData {
  title: string;
  value: string;
  badges: Array<{ text: string; label: string; type: "positive" | "negative" }>;
  icon: typeof Package;
  iconColor: string;
  iconBg: string;
}

export default function DashboardPage() {
  const [adminLevel, setAdminLevel] = useState<string>("super_admin");
  const [stats, setStats] = useState<StatsData[]>([]);

  useEffect(() => {
    const level = getCookie("admin_level") || "super_admin";
    setAdminLevel(level);
    
    // Initial loading state
    const initialStats: StatsData[] = [];
    if (level === "super_admin") {
      initialStats.push(
        { title: "Total Revenue", value: "₹0", badges: [{ text: "", label: "loading", type: "positive" }], icon: IndianRupee, iconColor: "#1A6FD4", iconBg: "#EAF2FF" },
        { title: "Total Sales", value: "...", badges: [{ text: "", label: "loading", type: "positive" }], icon: ShoppingCart, iconColor: "#8B5CF6", iconBg: "#F5F3FF" }
      );
    }
    initialStats.push(
      { title: "Registered Sellers", value: "...", badges: [{ text: "", label: "loading", type: "positive" }], icon: Store, iconColor: "#4338CA", iconBg: "#F3EEFF" },
      { title: "Products Live", value: "...", badges: [{ text: "", label: "loading", type: "positive" }], icon: Package, iconColor: "#22C55E", iconBg: "#F0FDF4" },
      { title: "Pending Product Reviews", value: "...", badges: [{ text: "", label: "loading", type: "positive" }], icon: ClipboardCheck, iconColor: "#F59E0B", iconBg: "#FFFBEB" }
    );
    setStats(initialStats);
  }, []);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get<{
          totalSellers?: number; verifiedSellers?: number; pendingSellers?: number;
          totalProducts?: number; activeProducts?: number; pendingProducts?: number;
          totalRevenue?: number; totalOrders?: number;
        }>("/api/users/admin-stats", { silent: true });

        if (res) {
          const newStats: StatsData[] = [];
          if (adminLevel === "super_admin") {
            newStats.push(
              {
                title: "Total Revenue",
                value: formatCurrency(res.totalRevenue ?? 0),
                badges: [{ text: formatCount(res.totalOrders ?? 0), label: "confirmed orders", type: "positive" }],
                icon: IndianRupee, iconColor: "#1A6FD4", iconBg: "#EAF2FF",
              },
              {
                title: "Total Sales",
                value: formatCount(res.totalOrders ?? 0),
                badges: [{ text: "✓", label: "completed", type: "positive" }],
                icon: ShoppingCart, iconColor: "#8B5CF6", iconBg: "#F5F3FF",
              }
            );
          }
          newStats.push(
            {
              title: "Registered Sellers",
              value: formatCount(res.totalSellers ?? 0),
              badges: [
                { text: formatCount(res.verifiedSellers ?? 0), label: "verified", type: "positive" },
                ...((res.pendingSellers ?? 0) > 0 ? [{ text: formatCount(res.pendingSellers!), label: "pending", type: "negative" as const }] : []),
              ],
              icon: Store, iconColor: "#4338CA", iconBg: "#F3EEFF",
            },
            {
              title: "Products Live",
              value: formatCount(res.activeProducts ?? 0),
              badges: [{ text: `+${formatCount(res.totalProducts ?? 0)}`, label: "total", type: "positive" }],
              icon: Package, iconColor: "#22C55E", iconBg: "#F0FDF4",
            },
            {
              title: "Pending Product Reviews",
              value: formatCount(res.pendingProducts ?? 0),
              badges: [
                res.pendingProducts
                  ? { text: "!", label: "needs attention", type: "negative" as const }
                  : { text: "✓", label: "all clear", type: "positive" as const },
              ],
              icon: ClipboardCheck, iconColor: "#F59E0B", iconBg: "#FFFBEB",
            }
          );
          setStats(newStats);
        }
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      }
    }

    fetchStats();
  }, [adminLevel]);

  return (
    <div className="min-h-screen">
      <main className="p-6 xl:p-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-6">
          {stats.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Revenue Chart + Order Status */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          {adminLevel === "super_admin" && (
            <div className="col-span-12 xl:col-span-8">
              <RevenueChart />
            </div>
          )}
          <div className={`col-span-12 ${adminLevel === "super_admin" ? "xl:col-span-4" : "xl:col-span-6"}`}>
            <OrderStatusChart />
          </div>
        </div>

        {/* Recent Orders + Top Sellers */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-12 xl:col-span-8">
            <RecentOrdersTable />
          </div>
          <div className="col-span-12 xl:col-span-4">
            <TopSellersList />
          </div>
        </div>

        {/* Category Performance */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <CategoryChart />
          </div>
        </div>
      </main>
    </div>
  );
}
