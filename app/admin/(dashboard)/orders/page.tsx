"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import {
  Loader2,
  ShoppingCart,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import Header from "@/components/Header";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  placed_at: string;
  items_count: number;
}

interface OrderDetail {
  id: string;
  order_number: string;
  status: string;
  total: number;
  placed_at: string;
  shipping_address_id: string | null;
  customer: { full_name: string; email: string; phone?: string };
  items: { id: string; product_name: string; quantity: number; unit_price: number; total_price: number; seller_id: string }[];
  status_history: { from_status: string; to_status: string; created_at: string; reason?: string }[];
}

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending_payment", label: "Pending Payment" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_BADGE: Record<string, string> = {
  pending_payment: "bg-[#F3F4F6] text-[#9CA3AF]",
  confirmed: "bg-[#EDE9FE] text-[#6366F1]",
  processing: "bg-[#FFFBEB] text-[#F59E0B]",
  shipped: "bg-[#EAF2FF] text-[#1A6FD4]",
  delivered: "bg-[#F0FDF4] text-[#22C55E]",
  cancelled: "bg-[#FEF2F2] text-[#EF4444]",
  returned: "bg-[#FEF2F2] text-[#EF4444]",
};

function formatINR(value: number) {
  return "\u20B9" + Number(value).toLocaleString("en-IN");
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function capitalize(s: string) {
  return s.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const STATUS_ACTIONS: Record<string, { next: string; label: string; color: string; icon: typeof Truck }[]> = {
  pending_payment: [
    { next: "confirmed", label: "Confirm", color: "bg-[#6366F1] hover:bg-[#4F46E5]", icon: CheckCircle2 },
    { next: "cancelled", label: "Cancel", color: "bg-[#EF4444] hover:bg-[#DC2626]", icon: XCircle },
  ],
  confirmed: [
    { next: "processing", label: "Process", color: "bg-[#F59E0B] hover:bg-[#D97706]", icon: Clock },
    { next: "cancelled", label: "Cancel", color: "bg-[#EF4444] hover:bg-[#DC2626]", icon: XCircle },
  ],
  processing: [
    { next: "shipped", label: "Ship", color: "bg-[#1A6FD4] hover:bg-[#155bb5]", icon: Truck },
  ],
  shipped: [
    { next: "delivered", label: "Delivered", color: "bg-[#22C55E] hover:bg-[#16A34A]", icon: CheckCircle2 },
  ],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedDetail, setExpandedDetail] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const limit = 20;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      const res = await api.get<{ orders: Order[]; total: number }>(
        `/api/admin/orders?${params}`,
        { silent: true }
      );
      if (res) {
        setOrders(res.orders);
        setTotal(res.total);
      }
    } catch {
      toast.error("Failed to load orders");
    }
    setLoading(false);
  }, [page, statusFilter, search, fromDate, toDate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleTabChange = (key: string) => {
    setPage(1);
    setStatusFilter(key);
  };

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedDetail(null);
      return;
    }
    setExpandedId(id);
    setDetailLoading(true);
    try {
      const res = await api.get<OrderDetail>(`/api/admin/orders/${id}`, { silent: true });
      if (res) setExpandedDetail(res);
    } catch {
      toast.error("Failed to load order details");
    }
    setDetailLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    let reason: string | undefined;
    if (newStatus === "cancelled") {
      const input = prompt("Reason for cancellation:");
      if (!input) return;
      reason = input;
    }
    setActionLoading(orderId);
    try {
      await api.patch(`/api/admin/orders/${orderId}/status`, { status: newStatus, reason });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (expandedDetail?.id === orderId) {
        setExpandedDetail({ ...expandedDetail, status: newStatus });
      }
      toast.success(`Order ${newStatus}`);
    } catch {
      toast.error("Failed to update order status");
    }
    setActionLoading(null);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="p-6 xl:p-8">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-anga-text">Orders</h1>
          <p className="text-sm md:text-base text-anga-text-secondary">
            {total} order{total !== 1 ? "s" : ""} total
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-anga-border p-4 mb-6 space-y-4">
          <div className="flex flex-wrap gap-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors",
                  statusFilter === tab.key
                    ? "bg-[#1A6FD4] text-white"
                    : "text-anga-text-secondary hover:bg-anga-bg"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-anga-text-secondary" />
                <input
                  type="text"
                  placeholder="Search order number..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="h-9 w-full rounded-lg border border-anga-border bg-white pl-9 pr-3 text-sm text-anga-text placeholder:text-anga-text-secondary/60 focus:border-[#1A6FD4] focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/10 transition-colors"
                />
              </div>
              <button
                onClick={handleSearch}
                className="h-9 px-4 rounded-lg bg-[#1A6FD4] text-white text-sm font-medium hover:bg-[#155bb5] transition-colors"
              >
                Search
              </button>
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-xs text-anga-text-secondary whitespace-nowrap">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                className="h-9 rounded-lg border border-anga-border px-3 text-sm text-anga-text focus:border-[#1A6FD4] focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/10 transition-colors"
              />
              <label className="text-xs text-anga-text-secondary whitespace-nowrap">To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                className="h-9 rounded-lg border border-anga-border px-3 text-sm text-anga-text focus:border-[#1A6FD4] focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/10 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="w-6 h-6 animate-spin text-[#1A6FD4]" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-anga-border p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-[#E8EEF4] mx-auto mb-4" />
            <h2 className="text-base md:text-lg font-bold text-anga-text mb-2">No Orders Found</h2>
            <p className="text-sm md:text-base text-anga-text-secondary">
              {search || fromDate || toDate
                ? "Try adjusting your filters"
                : "No orders match the selected status"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-anga-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-anga-border bg-[#F8FBFF]">
                    <th className="w-10 px-2"></th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Order</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Customer</th>
                    <th className="text-center px-4 py-3 font-semibold text-[#4B5563]">Items</th>
                    <th className="text-right px-4 py-3 font-semibold text-[#4B5563]">Total</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Status</th>
                    <th className="text-right px-4 py-3 font-semibold text-[#4B5563]">Date</th>
                    <th className="text-center px-4 py-3 font-semibold text-[#4B5563]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <React.Fragment key={o.id}>
                      <tr
                        className="border-b border-anga-border last:border-0 hover:bg-[#F8FBFF] transition-colors cursor-pointer"
                        onClick={() => toggleExpand(o.id)}
                      >
                        <td className="px-2 text-center">
                          {expandedId === o.id ? (
                            <ChevronUp className="w-4 h-4 text-anga-text-secondary mx-auto" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-anga-text-secondary mx-auto" />
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-anga-text">{o.order_number}</td>
                        <td className="px-4 py-3 text-anga-text-secondary">{o.customer_name}</td>
                        <td className="px-4 py-3 text-center text-anga-text-secondary">{o.items_count}</td>
                        <td className="px-4 py-3 text-right font-medium text-anga-text">
                          {formatINR(o.total)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex px-2 py-0.5 rounded-full text-xs font-semibold",
                              STATUS_BADGE[o.status] || "bg-gray-100 text-gray-600"
                            )}
                          >
                            {capitalize(o.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-anga-text-secondary">
                          {formatDate(o.placed_at)}
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            {(STATUS_ACTIONS[o.status] || []).map((action) => (
                              <button
                                key={action.next}
                                onClick={() => updateStatus(o.id, action.next)}
                                disabled={actionLoading === o.id}
                                className={cn(
                                  "flex items-center gap-1 px-2 py-1 rounded-md text-white text-xs font-semibold transition-colors disabled:opacity-50",
                                  action.color
                                )}
                              >
                                {actionLoading === o.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <action.icon className="w-3 h-3" />
                                )}
                                {action.label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                      {/* Expanded detail */}
                      {expandedId === o.id && (
                        <tr key={`${o.id}-detail`}>
                          <td colSpan={8} className="px-6 py-4 bg-[#F8FBFF] border-b border-anga-border">
                            {detailLoading ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-[#1A6FD4]" />
                              </div>
                            ) : expandedDetail ? (
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Items */}
                                <div>
                                  <h4 className="text-sm font-semibold text-anga-text mb-3">
                                    Order Items ({expandedDetail.items.length})
                                  </h4>
                                  <div className="space-y-2">
                                    {expandedDetail.items.map((item) => (
                                      <div
                                        key={item.id}
                                        className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-anga-border"
                                      >
                                        <div className="min-w-0 flex-1">
                                          <p className="text-sm font-medium text-anga-text truncate">
                                            {item.product_name}
                                          </p>
                                          <p className="text-xs text-anga-text-secondary">
                                            Qty: {item.quantity} x {formatINR(item.unit_price)}
                                          </p>
                                        </div>
                                        <p className="text-sm font-medium text-anga-text ml-4">
                                          {formatINR(item.total_price)}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                {/* Customer + Timeline */}
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-sm font-semibold text-anga-text mb-2">Customer</h4>
                                    <div className="bg-white rounded-lg px-3 py-2 border border-anga-border text-sm space-y-1">
                                      <p className="text-anga-text font-medium">
                                        {expandedDetail.customer.full_name}
                                      </p>
                                      <p className="text-anga-text-secondary">
                                        {expandedDetail.customer.email}
                                      </p>
                                      {expandedDetail.customer.phone && (
                                        <p className="text-anga-text-secondary">
                                          {expandedDetail.customer.phone}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  {expandedDetail.status_history.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-semibold text-anga-text mb-2">
                                        Status History
                                      </h4>
                                      <div className="space-y-2">
                                        {expandedDetail.status_history.map((h, i) => (
                                          <div
                                            key={i}
                                            className="flex items-start gap-2 text-xs"
                                          >
                                            <div className="mt-1 w-2 h-2 rounded-full bg-[#1A6FD4] shrink-0" />
                                            <div>
                                              <span className="font-medium text-anga-text">
                                                {capitalize(h.from_status)} &rarr; {capitalize(h.to_status)}
                                              </span>
                                              {h.reason && (
                                                <span className="text-anga-text-secondary ml-1">
                                                  — {h.reason}
                                                </span>
                                              )}
                                              <p className="text-anga-text-secondary">
                                                {new Date(h.created_at).toLocaleString("en-IN")}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-anga-text-secondary text-center">
                                Failed to load order details
                              </p>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-anga-border">
                <p className="text-sm text-anga-text-secondary">
                  Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-anga-border text-sm text-anga-text-secondary hover:bg-anga-bg disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <span className="text-sm font-medium text-anga-text">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-anga-border text-sm text-anga-text-secondary hover:bg-anga-bg disabled:opacity-40 transition-colors"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
