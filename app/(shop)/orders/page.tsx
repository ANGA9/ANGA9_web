"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, ShoppingBag, ArrowLeft, Package, XCircle } from "lucide-react";
import Link from "next/link";
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
          rawStatus: o.status,
          imageUrl: o.items?.[0]?.product_image,
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
    <div className="mx-auto max-w-4xl py-0 md:py-6 px-0 md:px-0">
      {/* ── Mobile Header ── */}
      <header className="flex md:hidden items-center px-4 h-14 bg-white border-b border-gray-100 sticky top-0 z-40">
        <Link href="/" className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </Link>
        <h1 className="text-[17px] font-medium text-gray-900 leading-tight">
          My Orders
        </h1>
      </header>

      <div className="px-4 md:px-0 pt-4 md:pt-0">
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

      {/* Desktop-only heading */}
      <div className="hidden md:flex items-center gap-2 mb-6 lg:mb-8">
        <h1 className="text-[24px] lg:text-[32px] font-black text-gray-900 tracking-tight">
          My Orders
        </h1>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          const statusMatch = tab.replace("Active", "Processing");
          const count = tab === "All Orders" 
            ? orders.length 
            : orders.filter((o) => o.status === statusMatch).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-2.5 text-[14px] font-bold rounded-full transition-all whitespace-nowrap border"
              style={{
                backgroundColor: isActive ? "#1A6FD4" : "#FFFFFF",
                borderColor: isActive ? "#1A6FD4" : t.border,
                color: isActive ? "#FFFFFF" : t.textSecondary,
                boxShadow: isActive ? "0 4px 14px rgba(26, 111, 212, 0.2)" : "none",
              }}
            >
              {tab} <span className="opacity-80 ml-1.5 text-[12px]">{count}</span>
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
            <OrderCard
              key={order.id + idx}
              order={order}
              onCancelled={(id) =>
                setOrders((prev) =>
                  prev.map((o) =>
                    o.internalId === id ? { ...o, status: "Cancelled", rawStatus: "cancelled" } : o
                  )
                )
              }
            />
          ))}

          {filtered.length === 0 && (() => {
            const emptyConfig = {
              "Delivered": {
                Icon: CheckCircle2,
                color: "#16A34A",
                bg: "#DCFCE7",
                title: "No delivered orders yet",
                desc: "Orders you've received will appear here.",
              },
              "Cancelled": {
                Icon: XCircle,
                color: "#DC2626",
                bg: "#FEE2E2",
                title: "No cancelled orders",
                desc: "You haven't cancelled any orders. That's great!",
              },
              "Active": {
                Icon: Package,
                color: "#D97706",
                bg: "#FEF3C7",
                title: "No active orders",
                desc: "Orders in progress will show up here.",
              },
              "All Orders": {
                Icon: ShoppingBag,
                color: "#1A6FD4",
                bg: "#EAF2FF",
                title: "No orders yet",
                desc: "Your orders will appear here after you place your first purchase.",
              },
            }[activeTab] ?? {
              Icon: ShoppingBag, color: "#1A6FD4", bg: "#EAF2FF",
              title: "No orders found",
              desc: "You haven't placed any orders matching this filter yet.",
            };
            const { Icon, color, bg, title, desc } = emptyConfig;
            return (
              <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center px-4">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-5" style={{ background: bg }}>
                  <Icon className="w-10 h-10 md:w-12 md:h-12" style={{ color }} />
                </div>
                <h3 className="text-[17px] md:text-[20px] font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-[13px] md:text-[15px] text-gray-500 mb-8 max-w-[280px]">{desc}</p>
                <Link
                  href="/"
                  className="rounded-full md:rounded-xl px-6 py-2 md:px-10 md:py-3.5 text-[13px] md:text-[16px] font-bold text-white transition-all active:scale-95 shadow-sm"
                  style={{ background: color }}
                >
                  Start Shopping
                </Link>
              </div>
            );
          })()}
        </div>
      )}
      </div>
    </div>
  );
}

interface ApiOrder {
  id: string;
  order_number: string;
  status: string;
  total: number;
  placed_at: string;
  items?: { product_name: string; quantity: number; product_image?: string }[];
}
