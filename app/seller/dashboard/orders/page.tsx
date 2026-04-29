"use client";
import { useState, useEffect, useCallback } from "react";
import { ShoppingCart, Loader2, Package, Truck, CheckCircle2, Eye, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
}

interface SellerOrder {
  id: string;
  order_number: string;
  status: string;
  placed_at: string;
  items: OrderItem[];
}

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_BADGE: Record<string, string> = {
  confirmed: "bg-[#EDE9FE] text-[#6366F1]",
  processing: "bg-[#FFFBEB] text-[#F59E0B]",
  shipped: "bg-[#EAF2FF] text-[#1A6FD4]",
  delivered: "bg-[#F0FDF4] text-[#22C55E]",
  cancelled: "bg-[#FEF2F2] text-[#EF4444]",
  pending: "bg-[#F3F4F6] text-[#9CA3AF]",
};

function formatINR(value: number) {
  return "\u20B9" + value.toLocaleString("en-IN");
}

export default function OrdersPage() {
  const [allOrders, setAllOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 15;

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const res = await api.get<{ orders: SellerOrder[] }>("/api/orders/seller");
      setAllOrders(res.orders || []);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId: string, newStatus: string) {
    try {
      setUpdating(orderId);
      await api.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      await fetchOrders();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  }

  const filtered = allOrders.filter((o) => {
    const orderStatus = o.items[0]?.status || o.status;
    if (statusFilter !== "all" && orderStatus !== statusFilter) return false;
    if (search && !o.order_number.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const handleTabChange = (key: string) => {
    setPage(1);
    setStatusFilter(key);
  };

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-[#1A1A2E] mb-1">Orders</h1>
      <p className="text-sm md:text-base text-[#9CA3AF] mb-6">
        {filtered.length} order{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E8EEF4] p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                  statusFilter === tab.key
                    ? "bg-[#1A6FD4] text-white"
                    : "text-[#9CA3AF] hover:bg-[#F8FBFF]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search order number..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-9 w-full rounded-lg border border-[#E8EEF4] bg-white pl-9 pr-3 text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF]/60 focus:border-[#1A6FD4] focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/10 transition-colors"
              />
            </div>
            <button
              onClick={handleSearch}
              className="h-9 px-4 rounded-lg bg-[#1A6FD4] text-white text-sm font-medium hover:bg-[#155bb5] transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4]" />
        </div>
      ) : paginated.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E8EEF4] p-12 text-center">
          <ShoppingCart className="w-12 h-12 text-[#E8EEF4] mx-auto mb-4" />
          <h2 className="text-base md:text-lg font-bold text-[#1A1A2E] mb-2">
            {search || statusFilter !== "all" ? "No Orders Found" : "No Orders Yet"}
          </h2>
          <p className="text-sm md:text-base text-[#9CA3AF]">
            {search || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Orders will appear here once customers purchase your products"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E8EEF4] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base">
              <thead>
                <tr className="bg-[#F8FBFF] border-b border-[#E8EEF4]">
                  <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Order</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Products</th>
                  <th className="text-right px-4 py-3 font-semibold text-[#4B5563]">Total</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Date</th>
                  <th className="text-right px-4 py-3 font-semibold text-[#4B5563]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((order) => {
                  const totalAmount = order.items.reduce((sum, item) => sum + item.total_price, 0);
                  const orderStatus = order.items[0]?.status || order.status;
                  return (
                    <tr key={order.id} className="border-b border-[#E8EEF4] last:border-0 hover:bg-[#F8FBFF]/50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/seller/dashboard/orders/${order.id}`} className="text-sm font-bold text-[#1A6FD4] hover:underline">
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {order.items.slice(0, 2).map((item) => (
                            <div key={item.id} className="text-sm">
                              <span className="font-medium text-[#1A1A2E]">{item.product_name}</span>
                              <span className="text-[#9CA3AF] ml-1">x{item.quantity}</span>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-xs text-[#9CA3AF]">+{order.items.length - 2} more</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#1A1A2E]">
                        {formatINR(totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          STATUS_BADGE[orderStatus] || "bg-[#F3F4F6] text-[#9CA3AF]"
                        }`}>
                          {orderStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#9CA3AF] text-sm">
                        {new Date(order.placed_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col gap-2 items-end">
                          <Link
                            href={`/seller/dashboard/orders/${order.id}`}
                            className="flex items-center justify-center gap-1.5 bg-[#EAF2FF] hover:bg-[#D6E8FF] text-[#1A6FD4] text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors"
                          >
                            <Eye className="w-3 h-3" /> View
                          </Link>
                          {orderStatus === "confirmed" && (
                            <button
                              disabled={updating === order.id}
                              onClick={() => updateStatus(order.id, "processing")}
                              className="flex items-center justify-center gap-1.5 bg-[#FFCC00] hover:bg-[#F5B800] text-[#1A1A2E] text-xs font-bold py-1.5 px-3 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {updating === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Package className="w-3 h-3" />}
                              Process
                            </button>
                          )}
                          {orderStatus === "processing" && (
                            <button
                              disabled={updating === order.id}
                              onClick={() => updateStatus(order.id, "shipped")}
                              className="flex items-center justify-center gap-1.5 bg-[#1A6FD4] hover:bg-[#155bb5] text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {updating === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Truck className="w-3 h-3" />}
                              Ship
                            </button>
                          )}
                          {orderStatus === "shipped" && (
                            <button
                              disabled={updating === order.id}
                              onClick={() => updateStatus(order.id, "delivered")}
                              className="flex items-center justify-center gap-1.5 bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {updating === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                              Delivered
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#E8EEF4]">
              <p className="text-sm text-[#9CA3AF]">
                Showing {(page - 1) * limit + 1}-{Math.min(page * limit, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E8EEF4] text-sm text-[#9CA3AF] hover:bg-[#F8FBFF] disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <span className="text-sm font-medium text-[#1A1A2E]">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E8EEF4] text-sm text-[#9CA3AF] hover:bg-[#F8FBFF] disabled:opacity-40 transition-colors"
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
