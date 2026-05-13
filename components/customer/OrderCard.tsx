import { useState } from "react";
import Link from "next/link";
import {
  PackageOpen, Download, Loader2, XCircle,
  RotateCcw, MapPin, FileText, Package,
  ShoppingBag, CheckCircle2, AlertTriangle
} from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export interface Order {
  internalId?: string;
  id: string;
  date: string;
  product: string;
  seller: string;
  qty: number;
  amount: number;
  status: "Delivered" | "Processing" | "Cancelled";
  rawStatus?: string;
  imageUrl?: string;
}

function formatINR(value: number) {
  return "₹" + value.toLocaleString("en-IN");
}

const statusConfig: Record<Order["status"], { bg: string; text: string; dot: string }> = {
  Delivered:  { bg: t.bgDelivered,  text: t.inStock,    dot: "#16A34A" },
  Processing: { bg: t.bgProcessing, text: t.lowStock,   dot: "#D97706" },
  Cancelled:  { bg: t.bgCancelled,  text: t.outOfStock, dot: "#DC2626" },
};

export default function OrderCard({ order, onCancelled }: { order: Order; onCancelled?: (id: string) => void }) {
  const s = statusConfig[order.status];
  const [imgError, setImgError] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const canCancel = order.status === "Processing" &&
    ["placed", "confirmed", "processing"].includes(order.rawStatus || "");

  const showImage = order.imageUrl && !imgError;

  // Est delivery: +5 days from order date for ALL active orders
  const orderDateMs = Date.parse(order.date);
  const estDeliveryStr = !isNaN(orderDateMs)
    ? new Date(orderDateMs + 5 * 86400000).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
    : "TBD";

  const handleCancel = async () => {
    if (!order.internalId || cancelling) return;
    setCancelling(true);
    try {
      await api.post(`/api/orders/${order.internalId}/cancel`, { reason: "Cancelled by customer" });
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
      const res = await api.get<{ url: string }>(`/api/orders/${order.internalId}/invoice`);
      if (res.url) window.open(res.url, "_blank");
    } catch {
      toast.error("Failed to download invoice. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <div
        className="flex flex-col rounded-2xl border overflow-hidden"
        style={{ background: t.bgCard, borderColor: t.border }}
      >
        {/* ── Top row: image + details + status ── */}
        <div className="flex items-start gap-3 p-4 sm:p-5">
          {/* Product thumbnail */}
          <div
            className="flex h-[68px] w-[68px] sm:h-[80px] sm:w-[80px] shrink-0 items-center justify-center rounded-xl overflow-hidden border border-gray-100"
            style={{ background: t.bgBlueTint }}
          >
            {showImage ? (
              <img
                src={order.imageUrl}
                alt={order.product}
                onError={() => setImgError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <PackageOpen className="h-7 w-7 sm:h-8 sm:w-8" style={{ color: t.bluePrimary, opacity: 0.4 }} />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            {/* Order ID — metadata weight: 11px muted */}
            <p className="text-[11px] font-medium mb-1 tabular-nums" style={{ color: t.textMuted }}>
              {order.id} · {order.date}
            </p>

            {/* Product name — headline weight */}
            <h3
              className="text-[14px] sm:text-[15px] font-bold leading-snug mb-1.5"
              style={{ color: t.textPrimary, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
            >
              {order.product}
            </h3>

            <div className="flex flex-wrap items-center gap-1.5 text-[12px]" style={{ color: t.textSecondary }}>
              <span>Qty: {order.qty}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span className="font-black text-[13px]" style={{ color: t.textPrimary }}>
                {formatINR(order.amount)}
              </span>
            </div>

            {/* Est. Delivery — persistent for ALL active orders */}
            {order.status === "Processing" && (
              <div className="flex items-center gap-1 mt-1.5">
                <Package className="w-3 h-3" style={{ color: t.bluePrimary }} />
                <p className="text-[11.5px] font-semibold" style={{ color: t.bluePrimary }}>
                  Est. delivery: {estDeliveryStr}
                </p>
              </div>
            )}
            {order.status === "Delivered" && (
              <div className="flex items-center gap-1 mt-1.5">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                <p className="text-[11.5px] font-semibold text-green-700">Delivered on {order.date}</p>
              </div>
            )}
          </div>

          {/* Status badge */}
          <div className="shrink-0 self-start mt-0.5">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider"
              style={{ background: s.bg, color: s.text }}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: s.dot }} />
              {order.status}
            </span>
          </div>
        </div>

        {/* ── Action bar ── */}
        <div
          className="flex items-center gap-2 px-4 sm:px-5 py-3 border-t"
          style={{ borderColor: t.border, background: "#FAFBFF" }}
        >
          {/* PRIMARY: Reorder (Delivered) or Track (Processing) */}
          {order.status === "Delivered" && (
            <>
              <button
                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12.5px] sm:text-[13px] font-bold transition-all active:scale-95 shadow-sm text-white"
                style={{ background: t.primaryCta }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reorder
              </button>
              <Link
                href={`/orders/${order.internalId || order.id}`}
                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12.5px] sm:text-[13px] font-bold border transition-all active:scale-95 hover:bg-gray-50"
                style={{ borderColor: t.border, color: t.textSecondary }}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Report Issue
              </Link>
            </>
          )}

          {order.status === "Processing" && (
            <button
              onClick={() => window.location.href = `/orders/${order.id}/track`}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12.5px] sm:text-[13px] font-bold border transition-all active:scale-95"
              style={{ borderColor: t.bluePrimary, color: t.bluePrimary, background: "#EAF2FF" }}
            >
              <MapPin className="w-3.5 h-3.5" />
              Track
            </button>
          )}

          {/* TERTIARY: Invoice — text link style */}
          {order.internalId && (
            <button
              onClick={handleDownloadInvoice}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-2 text-[12.5px] sm:text-[13px] font-semibold rounded-lg transition-colors hover:bg-gray-100 disabled:opacity-50"
              style={{ color: t.textSecondary }}
              title="Download Invoice"
            >
              {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              Invoice
            </button>
          )}

          {/* Cancel — far right, dangerous/muted */}
          {canCancel && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="ml-auto flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold rounded-lg transition-colors hover:bg-red-50"
              style={{ color: t.outOfStock }}
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancel
            </button>
          )}
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
                  className="flex-1 py-3 rounded-xl bg-red-600 text-[15px] font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {cancelling ? <Loader2 className="w-5 h-5 animate-spin" /> : "Yes, Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
