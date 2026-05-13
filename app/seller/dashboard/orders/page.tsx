"use client";
import { useState, useEffect } from "react";
import { ShoppingCart, Loader2, Package, Truck, CheckCircle2, Eye, Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
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
  product_image?: string;
}

interface SellerOrder {
  id: string;
  order_number: string;
  status: string;
  placed_at: string;
  items: OrderItem[];
}

const STATUS_TABS = [
  { key: "all", label: "All Orders" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_BADGE: Record<string, string> = {
  confirmed: "bg-indigo-50 text-indigo-600 border-indigo-200",
  processing: "bg-yellow-50 text-yellow-600 border-yellow-200",
  shipped: "bg-blue-50 text-blue-600 border-blue-200",
  delivered: "bg-green-50 text-green-600 border-green-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
  pending: "bg-gray-100 text-gray-600 border-gray-200",
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
      toast.success(`Order marked as ${newStatus}`, {
        style: { borderRadius: '16px', background: '#333', color: '#fff' }
      });
      await fetchOrders();
    } catch {
      toast.error("Failed to update status", {
        style: { borderRadius: '16px' }
      });
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
    <main className="w-full mx-auto max-w-7xl px-3 sm:px-4 py-6 md:px-8 md:py-10 text-[#1A1A2E]">
      
      {/* ── Desktop Header ── */}
      <div className="hidden md:flex items-center justify-between mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Orders</h1>
          <p className="text-[15px] text-gray-500 font-medium">Manage and fulfill your customer orders.</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 px-5 py-3 shadow-sm flex items-center gap-3">
          <ShoppingCart className="w-5 h-5 text-gray-400" />
          <div className="flex flex-col">
            <span className="text-[18px] font-bold text-gray-900 leading-none">{allOrders.length}</span>
            <span className="text-[12px] font-medium text-gray-500">Total Orders</span>
          </div>
        </div>
      </div>

      {/* ── Mobile Header ── */}
      <div className="md:hidden flex flex-col gap-1 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold tracking-tight text-gray-900">Orders</h1>
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[13px] font-bold">{allOrders.length}</span>
        </div>
        <p className="text-[14px] text-gray-500 font-medium">Manage your fulfillment.</p>
      </div>

      {/* ── Filters Bar ── */}
      <div className="bg-white rounded-3xl border border-gray-200 p-4 md:p-5 mb-6 shadow-sm flex flex-col xl:flex-row gap-5 items-start xl:items-center justify-between">
        <div className="flex gap-2 overflow-x-auto no-scrollbar w-full xl:w-auto pb-1 xl:pb-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`rounded-full px-5 py-2.5 text-[14px] font-bold transition-all active:scale-[0.98] whitespace-nowrap shrink-0 ${
                statusFilter === tab.key
                  ? "bg-gray-900 text-white shadow-md"
                  : "bg-gray-50 text-gray-500 border border-transparent hover:border-gray-200 hover:bg-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-[320px]">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-3 text-[14px] font-medium text-gray-900 outline-none focus:bg-white focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={handleSearch}
            className="rounded-2xl bg-gray-900 px-5 py-3 text-[14px] font-bold text-white transition-all hover:bg-gray-800 active:scale-[0.98] shrink-0"
          >
            Search
          </button>
        </div>
      </div>

      {/* ── Content Area ── */}
      {loading ? (
        <div className="rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4 px-6 py-6 border-b border-gray-100 last:border-b-0">
              <div className="w-16 h-16 rounded-xl bg-gray-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 w-1/4 rounded bg-gray-100 animate-pulse" />
                <div className="h-3 w-1/3 rounded bg-gray-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100">
            <Inbox className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-[18px] font-bold text-gray-900 mb-2">
            {search || statusFilter !== "all" ? "No orders found" : "No orders yet"}
          </h3>
          <p className="max-w-md text-[14px] font-medium text-gray-500 leading-relaxed">
            {search || statusFilter !== "all"
              ? "Try adjusting your filters or searching for a different order ID."
              : "When customers purchase your products, their orders will appear here for you to fulfill."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[20%]">Order ID</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[35%]">Products</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[15%]">Total</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[15%]">Status</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right w-[15%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((order) => {
                  const totalAmount = order.items.reduce((sum, item) => sum + item.total_price, 0);
                  const orderStatus = order.items[0]?.status || order.status;
                  const primaryItem = order.items[0];

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <Link href={`/seller/dashboard/orders/${order.id}`} className="text-[15px] font-bold text-[#1A6FD4] hover:underline mb-1">
                            #{order.order_number}
                          </Link>
                          <span className="text-[13px] font-medium text-gray-400">
                            {new Date(order.placed_at).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 overflow-hidden">
                            {primaryItem?.product_image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={primaryItem.product_image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-gray-900 truncate max-w-[200px]">
                              {primaryItem?.product_name || "Unknown Product"}
                            </p>
                            <p className="text-[13px] font-medium text-gray-500 mt-0.5">
                              Qty: {primaryItem?.quantity}
                              {order.items.length > 1 && (
                                <span className="text-[#1A6FD4] font-bold ml-2">
                                  +{order.items.length - 1} more item{order.items.length - 1 !== 1 ? "s" : ""}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-bold text-[15px] text-gray-900">
                          {formatINR(totalAmount)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold border uppercase tracking-wide ${
                          STATUS_BADGE[orderStatus] || "bg-gray-100 text-gray-600 border-gray-200"
                        }`}>
                          {orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/seller/dashboard/orders/${order.id}`}
                            className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-[#1A6FD4] hover:border-[#1A6FD4] hover:shadow-sm transition-all active:scale-95"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          
                          {/* Quick Action Button based on status */}
                          {orderStatus === "confirmed" && (
                            <button
                              disabled={updating === order.id}
                              onClick={() => updateStatus(order.id, "processing")}
                              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-[13px] transition-all shadow-sm active:scale-95 disabled:opacity-50"
                            >
                              {updating === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                              Process
                            </button>
                          )}
                          {orderStatus === "processing" && (
                            <button
                              disabled={updating === order.id}
                              onClick={() => updateStatus(order.id, "shipped")}
                              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#1A6FD4] hover:bg-[#155bb5] text-white font-bold text-[13px] transition-all shadow-sm active:scale-95 disabled:opacity-50"
                            >
                              {updating === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                              Ship
                            </button>
                          )}
                          {orderStatus === "shipped" && (
                            <button
                              disabled={updating === order.id}
                              onClick={() => updateStatus(order.id, "delivered")}
                              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-[13px] transition-all shadow-sm active:scale-95 disabled:opacity-50"
                            >
                              {updating === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              Deliver
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

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <p className="text-[14px] font-medium text-gray-500 hidden sm:block">
                Showing <span className="font-bold text-gray-900">{(page - 1) * limit + 1}</span> to <span className="font-bold text-gray-900">{Math.min(page * limit, filtered.length)}</span> of <span className="font-bold text-gray-900">{filtered.length}</span>
              </p>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[14px] font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-all active:scale-[0.98] shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <span className="text-[14px] font-bold text-gray-900 sm:hidden">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[14px] font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-all active:scale-[0.98] shadow-sm"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
