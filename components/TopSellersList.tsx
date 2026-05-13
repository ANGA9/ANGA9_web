"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Crown } from "lucide-react";
import { api } from "@/lib/api";

interface TopSeller {
  id: string;
  name: string;
  revenue: number;
  orderCount: number;
}

const COLORS = ["#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE", "#EDE9FE"];

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
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[18px] font-bold text-gray-900 flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#8B5CF6]" /> Top Sellers
          </h2>
          <p className="text-[13px] text-gray-500 font-medium mt-1">Highest grossing stores</p>
        </div>
        <Link href="/admin/sellers" className="text-[14px] font-bold text-[#8B5CF6] hover:underline">
          View All
        </Link>
      </div>

      <div className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#8B5CF6]" />
          </div>
        ) : sellers.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] text-center">
            <Crown className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-[14px] font-bold text-gray-900">No seller data</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sellers.map((seller, index) => (
              <div
                key={seller.id}
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group"
              >
                <div className={`w-6 text-center font-black ${index < 3 ? 'text-[#8B5CF6]' : 'text-gray-400'}`}>
                  #{index + 1}
                </div>
                
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold text-white shadow-sm shrink-0"
                  style={{ backgroundColor: index < COLORS.length ? COLORS[index] : COLORS[COLORS.length - 1] }}
                >
                  {getInitials(seller.name || "?")}
                </div>
                
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold text-gray-900 truncate group-hover:text-[#8B5CF6] transition-colors">
                    {seller.name || "Unknown Store"}
                  </p>
                  <span className="text-[12px] font-medium text-gray-500">
                    {seller.orderCount} total orders
                  </span>
                </div>
                
                <div className="shrink-0 text-right">
                  <p className="text-[15px] font-black text-gray-900">
                    {formatINR(seller.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
