"use client";
import { useState, useEffect, use } from "react";
import { ArrowLeft, Loader2, Package, Truck, CheckCircle2, Clock, MapPin, Receipt, History } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
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
  confirmed: "bg-indigo-50 text-indigo-700 border-indigo-200",
  processing: "bg-yellow-50 text-yellow-700 border-yellow-200",
  shipped: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  pending: "bg-gray-100 text-gray-700 border-gray-200",
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
      toast.success(`Order marked as ${newStatus}`, {
        style: { borderRadius: '16px', background: '#333', color: '#fff' }
      });
      await fetchOrder();
    } catch {
      toast.error("Failed to update status", { style: { borderRadius: '16px' } });
    }
    setUpdating(false);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4] mb-4" />
        <span className="text-[15px] font-medium">Loading order details...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-6 shadow-sm">
          <Package className="w-10 h-10 text-gray-300" />
        </div>
        <h1 className="text-[24px] font-bold text-gray-900 mb-3">Order Not Found</h1>
        <p className="text-[15px] text-gray-500 font-medium leading-relaxed mb-6">
          The order you are looking for does not exist or you do not have permission to view it.
        </p>
        <Link href="/seller/dashboard/orders" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1A6FD4] px-6 py-3 text-[15px] font-bold text-white transition-all shadow-md hover:shadow-lg hover:bg-[#155bb5] active:scale-[0.98]">
          <ArrowLeft className="w-5 h-5" /> Back to Orders
        </Link>
      </div>
    );
  }

  const orderStatus = order.items[0]?.status || order.status;
  const sellerTotal = order.items.reduce((sum, i) => sum + i.total_price, 0);

  return (
    <main className="w-full mx-auto max-w-6xl px-3 sm:px-4 py-6 md:px-8 md:py-10 text-[#1A1A2E]">
      
      <Link href="/seller/dashboard/orders" className="inline-flex items-center gap-1.5 text-[14px] font-bold text-gray-500 hover:text-[#1A6FD4] transition-colors mb-6 group">
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Orders
      </Link>

      {/* ── Desktop Header ── */}
      <div className="hidden md:flex items-center justify-between mb-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Order #{order.order_number}</h1>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[13px] font-bold border uppercase tracking-wide ${STATUS_COLORS[orderStatus] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
              {orderStatus}
            </span>
          </div>
          <p className="text-[15px] text-gray-500 font-medium flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Placed {formatDate(order.placed_at)}
          </p>
        </div>
      </div>

      {/* ── Mobile Header ── */}
      <div className="md:hidden flex flex-col gap-2 mb-6">
        <h1 className="text-[24px] font-bold tracking-tight text-gray-900">#{order.order_number}</h1>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[12px] font-bold border uppercase tracking-wide ${STATUS_COLORS[orderStatus] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
            {orderStatus}
          </span>
          <p className="text-[13px] text-gray-500 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {new Date(order.placed_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        
        {/* ── Left Column (Order Items) ── */}
        <div className="flex-1 max-w-4xl space-y-6 md:space-y-8">
          <section className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#1A6FD4]" />
              <h2 className="text-[18px] font-bold text-gray-900">Order Items</h2>
            </div>
            
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.product_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-bold text-gray-900 mb-1 line-clamp-2">{item.product_name}</p>
                    <p className="text-[14px] font-medium text-gray-500">
                      Qty: {item.quantity} × <span className="font-bold text-gray-700">{formatINR(item.unit_price)}</span>
                    </p>
                  </div>
                  <div className="sm:text-right w-full sm:w-auto mt-2 sm:mt-0 flex justify-between sm:block border-t border-gray-100 sm:border-0 pt-3 sm:pt-0">
                    <span className="text-[13px] font-bold text-gray-400 sm:hidden uppercase">Item Total</span>
                    <p className="text-[18px] font-bold text-gray-900">{formatINR(item.total_price)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-5 bg-gray-50/80 border-t border-gray-200 flex items-center justify-between">
              <span className="text-[15px] font-bold text-gray-600">Subtotal (Your Items)</span>
              <span className="text-[20px] font-bold text-gray-900">{formatINR(sellerTotal)}</span>
            </div>
          </section>

          {/* Shipping Address Section if needed in the future... */}
        </div>

        {/* ── Right Column (Actions & Timeline) ── */}
        <div className="hidden lg:block w-[340px] shrink-0">
          <div className="sticky top-[104px] flex flex-col gap-6">
            
            {/* Action Card */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-[16px] font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#1A6FD4]" /> Fulfillment
              </h3>
              
              <div className="flex flex-col gap-3">
                {orderStatus === "confirmed" && (
                  <>
                    <p className="text-[13px] text-gray-500 font-medium mb-1">
                      Ready to process this order?
                    </p>
                    <button
                      disabled={updating}
                      onClick={() => updateStatus("processing")}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-500 hover:bg-yellow-600 px-6 py-4 text-[15px] font-bold text-white transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                    >
                      {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Package className="w-5 h-5" />}
                      Mark as Processing
                    </button>
                  </>
                )}
                {orderStatus === "processing" && (
                  <>
                    <p className="text-[13px] text-gray-500 font-medium mb-1">
                      Order packed and handed to courier?
                    </p>
                    <button
                      disabled={updating}
                      onClick={() => updateStatus("shipped")}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1A6FD4] hover:bg-[#155bb5] px-6 py-4 text-[15px] font-bold text-white transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                    >
                      {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Truck className="w-5 h-5" />}
                      Mark as Shipped
                    </button>
                  </>
                )}
                {orderStatus === "shipped" && (
                  <>
                    <p className="text-[13px] text-gray-500 font-medium mb-1">
                      Has the customer received the package?
                    </p>
                    <button
                      disabled={updating}
                      onClick={() => updateStatus("delivered")}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-green-500 hover:bg-green-600 px-6 py-4 text-[15px] font-bold text-white transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                    >
                      {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                      Mark as Delivered
                    </button>
                  </>
                )}
                {(orderStatus === "delivered" || orderStatus === "cancelled") && (
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center gap-2 text-gray-500">
                    <CheckCircle2 className="w-5 h-5 text-gray-400" />
                    <span className="text-[14px] font-bold">Fulfillment Complete</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Card */}
            {order.status_history.length > 0 && (
              <div className="bg-[#F8FBFF] rounded-3xl border border-blue-100 p-6 shadow-sm">
                <h3 className="text-[16px] font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <History className="w-5 h-5 text-[#1A6FD4]" /> Order Timeline
                </h3>
                <div className="relative pl-3 border-l-2 border-blue-100 space-y-6">
                  {order.status_history.map((event, i) => (
                    <div key={event.id} className="relative">
                      <div className={`absolute -left-[18px] top-1 w-3 h-3 rounded-full border-2 border-white ${i === order.status_history.length - 1 ? "bg-[#1A6FD4]" : "bg-blue-300"}`} />
                      <div className="flex flex-col">
                        <p className="text-[14px] font-bold text-gray-900 capitalize">{event.status}</p>
                        {event.reason && <p className="text-[13px] text-gray-500 font-medium mt-0.5">{event.reason}</p>}
                        <p className="text-[12px] text-gray-400 font-medium mt-1">{formatDate(event.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Actions Bottom Bar */}
        <div className="lg:hidden pb-10">
          <h3 className="text-[16px] font-bold text-gray-900 mb-4 px-2">Update Status</h3>
          <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm">
            {orderStatus === "confirmed" && (
              <button
                disabled={updating}
                onClick={() => updateStatus("processing")}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-500 px-6 py-4 text-[15px] font-bold text-white transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Package className="w-5 h-5" />}
                Mark Processing
              </button>
            )}
            {orderStatus === "processing" && (
              <button
                disabled={updating}
                onClick={() => updateStatus("shipped")}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1A6FD4] px-6 py-4 text-[15px] font-bold text-white transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Truck className="w-5 h-5" />}
                Mark Shipped
              </button>
            )}
            {orderStatus === "shipped" && (
              <button
                disabled={updating}
                onClick={() => updateStatus("delivered")}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-green-500 px-6 py-4 text-[15px] font-bold text-white transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                Mark Delivered
              </button>
            )}
            {(orderStatus === "delivered" || orderStatus === "cancelled") && (
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center gap-2 text-gray-500">
                <CheckCircle2 className="w-5 h-5 text-gray-400" />
                <span className="text-[14px] font-bold">Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
