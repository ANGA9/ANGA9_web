import { useState } from "react";
import Link from "next/link";
import {
  PackageOpen, Download, Loader2, XCircle,
  RotateCcw, MapPin, FileText, Package,
  ShoppingBag, CheckCircle2, AlertTriangle,
  ChevronRight, Truck
} from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export interface OrderItem {
  name: string;
  qty: number;
  image?: string;
  price?: number;
}

export interface Order {
  internalId?: string;
  id: string;
  date: string;
  rawDate?: string;
  product: string;
  seller: string;
  qty: number;
  amount: number;
  status: "Delivered" | "Processing" | "Cancelled";
  rawStatus?: string;
  imageUrl?: string;
  items?: OrderItem[];
}

function formatINR(value: number) {
  return "₹" + value.toLocaleString("en-IN");
}export interface InvoiceOption {
  id?: string;
  invoiceNumber: string;
  invoiceType?: string;
  sellerId?: string | null;
  sellerName?: string;
  url: string;
  grandTotal?: number;
}

export default function OrderCard({ order, onCancelled }: { order: Order; onCancelled?: (id: string) => void }) {
  const [downloading, setDownloading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceOption[]>([]);
  const [refundMode, setRefundMode] = useState<"bank" | "coins">("bank");

  const canCancel = order.status === "Processing" &&
    order.rawDate &&
    (Date.now() - new Date(order.rawDate).getTime()) < 24 * 60 * 60 * 1000;

  // Est delivery: +5 days from order date
  const orderDateMs = Date.parse(order.date || order.rawDate || "");
  const estDeliveryStr = !isNaN(orderDateMs)
    ? new Date(orderDateMs + 5 * 86400000).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
    : "TBD";

  const handleCancel = async () => {
    if (!order.internalId || cancelling) return;
    try {
      setCancelling(true);
      await api.patch(`/api/orders/${order.internalId}/status`, { 
        status: "cancelled", 
        reason: "Cancelled by customer",
        refundMode 
      });
      toast.success("Order cancelled successfully");
      setShowCancelConfirm(false);
      onCancelled?.(order.internalId);
    } catch {
      toast.error("Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order.internalId || downloading) return;
    try {
      setDownloading(true);
      const res = await api.get<{ invoices?: InvoiceOption[]; url?: string }>(`/api/orders/${order.internalId}/invoices`);
      const list = res.invoices || (res.url ? [{ invoiceNumber: `INV-${order.id}`, url: res.url }] : []);
      
      if (list.length === 1 && list[0].url) {
        window.open(list[0].url, "_blank");
      } else if (list.length > 1) {
        setInvoices(list);
        setShowInvoiceModal(true);
      } else {
        // Fallback to legacy single invoice endpoint
        const single = await api.get<{ url: string }>(`/api/orders/${order.internalId}/invoice`);
        if (single.url) window.open(single.url, "_blank");
      }
    } catch {
      toast.error("Failed to download invoice. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const statusColor = order.status === "Delivered"
    ? { bg: "#F3F4F6", text: "#111827", dot: "#16A34A" }
    : order.status === "Cancelled"
    ? { bg: "#F3F4F6", text: "#6B7280", dot: "#6B7280" }
    : { bg: "#F3F4F6", text: "#111827", dot: "#2563EB" };

  const displayItems = order.items && order.items.length > 0 ? order.items : [{ name: order.product, qty: order.qty, image: order.imageUrl }];

  return (
    <>
      <div
        className="rounded-2xl border overflow-hidden bg-white hover:shadow-md transition-shadow"
        style={{ borderColor: t.border }}
      >
        {/* ── Order header bar ── */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b" style={{ borderColor: "#F3F4F6", background: "#FAFBFC" }}>
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            <span className="hidden md:inline text-[12px] md:text-[13px] font-semibold tabular-nums" style={{ color: t.textMuted }}>
              {order.id}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300 hidden md:block" />
            <span className="text-[12px] md:text-[13px] font-medium text-gray-900">
              {order.date}
            </span>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] md:text-[11px] font-bold uppercase tracking-wider shrink-0"
            style={{ background: statusColor.bg, color: statusColor.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: statusColor.dot }} />
            {order.status}
          </span>
        </div>

        {/* ── Product items ── */}
        <Link href={`/orders/${order.internalId || order.id}`} className="block">
          <div className="px-4 sm:px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {displayItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-2 -m-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                {/* Product image */}
                <div
                  className="w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] shrink-0 rounded-xl overflow-hidden border"
                  style={{ borderColor: "#F3F4F6", background: "#F8FBFF" }}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-7 h-7 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Product details */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-[14px] sm:text-[15px] md:text-[16px] font-semibold leading-snug mb-1"
                    style={{
                      color: t.textPrimary,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {item.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-[13px] md:text-[14px] mt-1">
                    <span className="text-gray-900 font-bold">Qty: {item.qty}</span>
                  </div>
                </div>

                {order.status === "Delivered" ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `/orders/${order.internalId || order.id}?report=true`;
                    }}
                    className="shrink-0 p-2 text-gray-400 hover:text-gray-800 transition-colors flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 md:opacity-100"
                    title="Report Issue with this item"
                  >
                    <ChevronRight className="w-5 h-5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Issue</span>
                  </button>
                ) : (
                  <ChevronRight className="w-5 h-5 shrink-0 text-gray-300 sm:block md:hidden hidden" />
                )}
              </div>
            ))}
          </div>
        </Link>

        {/* ── Delivery status bar ── */}
        {order.status === "Processing" && (
          <div className="mx-4 sm:mx-5 mb-3 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "#EFF6FF" }}>
            <Truck className="w-4 h-4 shrink-0" style={{ color: t.bluePrimary }} />
            <p className="text-[12px] md:text-[13px] font-semibold" style={{ color: t.bluePrimary }}>
              Estimated delivery by {estDeliveryStr}
            </p>
          </div>
        )}
        {order.status === "Delivered" && (
          <div className="mx-4 sm:mx-5 mb-3 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "#F0FDF4" }}>
            <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#16A34A" }} />
            <p className="text-[12px] md:text-[13px] font-semibold" style={{ color: "#16A34A" }}>
              Delivered on {order.date}
            </p>
          </div>
        )}

        {/* ── Order total + Action bar ── */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-2 px-4 sm:px-5 py-3 border-t"
          style={{ borderColor: "#F3F4F6" }}
        >
          {/* Total */}
          <div className="flex items-end justify-between sm:block">
            <span className="text-[11px] md:text-[12px] font-medium uppercase tracking-wide" style={{ color: t.textMuted }}>Total</span>
            <p className="text-[16px] sm:text-[18px] md:text-[20px] font-black" style={{ color: t.textPrimary }}>
              {formatINR(order.amount)}
            </p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
            {order.status === "Delivered" && (
              <>
                <button
                  className="flex items-center justify-center w-full sm:w-auto gap-1.5 rounded-lg px-3 sm:px-4 py-2 text-[12px] sm:text-[13px] md:text-[14px] font-semibold transition-all active:scale-95"
                  style={{ background: '#FFFFFF', border: '2px solid ' + t.bluePrimary, color: t.bluePrimary }}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reorder
                </button>
                <Link
                  href={`/orders/${order.internalId || order.id}`}
                  className="flex items-center justify-center w-full sm:w-auto gap-1.5 rounded-lg px-3 sm:px-4 py-2 text-[12px] sm:text-[13px] md:text-[14px] font-semibold border transition-all active:scale-95 hover:bg-gray-50"
                  style={{ borderColor: t.border, color: t.textSecondary }}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Report Issue</span>
                  <span className="sm:hidden">Issue</span>
                </Link>
              </>
            )}

            {order.status === "Processing" && (
              <button
                onClick={() => window.location.href = `/orders/${order.id}/track`}
                className="flex items-center justify-center w-full sm:w-auto gap-1.5 rounded-lg px-3 sm:px-4 py-2 text-[13px] sm:text-[14px] md:text-[15px] font-semibold transition-all active:scale-95"
                style={{ background: t.bgBlueTint, color: t.bluePrimary }}
              >
                <MapPin className="w-3.5 h-3.5" />
                Track
              </button>
            )}

            {order.internalId && (
              <button
                onClick={handleDownloadInvoice}
                disabled={downloading}
                className="flex items-center justify-center w-full sm:w-auto gap-1.5 rounded-lg px-3 sm:px-4 py-2 text-[13px] sm:text-[14px] md:text-[15px] font-semibold transition-all hover:bg-gray-50 border active:scale-95 disabled:opacity-50"
                style={{ color: t.textSecondary, borderColor: t.border }}
                title="Download Invoice"
              >
                {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                <span>Download Invoice</span>
              </button>
            )}

            {canCancel && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="flex items-center justify-center w-full sm:w-auto gap-1.5 px-3 py-2 text-[13px] font-semibold rounded-lg transition-colors hover:bg-red-50"
                style={{ color: "#DC2626" }}
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══════════ Cancel Confirmation Modal ══════════ */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">Cancel Order?</h3>
              <p className="text-[14px] text-gray-500 mb-6 leading-relaxed">
                Are you sure you want to cancel order <span className="font-bold text-gray-700">{order.id}</span>? This action cannot be undone.
              </p>

              {/* Refund Mode Selection */}
              <div className="w-full text-left mb-6">
                <label className="block text-[13px] font-bold text-gray-700 mb-2">How would you like your refund?</label>
                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${refundMode === 'bank' ? 'border-[#2563EB] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="refundMode" value="bank" checked={refundMode === 'bank'} onChange={() => setRefundMode('bank')} className="w-4 h-4 text-[#2563EB] focus:ring-[#2563EB]" />
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-gray-900">Original Payment Method</span>
                      <span className="text-[12px] text-gray-500">Refund to your bank account (3-5 days)</span>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${refundMode === 'coins' ? 'border-[#2563EB] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="refundMode" value="coins" checked={refundMode === 'coins'} onChange={() => setRefundMode('coins')} className="w-4 h-4 text-[#2563EB] focus:ring-[#2563EB]" />
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-gray-900">ANGA Coins (Instant)</span>
                      <span className="text-[12px] text-gray-500">Get 100% value as coins instantly</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex w-full gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-[15px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  No, Keep It
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 py-3 rounded-xl text-[15px] font-bold transition-colors disabled:opacity-70 flex items-center justify-center gap-2 bg-white border-2 border-red-600 text-red-600 hover:bg-red-50"
                >
                  {cancelling ? <Loader2 className="w-5 h-5 animate-spin" /> : "Yes, Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ Multi-Seller Invoice Download Modal ══════════ */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#1A6FD4]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-gray-900">Tax Invoices</h3>
                  <p className="text-[12px] text-gray-500">Select store invoice to download</p>
                </div>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 mb-6 max-h-[60vh] overflow-y-auto">
              {invoices.map((inv, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-100 bg-[#FAFBFC] hover:bg-blue-50/50 hover:border-blue-200 transition-all"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-[14px] font-bold text-gray-900 truncate">
                      {inv.sellerName || 'Store Tax Invoice'}
                    </p>
                    <p className="text-[12px] font-mono text-gray-500 truncate">
                      {inv.invoiceNumber}
                    </p>
                    {inv.grandTotal ? (
                      <p className="text-[12px] font-semibold text-gray-700 mt-0.5">
                        {formatINR(inv.grandTotal)}
                      </p>
                    ) : null}
                  </div>
                  <button
                    onClick={() => window.open(inv.url, "_blank")}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1A6FD4] text-white text-[13px] font-bold hover:bg-[#1559B3] active:scale-95 transition-all shadow-sm shadow-[#1A6FD4]/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  invoices.forEach(inv => {
                    if (inv.url) window.open(inv.url, "_blank");
                  });
                }}
                className="flex-1 py-3 rounded-xl bg-blue-50 text-[#1A6FD4] text-[14px] font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download All</span>
              </button>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="py-3 px-5 rounded-xl border border-gray-200 text-[14px] font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

