"use client";
import { useState, useEffect, use } from "react";
import { ArrowLeft, Loader2, Package, Truck, CheckCircle2, Clock, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
}

interface StatusEvent {
  id: string;
  status: string;
  reason?: string;
  created_at: string;
}

interface OrderDetail {
  id: string;
  order_number: string;
  status: string;
  total: number;
  shipping_fee: number;
  tax_amount: number;
  address_id?: string;
  placed_at: string;
  items: OrderItem[];
  status_history: StatusEvent[];
  shipping_address?: Record<string, string>;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

function formatINR(v: number) {
  return "\u20B9" + v.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function SellerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  async function fetchOrder() {
    try {
      const res = await api.get<OrderDetail>(`/api/orders/seller/${id}`, { silent: true });
      setOrder(res || null);
    } catch {
      setOrder(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchOrder();
  }, [id]);

  async function updateStatus(newStatus: string) {
    setUpdating(true);
    try {
      await api.patch(`/api/orders/${id}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      await fetchOrder();
    } catch {
      toast.error("Failed to update status");
    }
    setUpdating(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[#1A6FD4]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm text-[#9CA3AF]">Order not found</p>
        <Link href="/seller/dashboard/orders" className="text-sm text-[#1A6FD4] font-medium hover:underline mt-2 inline-block">
          Back to Orders
        </Link>
      </div>
    );
  }

  const orderStatus = order.items[0]?.status || order.status;
  const sellerTotal = order.items.reduce((sum, i) => sum + i.total_price, 0);

  return (
    <div className="max-w-3xl">
      <Link href="/seller/dashboard/orders" className="inline-flex items-center gap-1 text-sm text-[#1A6FD4] font-medium hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A2E]">Order {order.order_number}</h1>
          <p className="text-sm text-[#9CA3AF]">Placed {formatDate(order.placed_at)}</p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold capitalize ${STATUS_COLORS[orderStatus] || "bg-gray-100 text-gray-800"}`}>
          {orderStatus}
        </span>
      </div>

      {/* Items */}
      <div className="rounded-xl border border-[#E8EEF4] bg-white mb-4 overflow-hidden">
        <div className="px-5 py-3 border-b border-[#E8EEF4] bg-[#F8FAFC]">
          <h2 className="text-sm font-semibold text-[#4B5563]">Your Items</h2>
        </div>
        <div className="divide-y divide-[#E8EEF4]">
          {order.items.map((item) => (
            <div key={item.id} className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-[#1A1A2E]">{item.product_name}</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">Qty: {item.quantity} x {formatINR(item.unit_price)}</p>
              </div>
              <p className="font-semibold text-[#1A1A2E]">{formatINR(item.total_price)}</p>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-[#E8EEF4] bg-[#F8FAFC] flex justify-between">
          <span className="text-sm font-semibold text-[#4B5563]">Subtotal (your items)</span>
          <span className="text-sm font-bold text-[#1A1A2E]">{formatINR(sellerTotal)}</span>
        </div>
      </div>

      {/* Status Actions */}
      <div className="rounded-xl border border-[#E8EEF4] bg-white p-5 mb-4">
        <h2 className="text-sm font-semibold text-[#4B5563] mb-3">Update Status</h2>
        <div className="flex flex-wrap gap-2">
          {orderStatus === "confirmed" && (
            <button
              disabled={updating}
              onClick={() => updateStatus("processing")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-[#1A1A2E] transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ background: "#FFCC00" }}
            >
              {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
              Mark Processing
            </button>
          )}
          {orderStatus === "processing" && (
            <button
              disabled={updating}
              onClick={() => updateStatus("shipped")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ background: "#1A6FD4" }}
            >
              {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
              Mark Shipped
            </button>
          )}
          {orderStatus === "shipped" && (
            <button
              disabled={updating}
              onClick={() => updateStatus("delivered")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50 bg-green-600 hover:bg-green-700"
            >
              {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Mark Delivered
            </button>
          )}
          {(orderStatus === "delivered" || orderStatus === "cancelled") && (
            <p className="text-sm text-[#9CA3AF]">No further status updates available.</p>
          )}
        </div>
      </div>

      {/* Status Timeline */}
      {order.status_history.length > 0 && (
        <div className="rounded-xl border border-[#E8EEF4] bg-white p-5">
          <h2 className="text-sm font-semibold text-[#4B5563] mb-3">Status History</h2>
          <div className="space-y-3">
            {order.status_history.map((event, i) => (
              <div key={event.id} className="flex items-start gap-3">
                <div className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${i === order.status_history.length - 1 ? "bg-[#1A6FD4]" : "bg-[#E8EEF4]"}`} />
                <div>
                  <p className="text-sm font-medium text-[#1A1A2E] capitalize">{event.status}</p>
                  {event.reason && <p className="text-xs text-[#9CA3AF]">{event.reason}</p>}
                  <p className="text-xs text-[#9CA3AF]">{formatDate(event.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
