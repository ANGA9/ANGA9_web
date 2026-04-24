"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import OrderCard, { type Order } from "@/components/customer/OrderCard";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { api } from "@/lib/api";

const tabs = ["All Orders", "Active", "Delivered", "Cancelled"] as const;

const statusMap: Record<string, string> = {
  confirmed: "Processing",
  processing: "Processing",
  shipped: "Processing",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Cancelled",
};

export default function CustomerOrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#1A6FD4" }} />
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}

function OrdersContent() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All Orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const justPlaced = searchParams.get("placed") === "1";
  const [showSuccess, setShowSuccess] = useState(justPlaced);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const data = await api.get<{ orders: ApiOrder[] }>("/api/orders");
        const mapped: Order[] = (data.orders ?? []).map((o) => ({
          internalId: o.id,
          id: o.order_number,
          date: new Date(o.placed_at).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          product: o.items?.[0]?.product_name ?? "Order",
          seller: "",
          qty: o.items?.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0) ?? 0,
          amount: o.total,
          status: (statusMap[o.status] ?? "Processing") as Order["status"],
        }));
        setOrders(mapped);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const filtered =
    activeTab === "All Orders"
      ? orders
      : orders.filter((o) => o.status === activeTab.replace("Active", "Processing"));

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-8 py-6">
      {showSuccess && (
        <div
          className="mb-4 flex items-center gap-3 rounded-xl border p-4"
          style={{ background: "#E8F5E9", borderColor: "#A5D6A7" }}
        >
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">Order placed successfully!</p>
            <p className="text-xs text-green-700 mt-0.5">
              Your order has been confirmed. You can track it here.
            </p>
          </div>
        </div>
      )}

      <h1 className="text-xl font-bold mb-1" style={{ color: t.textPrimary }}>
        My Orders
      </h1>
      <p className="text-sm mb-6" style={{ color: t.textSecondary }}>
        Track and manage your wholesale orders
      </p>

      <div className="flex gap-1 border-b mb-6" style={{ borderColor: t.border }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px"
              style={{
                borderColor: isActive ? t.bluePrimary : "transparent",
                color: isActive ? t.bluePrimary : t.textSecondary,
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: t.bluePrimary }} />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order, idx) => (
            <OrderCard key={order.id + idx} order={order} />
          ))}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <h3 className="text-base font-semibold" style={{ color: t.textPrimary }}>
                No orders found
              </h3>
              <p className="mt-1 text-sm" style={{ color: t.textSecondary }}>
                Orders matching this filter will appear here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ApiOrder {
  id: string;
  order_number: string;
  status: string;
  total: number;
  placed_at: string;
  items?: { product_name: string; quantity: number }[];
}
