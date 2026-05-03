"use client";

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
  delta: string;
  deltaType: "positive" | "negative";
  icon: typeof Package;
  iconColor: string;
  iconBg: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData[]>([
    { title: "Total Revenue", value: "₹0", delta: "loading", deltaType: "positive", icon: IndianRupee, iconColor: "#1A6FD4", iconBg: "#EAF2FF" },
    { title: "Total Sales", value: "...", delta: "loading", deltaType: "positive", icon: ShoppingCart, iconColor: "#8B5CF6", iconBg: "#F5F3FF" },
    { title: "Registered Sellers", value: "...", delta: "loading", deltaType: "positive", icon: Store, iconColor: "#4338CA", iconBg: "#F3EEFF" },
    { title: "Products Live", value: "...", delta: "loading", deltaType: "positive", icon: Package, iconColor: "#22C55E", iconBg: "#F0FDF4" },
    { title: "Pending Reviews", value: "...", delta: "loading", deltaType: "positive", icon: ClipboardCheck, iconColor: "#F59E0B", iconBg: "#FFFBEB" },
  ]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get<{
          totalSellers?: number; verifiedSellers?: number; pendingSellers?: number;
          totalProducts?: number; activeProducts?: number; pendingProducts?: number;
          totalRevenue?: number; totalOrders?: number;
        }>("/api/users/admin-stats", { silent: true });

        if (res) {
          setStats([
            {
              title: "Total Revenue",
              value: formatCurrency(res.totalRevenue ?? 0),
              delta: "across confirmed orders",
              deltaType: "positive",
              icon: IndianRupee,
              iconColor: "#1A6FD4",
              iconBg: "#EAF2FF",
            },
            {
              title: "Total Sales",
              value: formatCount(res.totalOrders ?? 0),
              delta: "completed orders",
              deltaType: "positive",
              icon: ShoppingCart,
              iconColor: "#8B5CF6",
              iconBg: "#F5F3FF",
            },
            {
              title: "Registered Sellers",
              value: formatCount(res.totalSellers ?? 0),
              delta: `${formatCount(res.verifiedSellers ?? 0)} verified`,
              deltaType: "positive",
              icon: Store,
              iconColor: "#4338CA",
              iconBg: "#F3EEFF",
            },
            {
              title: "Products Live",
              value: formatCount(res.activeProducts ?? 0),
              delta: `${formatCount(res.totalProducts ?? 0)} total`,
              deltaType: "positive",
              icon: Package,
              iconColor: "#22C55E",
              iconBg: "#F0FDF4",
            },
            {
              title: "Pending Reviews",
              value: formatCount(res.pendingProducts ?? 0),
              delta: res.pendingProducts ? "needs attention" : "all clear",
              deltaType: res.pendingProducts ? "negative" : "positive",
              icon: ClipboardCheck,
              iconColor: "#F59E0B",
              iconBg: "#FFFBEB",
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      }
    }

    fetchStats();
  }, []);

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
          <div className="col-span-12 xl:col-span-8">
            <RevenueChart />
          </div>
          <div className="col-span-12 xl:col-span-4">
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
