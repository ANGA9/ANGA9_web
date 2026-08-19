"use client";

import { useEffect, useState } from "react";
import { Loader2, Users, ShoppingBag } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { getRepeatBuyers, type RepeatBuyer } from "@/lib/sellersApi";

function formatINR(value: number) {
  return "₹" + Number(value || 0).toLocaleString("en-IN");
}

export default function RepeatBuyersPage() {
  const { dbUser } = useAuth();
  const [items, setItems] = useState<RepeatBuyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dbUser?.id) return;
    let cancelled = false;
    getRepeatBuyers(dbUser.id)
      .then((r) => {
        if (!cancelled) setItems(r.items);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dbUser?.id]);

  return (
    <main className="w-full mx-auto max-w-6xl px-3 sm:px-4 py-6 md:px-8 md:py-10 text-[#1A1A2E]">
      <header className="mb-8">
        <h1 className="text-[32px] font-medium text-gray-900 tracking-tight flex items-center gap-3">
          <Users className="w-7 h-7 text-[#1A6FD4]" /> Repeat Buyers
        </h1>
        <p className="text-[15px] text-gray-500 font-medium mt-1">
          Customers who have placed 2 or more orders with your store.
        </p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4]" />
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-red-200 p-6 text-center text-[14px] font-medium text-red-600 shadow-sm">{error}</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-[18px] font-bold text-gray-900 mb-1">No repeat buyers yet</h2>
          <p className="text-[14px] text-gray-500 font-medium max-w-sm">
            Once a customer orders from you twice, their purchase history will show up here.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="px-6 py-4 text-[14px] font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-[14px] font-bold text-gray-500 uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-4 text-[14px] font-bold text-gray-500 uppercase tracking-wider">Total Spent</th>
                  <th className="px-6 py-4 text-[14px] font-bold text-gray-500 uppercase tracking-wider text-right">Last Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((b) => (
                  <tr key={b.customer_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-[14px] text-gray-900">
                      {b.full_name || <span className="text-gray-400 italic">Anonymous</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-0.5 rounded-md bg-blue-50 text-[#1A6FD4] text-[14px] font-bold border border-blue-200">
                        {b.order_count} orders
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[15px] text-gray-900">{formatINR(b.total_spent)}</td>
                    <td className="px-6 py-4 text-right text-[14px] font-medium text-gray-500">{new Date(b.last_order_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {items.map((b) => (
              <div key={b.customer_id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[15px] text-gray-900">
                    {b.full_name || <span className="text-gray-400 italic">Anonymous</span>}
                  </span>
                  <span className="rounded-md bg-blue-50 text-[#1A6FD4] border border-blue-200 px-2.5 py-0.5 text-[14px] font-bold">
                    {b.order_count} orders
                  </span>
                </div>
                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-gray-500 font-medium">Total spent</span>
                  <span className="font-bold text-gray-900">{formatINR(b.total_spent)}</span>
                </div>
                <div className="flex items-center justify-between text-[14px] mt-1">
                  <span className="text-gray-500 font-medium">Last order</span>
                  <span className="text-gray-500">{new Date(b.last_order_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
