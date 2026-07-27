"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, ShoppingBag, ArrowLeft, Package, XCircle, ArrowUpDown, ChevronDown } from "lucide-react";
import Link from "next/link";
import OrderCard, { type Order } from "@/components/customer/OrderCard";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { api } from "@/lib/api";
import { EmptyOrdersIllustration } from "@/components/shared/EmptyOrdersIllustration";
import { useAuth } from "@/lib/AuthContext";
import { useLoginSheet } from "@/lib/LoginSheetContext";

const tabs = ["All Orders", "Active", "Delivered", "Cancelled"] as const;
type TabType = typeof tabs[number];

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
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>(
    (searchParams.get("tab") as TabType) || "All Orders"
  );
  const [sortBy, setSortBy] = useState("newest");
  const [openDropdown, setOpenDropdown] = useState<"status" | "sort" | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const justPlaced = searchParams.get("placed") === "1";
  const [showSuccess, setShowSuccess] = useState(justPlaced);
  const { user } = useAuth();
  const { open: openLoginSheet } = useLoginSheet();

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
          rawDate: o.placed_at,
          product: o.items?.[0]?.product_name ?? "Order",
          seller: "",
          qty: o.items?.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0) ?? 0,
          amount: o.total,
          status: (statusMap[o.status] ?? "Processing") as Order["status"],
          rawStatus: o.status,
          imageUrl: o.items?.[0]?.product_image,
          items: (o.items ?? []).map(i => ({ name: i.product_name, qty: i.quantity, image: i.product_image, price: (i as any).unit_price })),
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

  const filtered = useMemo(() => {
    let result = activeTab === "All Orders"
      ? orders
      : orders.filter((o) => o.status === activeTab.replace("Active", "Processing"));

    return result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.rawDate || b.date).getTime() - new Date(a.rawDate || a.date).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.rawDate || a.date).getTime() - new Date(b.rawDate || b.date).getTime();
      } else if (sortBy === "amount_desc") {
        return b.amount - a.amount;
      } else if (sortBy === "amount_asc") {
        return a.amount - b.amount;
      }
      return 0;
    });
  }, [orders, activeTab, sortBy]);

  const filterRef = React.useRef<HTMLDivElement>(null);
  const sortRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        (filterRef.current && filterRef.current.contains(target)) ||
        (sortRef.current && sortRef.current.contains(target))
      ) {
        return;
      }
      setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statusOptions = tabs.map(tab => {
    const statusMatch = tab.replace("Active", "Processing");
    return {
      value: tab,
      label: tab,
      count: tab === "All Orders" ? orders.length : orders.filter((o) => o.status === statusMatch).length
    };
  });

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "amount_desc", label: "Amount: High to Low" },
    { value: "amount_asc", label: "Amount: Low to High" }
  ];

  return (
    <div className="mx-auto max-w-[1400px] py-0 md:py-6 px-0 md:px-12">
      {/* ── Mobile Header ── */}
      <header className="flex md:hidden items-center px-4 h-14 bg-white border-b border-gray-100 sticky top-0 z-40">
        <Link href="/account" className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </Link>
        <h1 className="text-[17px] font-medium text-gray-900 leading-tight flex-1">
          My Orders
        </h1>
      </header>

      {/* ── Mobile Filter Strip (Segmented Control Style) ── */}
      <div className="md:hidden w-full bg-white border-b sticky top-14 z-30 px-3 py-2" style={{ borderColor: t.border }}>
        <div className="flex items-center border border-gray-200 bg-white w-full overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] rounded-xl">
          {/* SORT BUTTON (Using native select) */}
          <div className="flex-1 relative border-r border-gray-200 hover:bg-gray-50 transition-colors">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_desc">Amount: High to Low</option>
              <option value="amount_asc">Amount: Low to High</option>
            </select>
            <div className="flex items-center justify-center gap-2 py-3 text-[13px] font-semibold text-gray-800 pointer-events-none">
              <ArrowUpDown className="w-4 h-4 text-gray-500" />
              Sort
            </div>
          </div>
          
          {/* STATUS BUTTON (Using native select) */}
          <div className="flex-1 relative hover:bg-gray-50 transition-colors">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              {tabs.map(tab => {
                const statusMatch = tab.replace("Active", "Processing");
                const count = tab === "All Orders" 
                  ? orders.length 
                  : orders.filter((o) => o.status === statusMatch).length;
                return (
                  <option key={tab} value={tab}>{tab} ({count})</option>
                );
              })}
            </select>
            <div className="flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold text-gray-800 pointer-events-none">
              {activeTab === "All Orders" ? "Status" : activeTab}
              <span className="text-[10px] text-gray-400">▼</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-0 pt-4 md:pt-0">
      {showSuccess && (
        <div
          className="mb-4 flex items-center gap-3 rounded-xl border p-4 shadow-sm"
          style={{ background: t.bgCard, borderColor: t.border }}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: t.textPrimary }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: t.textPrimary }}>Order placed successfully!</p>
            <p className="text-xs mt-0.5" style={{ color: t.textSecondary }}>
              Your order has been confirmed. You can track it here.
            </p>
          </div>
        </div>
      )}

      {/* Heading & Filter (Desktop) */}
      <div className="hidden md:flex items-end justify-between mb-6 md:mb-8 mt-1 md:mt-2 w-full md:px-[26px]">
        <div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-[24px] md:text-[32px] font-medium tracking-tight mb-1" style={{ color: t.textPrimary }}>
              My Orders
            </h1>
            <span className="text-[18px] font-bold text-gray-400">
              ({orders.length} {orders.length === 1 ? 'Order' : 'Orders'})
            </span>
          </div>
          <p className="text-[13px] md:text-[15px] mt-1" style={{ color: t.textSecondary }}>
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter Dropdown */}
          <div ref={filterRef} className="relative z-50">
            <button
              onMouseDown={() => setOpenDropdown(openDropdown === "status" ? null : "status")}
              className={`flex items-center justify-between gap-2 bg-white border rounded-full px-4 py-2 min-w-[150px] text-[13px] font-semibold outline-none transition-all shadow-sm ${
                openDropdown === "status" ? "ring-2 border-blue-500" : "hover:bg-gray-50 border-gray-200"
              }`}
              style={{ color: t.textPrimary, boxShadow: openDropdown === "status" ? '0 0 0 2px rgba(37,99,235,0.1)' : undefined }}
            >
              {activeTab === "All Orders" ? "All Orders" : activeTab}
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openDropdown === "status" ? "rotate-180" : ""}`} />
            </button>
            {openDropdown === "status" && (
              <div className="absolute right-0 top-full mt-2 w-[220px] bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onMouseDown={() => {
                      setActiveTab(opt.value as TabType);
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-[13.5px] font-medium transition-colors text-left ${
                      activeTab === opt.value ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span className="flex-1 truncate">{opt.label}</span>
                    <span className={`text-[12px] font-bold ml-2 ${activeTab === opt.value ? "text-blue-600" : "text-gray-400"}`}>{opt.count}</span>
                    {activeTab === opt.value && <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600 ml-2" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div ref={sortRef} className="relative z-50">
            <button
              onMouseDown={() => setOpenDropdown(openDropdown === "sort" ? null : "sort")}
              className={`flex items-center justify-between gap-2 bg-white border rounded-full px-4 py-2 min-w-[150px] text-[13px] font-semibold outline-none transition-all shadow-sm ${
                openDropdown === "sort" ? "ring-2 border-blue-500" : "hover:bg-gray-50 border-gray-200"
              }`}
              style={{ color: t.textPrimary, boxShadow: openDropdown === "sort" ? '0 0 0 2px rgba(37,99,235,0.1)' : undefined }}
            >
              {sortOptions.find(o => o.value === sortBy)?.label || "Sort"}
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openDropdown === "sort" ? "rotate-180" : ""}`} />
            </button>
            {openDropdown === "sort" && (
              <div className="absolute right-0 top-full mt-2 w-[220px] bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onMouseDown={() => {
                      setSortBy(opt.value);
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-[13.5px] font-medium transition-colors text-left ${
                      sortBy === opt.value ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span className="flex-1 truncate">{opt.label}</span>
                    {sortBy === opt.value && <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600 ml-2" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full md:px-[26px]">

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm animate-pulse">
              <div className="flex justify-between items-start mb-3">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-5 w-20 bg-gray-200 rounded-full" />
              </div>
              <div className="flex gap-4 mb-4">
                <div className="w-[60px] h-[60px] rounded-lg bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-1/3 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <div className="h-5 w-20 bg-gray-200 rounded" />
                <div className="h-8 w-24 bg-gray-200 rounded-lg" />
              </div>
            </div>
          ))}
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
                title: user ? "No delivered orders yet" : "Please login",
                desc: user ? "Orders you've received will appear here." : "Login to view your orders and continue shopping.",
              },
              "Cancelled": {
                Icon: XCircle,
                title: user ? "No cancelled orders" : "Please login",
                desc: user ? "You haven't cancelled any orders. That's great!" : "Login to view your orders and continue shopping.",
              },
              "Active": {
                Icon: Package,
                title: user ? "No active orders" : "Please login",
                desc: user ? "Orders in progress will show up here." : "Login to view your orders and continue shopping.",
              },
              "All Orders": {
                Icon: ShoppingBag,
                title: user ? "No orders yet" : "Please login",
                desc: user ? "Your orders will appear here after you place your first purchase." : "Login to view your orders and continue shopping.",
              },
            }[activeTab] ?? {
              Icon: ShoppingBag,
              title: user ? "No orders found" : "Please login",
              desc: user ? "You haven't placed any orders matching this filter yet." : "Login to view your orders and continue shopping.",
            };
            const { title, desc } = emptyConfig;
            return (
              <div className="flex flex-col items-center justify-center pt-4 pb-16 md:pt-4 md:pb-24 text-center px-4">
                <EmptyOrdersIllustration />
                <h3 className="text-[17px] md:text-[20px] font-semibold mb-2 mt-2" style={{ color: t.textPrimary }}>{title}</h3>
                <p className="text-[13px] md:text-[15px] mb-5 max-w-[280px]" style={{ color: t.textMuted }}>{desc}</p>
                {user ? (
                  <Link
                    href="/"
                    className="rounded-full md:rounded-xl px-8 py-3 md:px-10 md:py-3.5 text-[15px] md:text-[16px] font-semibold md:font-bold transition-all active:scale-95 shadow-sm md:shadow-md bg-white border-2 hover:bg-gray-50 inline-block"
                    style={{ borderColor: t.primaryCta, color: t.primaryCta }}
                  >
                    Start Shopping
                  </Link>
                ) : (
                  <button
                    onClick={() => openLoginSheet()}
                    className="rounded-full md:rounded-xl px-8 py-3 md:px-10 md:py-3.5 text-[15px] md:text-[16px] font-semibold md:font-bold transition-all active:scale-95 shadow-sm md:shadow-md bg-white border-2 hover:bg-gray-50 inline-block"
                    style={{ borderColor: t.primaryCta, color: t.primaryCta }}
                  >
                    Login
                  </button>
                )}
              </div>
            );
          })()}
        </div>
      )}
      </div>
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
  items?: { product_name: string; quantity: number; product_image?: string; price?: number }[];
}
