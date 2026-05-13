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
  Package,
} from "lucide-react";
import toast from "react-hot-toast";

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
  { key: "all", label: "All Orders" },
  { key: "pending_payment", label: "Pending Payment" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_BADGE: Record<string, string> = {
  pending_payment: "bg-gray-100 text-gray-700 border-gray-200",
  confirmed: "bg-indigo-50 text-indigo-700 border-indigo-200",
  processing: "bg-yellow-50 text-yellow-700 border-yellow-200",
  shipped: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  returned: "bg-red-50 text-red-700 border-red-200",
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
  if (!s) return "Unknown";
  return s.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const STATUS_ACTIONS: Record<string, { next: string; label: string; color: string; icon: typeof Truck }[]> = {
  pending_payment: [
    { next: "confirmed", label: "Confirm", color: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200", icon: CheckCircle2 },
    { next: "cancelled", label: "Cancel", color: "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200", icon: XCircle },
  ],
  confirmed: [
    { next: "processing", label: "Process", color: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200", icon: Clock },
    { next: "cancelled", label: "Cancel", color: "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200", icon: XCircle },
  ],
  processing: [
    { next: "shipped", label: "Ship", color: "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200", icon: Truck },
  ],
  shipped: [
    { next: "delivered", label: "Delivered", color: "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200", icon: CheckCircle2 },
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
    <div className="p-4 sm:p-6 lg:p-8">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Orders Registry</h1>
          <p className="text-[15px] text-gray-500 font-medium">{total} total transaction{total !== 1 ? "s" : ""}</p>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center gap-3 w-full lg:w-auto">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-2xl shadow-sm w-full xl:w-auto overflow-x-auto no-scrollbar">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-[14px] font-bold transition-all ${
                  statusFilter === tab.key
                    ? "bg-[#8B5CF6] text-white shadow-md shadow-purple-500/20"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search order number..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full h-11 pl-10 pr-16 bg-white border border-gray-200 rounded-2xl text-[14px] font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm"
              />
              <button
                onClick={handleSearch}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-[13px] font-bold transition-colors"
              >
                Go
              </button>
            </div>
            
            {/* Dates */}
            <div className="flex items-center gap-2 p-1 bg-white border border-gray-200 rounded-2xl shadow-sm w-full sm:w-auto">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                className="h-9 w-full sm:w-auto px-3 bg-transparent text-[13px] font-bold text-gray-700 outline-none"
              />
              <span className="text-gray-300">-</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                className="h-9 w-full sm:w-auto px-3 bg-transparent text-[13px] font-bold text-gray-700 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-[#8B5CF6]" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <ShoppingCart className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-[20px] font-bold text-gray-900 mb-2">No Orders Found</h2>
          <p className="text-[15px] text-gray-500 font-medium">
            {search || fromDate || toDate
              ? "Try adjusting your filters"
              : "No orders match the selected status"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="w-12 px-4"></th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-center">Items</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Total</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Date</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((o) => (
                  <React.Fragment key={o.id}>
                    <tr
                      className={`hover:bg-gray-50/50 transition-colors cursor-pointer group ${expandedId === o.id ? 'bg-gray-50/50' : ''}`}
                      onClick={() => toggleExpand(o.id)}
                    >
                      <td className="px-4 py-4 text-center">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${expandedId === o.id ? 'bg-[#8B5CF6] text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600'}`}>
                          {expandedId === o.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-[14px] text-[#8B5CF6]">#{o.order_number}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14px] font-bold text-gray-900">{o.customer_name}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[14px] font-medium text-gray-600">{o.items_count}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-[15px] text-gray-900">{formatINR(o.total)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide ${STATUS_BADGE[o.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                          {capitalize(o.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[13px] font-medium text-gray-500">{formatDate(o.placed_at)}</span>
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          {(STATUS_ACTIONS[o.status] || []).map((action) => (
                            <button
                              key={action.next}
                              onClick={() => updateStatus(o.id, action.next)}
                              disabled={actionLoading === o.id}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all shadow-sm disabled:opacity-50 ${action.color}`}
                            >
                              {actionLoading === o.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <action.icon className="w-3.5 h-3.5" />
                              )}
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded detail */}
                    {expandedId === o.id && (
                      <tr key={`${o.id}-detail`} className="bg-gray-50/50 border-b border-gray-200">
                        <td colSpan={8} className="px-8 py-6">
                          {detailLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-8 h-8 animate-spin text-[#8B5CF6]" />
                            </div>
                          ) : expandedDetail ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              {/* Items */}
                              <div>
                                <h4 className="text-[14px] font-bold text-gray-900 mb-4 flex items-center gap-2">
                                  <Package className="w-4 h-4 text-[#8B5CF6]" /> Order Items ({expandedDetail.items.length})
                                </h4>
                                <div className="space-y-3">
                                  {expandedDetail.items.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-200 shadow-sm"
                                    >
                                      <div className="min-w-0 flex-1">
                                        <p className="text-[14px] font-bold text-gray-900 truncate mb-1">
                                          {item.product_name}
                                        </p>
                                        <p className="text-[13px] font-medium text-gray-500">
                                          Qty: {item.quantity} × {formatINR(item.unit_price)}
                                        </p>
                                      </div>
                                      <p className="text-[15px] font-black text-gray-900 ml-4">
                                        {formatINR(item.total_price)}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Customer + Timeline */}
                              <div className="space-y-6">
                                <div>
                                  <h4 className="text-[14px] font-bold text-gray-900 mb-4">Customer Details</h4>
                                  <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                                    <p className="text-[15px] font-bold text-gray-900 mb-1">
                                      {expandedDetail.customer.full_name}
                                    </p>
                                    <p className="text-[13px] font-medium text-gray-500">
                                      {expandedDetail.customer.email}
                                    </p>
                                    {expandedDetail.customer.phone && (
                                      <p className="text-[13px] font-medium text-gray-500 mt-1">
                                        {expandedDetail.customer.phone}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                {expandedDetail.status_history.length > 0 && (
                                  <div>
                                    <h4 className="text-[14px] font-bold text-gray-900 mb-4">
                                      Status History
                                    </h4>
                                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                                      <div className="space-y-4">
                                        {expandedDetail.status_history.map((h, i) => (
                                          <div key={i} className="flex gap-4 relative">
                                            {i !== expandedDetail.status_history.length - 1 && (
                                              <div className="absolute left-2 top-6 bottom-[-16px] w-[2px] bg-gray-100" />
                                            )}
                                            <div className="mt-1 w-4 h-4 rounded-full bg-[#8B5CF6] shrink-0 shadow-sm" />
                                            <div className="pb-2">
                                              <p className="text-[13px] font-bold text-gray-900">
                                                {capitalize(h.from_status)} <span className="text-gray-400 font-normal mx-1">&rarr;</span> {capitalize(h.to_status)}
                                              </p>
                                              {h.reason && (
                                                <p className="text-[13px] font-medium text-gray-500 mt-1">
                                                  Note: {h.reason}
                                                </p>
                                              )}
                                              <p className="text-[12px] font-medium text-gray-400 mt-1">
                                                {new Date(h.created_at).toLocaleString("en-IN")}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-[14px] font-medium text-gray-500 text-center py-8">
                              Failed to load order details.
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
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <span className="text-[13px] font-medium text-gray-500">
                Showing <span className="font-bold text-gray-900">{(page - 1) * limit + 1}</span>-
                <span className="font-bold text-gray-900">{Math.min(page * limit, total)}</span> of <span className="font-bold text-gray-900">{total}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-[13px] font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <div className="w-10 text-center text-[13px] font-black text-gray-900">{page}</div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-[13px] font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
