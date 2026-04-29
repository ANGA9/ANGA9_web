"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface TopSeller {
  id: string;
  name: string;
  revenue: number;
  orderCount: number;
}

const COLORS = ["#1A6FD4", "#374151", "#6B7280", "#4B5563", "#9CA3AF"];

function formatINR(value: number) {
  if (value >= 100000) return `\u20B9${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `\u20B9${(value / 1000).toFixed(1)}K`;
  return `\u20B9${value}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function TopSellersList() {
  const [sellers, setSellers] = useState<TopSeller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSellers() {
      try {
        const res = await api.get<TopSeller[]>("/api/admin/dashboard/top-sellers", { silent: true });
        if (res) setSellers(res);
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchSellers();
  }, []);

  return (
    <div className="rounded-xl border border-anga-border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-anga-text">Top Sellers</h3>
        <Link href="/admin/sellers" className="text-sm font-medium text-[#1A6FD4] hover:underline">
          View All
        </Link>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-[#1A6FD4]" />
        </div>
      ) : sellers.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-sm text-anga-text-secondary">
          No seller data available
        </div>
      ) : (
        <div className="space-y-4">
          {sellers.map((seller, index) => (
            <div
              key={seller.id}
              className="flex items-center gap-3 rounded-lg p-2 hover:bg-anga-bg/50 transition-colors"
            >
              <span className="text-xs font-semibold text-anga-text-secondary w-4">
                {index + 1}
              </span>
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback
                  className="text-xs font-semibold text-white"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                >
                  {getInitials(seller.name || "?")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-anga-text truncate">
                  {seller.name || "Unknown Store"}
                </p>
                <span className="text-xs text-anga-text-secondary">
                  {seller.orderCount} orders
                </span>
              </div>
              <p className="text-sm font-semibold text-anga-text shrink-0">
                {formatINR(seller.revenue)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
