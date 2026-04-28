import { useState } from "react";
import { PackageOpen, Download, Loader2, XCircle } from "lucide-react";
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
  return "\u20B9" + value.toLocaleString("en-IN");
}

const statusConfig: Record<
  Order["status"],
  { bg: string; text: string }
> = {
  Delivered: { bg: t.bgDelivered, text: t.inStock },
  Processing: { bg: t.bgProcessing, text: t.lowStock },
  Cancelled: { bg: t.bgCancelled, text: t.outOfStock },
};

export default function OrderCard({ order, onCancelled }: { order: Order; onCancelled?: (id: string) => void }) {
  const s = statusConfig[order.status];
  const [downloading, setDownloading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const canCancel = order.status === "Processing" &&
    ["placed", "confirmed", "processing"].includes(order.rawStatus || "");

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
      if (res.url) {
        window.open(res.url, "_blank");
      }
    } catch (error) {
      console.error("Failed to download invoice:", error);
      alert("Failed to download invoice. Please try again later.");
    } finally {
      setDownloading(false);
    }
  };

  // Mock estimated delivery for processing orders (5 days from order date)
  const estDelivery = new Date(order.date);
  if (!isNaN(estDelivery.getTime())) {
    estDelivery.setDate(estDelivery.getDate() + 5);
  }
  const estDeliveryStr = !isNaN(estDelivery.getTime()) ? estDelivery.toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "TBD";

  return (
    <>
      <div
        className="flex flex-col gap-4 rounded-xl border p-4 sm:px-5"
        style={{ background: t.bgCard, borderColor: t.border }}
      >
        <div className="flex flex-row items-start sm:items-center gap-4">
          {/* Product Image */}
          <div
            className="flex h-[80px] w-[80px] shrink-0 items-center justify-center rounded-xl overflow-hidden border border-gray-100"
            style={{ background: t.bgBlueTint }}
          >
            {order.imageUrl ? (
              <img src={order.imageUrl} alt={order.product} className="h-full w-full object-cover" />
            ) : (
              <PackageOpen className="h-8 w-8" style={{ color: t.bluePrimary, opacity: 0.5 }} />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] mb-1 font-bold tracking-wide uppercase" style={{ color: t.textSecondary }}>
              {order.id} &middot; {order.date}
            </p>
            <h3
              className="text-[15px] sm:text-[16px] font-bold leading-tight truncate mb-1.5"
              style={{ color: t.textPrimary }}
            >
              {order.product}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-[13px]" style={{ color: t.textSecondary }}>
              <span>Qty: {order.qty}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span className="font-black" style={{ color: t.textPrimary }}>
                {formatINR(order.amount)}
              </span>
              {order.seller && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className="truncate max-w-[100px]">{order.seller}</span>
                </>
              )}
            </div>
            {order.status === "Processing" && (
              <p className="text-[12px] font-semibold mt-1.5" style={{ color: t.bluePrimary }}>
                Est. Delivery: {estDeliveryStr}
              </p>
            )}
          </div>
          
          {/* Status badge on Desktop */}
          <div className="hidden sm:block shrink-0 self-start mt-1">
            <span
              className="inline-flex rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider"
              style={{ background: s.bg, color: s.text }}
            >
              {order.status}
            </span>
          </div>
        </div>

        {/* Status (Mobile) + Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-1 border-t" style={{ borderColor: t.border }}>
          {/* Status badge on Mobile */}
          <div className="sm:hidden">
            <span
              className="inline-flex rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider"
              style={{ background: s.bg, color: s.text }}
            >
              {order.status}
            </span>
          </div>

          <div className="flex flex-1 sm:flex-none justify-end gap-2.5 ml-auto">
            {(order.status === "Processing" || order.status === "Delivered") && (
              <button
                onClick={() => window.location.href = `/orders/${order.id}/track`}
                className="text-[13px] font-bold transition-opacity hover:opacity-80 px-2"
                style={{ color: t.bluePrimary }}
              >
                Track
              </button>
            )}

            {order.status === "Delivered" && (
              <button
                className="rounded-lg px-4 py-2 text-[13px] font-bold transition-opacity hover:opacity-90 shadow-sm"
                style={{ background: t.primaryCta, color: t.ctaText }}
              >
                Reorder
              </button>
            )}

            {/* Invoice Download Button */}
            {order.internalId && (
              <button
                onClick={handleDownloadInvoice}
                disabled={downloading}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-bold transition-colors hover:bg-gray-50 disabled:opacity-50 bg-white"
                style={{ borderColor: t.border, color: t.textPrimary }}
                title="Download Invoice"
              >
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Invoice
              </button>
            )}

            {canCancel && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-bold transition-colors hover:bg-red-50 bg-white"
                style={{ borderColor: "#FECACA", color: t.outOfStock }}
              >
                <XCircle className="w-4 h-4" /> Cancel
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
