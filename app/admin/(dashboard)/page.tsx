"use client";

import { useEffect, useState } from "react";
import {
  IndianRupee,
  ShoppingCart,
  Store,
  Package,
} from "lucide-react";
import Header from "@/components/Header";
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

interface StatsData {
  title: string;
  value: string;
  delta: string;
  deltaType: "positive" | "negative";
  icon: typeof Package;
  iconColor: string;
  iconBg: string;
}

const fallbackStats: StatsData[] = [
  {
    title: "Total Revenue",
    value: "\u20B90",
    delta: "Phase 4",
    deltaType: "positive" as const,
    icon: IndianRupee,
    iconColor: "#111111",
    iconBg: "#11111115",
  },
  {
    title: "Active Orders",
    value: "0",
    delta: "Phase 3",
    deltaType: "positive" as const,
    icon: ShoppingCart,
    iconColor: "#6B7280",
    iconBg: "#6B728015",
  },
  {
    title: "Registered Sellers",
    value: "...",
    delta: "loading",
    deltaType: "positive" as const,
    icon: Store,
    iconColor: "#9CA3AF",
    iconBg: "#9CA3AF15",
  },
  {
    title: "Products Listed",
    value: "...",
    delta: "loading",
    deltaType: "positive" as const,
    icon: Package,
    iconColor: "#374151",
    iconBg: "#37415115",
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData[]>(fallbackStats);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch product count and seller count from API
        const [productsRes, sellersRes] = await Promise.allSettled([
          api.get<{ total: number }>("/api/products?status=active&limit=1"),
          api.get<{ total: number }>("/api/products?status=draft&limit=1"),
        ]);

        const activeCount =
          productsRes.status === "fulfilled" ? (productsRes.value?.total ?? 0) : 0;
        const draftCount =
          sellersRes.status === "fulfilled" ? (sellersRes.value?.total ?? 0) : 0;
        const totalProducts = activeCount + draftCount;

        setStats([
          {
            title: "Total Revenue",
            value: "\u20B90",
            delta: "Coming in Phase 3",
            deltaType: "positive",
            icon: IndianRupee,
            iconColor: "#111111",
            iconBg: "#11111115",
          },
          {
            title: "Active Orders",
            value: "0",
            delta: "Coming in Phase 3",
            deltaType: "positive",
            icon: ShoppingCart,
            iconColor: "#6B7280",
            iconBg: "#6B728015",
          },
          {
            title: "Active Products",
            value: formatCount(activeCount),
            delta: `${formatCount(draftCount)} draft`,
            deltaType: "positive",
            icon: Store,
            iconColor: "#9CA3AF",
            iconBg: "#9CA3AF15",
          },
          {
            title: "Products Listed",
            value: formatCount(totalProducts),
            delta: `${formatCount(activeCount)} active`,
            deltaType: "positive",
            icon: Package,
            iconColor: "#374151",
            iconBg: "#37415115",
          },
        ]);
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="p-6 xl:p-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
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
