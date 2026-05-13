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
    <main className="p-6 xl:p-8">
      <header className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-anga-text flex items-center gap-2">
          <Users size={22} /> Repeat Buyers
        </h1>
        <p className="text-sm md:text-base text-anga-text-secondary">
          Customers who have placed 2 or more orders with you.
        </p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-6 h-6 animate-spin text-[#1A6FD4]" />
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-red-200 p-6 text-center text-sm text-red-600">{error}</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-anga-border p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-[#E8EEF4] mx-auto mb-4" />
          <h2 className="text-base md:text-lg font-bold text-anga-text mb-1">No repeat buyers yet</h2>
          <p className="text-sm md:text-base text-anga-text-secondary">
            Once a customer orders from you twice, they'll show up here.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl border border-anga-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-anga-border bg-[#F8FBFF]">
                  <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Customer</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Orders</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Total Spent</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Last Order</th>
                </tr>
              </thead>
              <tbody>
                {items.map((b) => (
                  <tr key={b.customer_id} className="border-b border-anga-border last:border-0 hover:bg-[#F8FBFF]">
                    <td className="px-4 py-3 font-medium text-anga-text">
                      {b.full_name || <span className="text-anga-text-secondary italic">Anonymous</span>}
                    </td>
                    <td className="px-4 py-3 text-anga-text">{b.order_count}</td>
                    <td className="px-4 py-3 font-medium text-anga-text">{formatINR(b.total_spent)}</td>
                    <td className="px-4 py-3 text-[#9CA3AF]">{new Date(b.last_order_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {items.map((b) => (
              <div key={b.customer_id} className="bg-white rounded-xl border border-anga-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-anga-text">
                    {b.full_name || <span className="text-anga-text-secondary italic">Anonymous</span>}
                  </span>
                  <span className="rounded-full bg-[#F1F7FF] text-[#1A6FD4] px-2 py-0.5 text-xs font-semibold">
                    {b.order_count} orders
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-anga-text-secondary">Total spent</span>
                  <span className="font-semibold text-anga-text">{formatINR(b.total_spent)}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-anga-text-secondary">Last order</span>
                  <span className="text-[#9CA3AF]">{new Date(b.last_order_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
