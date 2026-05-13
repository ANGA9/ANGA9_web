"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ShoppingBag } from "lucide-react";
import { api } from "@/lib/api";

interface RecentOrder {
  id: string;
  order_number: string;
  buyer_name: string;
  total: number;
  status: string;
  placed_at: string;
  items_count: number;
}

const statusStyles: Record<string, string> = {
  delivered: "bg-green-50 text-green-700 border-green-200",
  shipped: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-indigo-50 text-indigo-700 border-indigo-200",
  pending: "bg-gray-100 text-gray-700 border-gray-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

function formatINR(value: number) {
  return "\u20B9" + Number(value).toLocaleString("en-IN");
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { month: "short", day: "2-digit", year: "numeric" });
}

export default function RecentOrdersTable() {
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await api.get<RecentOrder[]>("/api/admin/dashboard/recent-orders", { silent: true });
        if (res) setOrders(res);
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchOrders();
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm h-full flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h2 className="text-[18px] font-bold text-gray-900 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[#8B5CF6]" /> Recent Transactions
        </h2>
        <Link href="/admin/orders" className="text-[14px] font-bold text-[#8B5CF6] hover:underline">
          View All
        </Link>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#8B5CF6]" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] text-center px-4 py-8">
          <ShoppingBag className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-[16px] font-bold text-gray-900">No orders yet</p>
          <p className="text-[14px] text-gray-500 font-medium">When customers purchase, they'll appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[25%]">Order ID</th>
                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[25%]">Buyer</th>
                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-center w-[15%]">Items</th>
                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right w-[15%]">Amount</th>
                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[10%]">Status</th>
                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right w-[10%]">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <Link href={`/admin/orders/${order.id}`} className="font-bold text-[14px] text-[#8B5CF6] hover:underline">
                      #{order.order_number}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-[14px] text-gray-900">{order.buyer_name}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[14px] font-medium text-gray-600">{order.items_count}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-[15px] text-gray-900">{formatINR(order.total)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide ${statusStyles[order.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[13px] font-medium text-gray-500">{formatDate(order.placed_at)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
