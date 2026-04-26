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

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-[14px] border p-4 sm:px-5"
      style={{ background: t.bgCard, borderColor: t.border }}
    >
      {/* Icon */}
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
        style={{ background: t.bgBlueTint }}
      >
        <PackageOpen className="h-6 w-6" style={{ color: t.bluePrimary }} />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-xs mb-0.5" style={{ color: t.textMuted }}>
          {order.id} &middot; {order.date}
        </p>
        <h3
          className="text-sm font-semibold truncate"
          style={{ color: t.textPrimary }}
        >
          {order.product}
        </h3>
        <p className="text-xs mt-0.5" style={{ color: t.textSecondary }}>
          Qty: {order.qty} &middot;{" "}
          <span className="font-medium" style={{ color: t.textPrimary }}>
            {formatINR(order.amount)}
          </span>{" "}
          &middot; {order.seller}
        </p>
      </div>

      {/* Status + actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <span
          className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{ background: s.bg, color: s.text }}
        >
          {order.status}
        </span>

        {(order.status === "Processing" || order.status === "Delivered") && (
          <button
            className="text-xs font-semibold transition-opacity hover:opacity-80"
            style={{ color: t.bluePrimary }}
          >
            Track Order
          </button>
        )}

        {order.status === "Delivered" && (
          <button
            className="rounded-lg px-3 py-1.5 text-xs font-bold transition-opacity hover:opacity-90"
            style={{ background: t.yellowCta, color: t.ctaText }}
          >
            Reorder
          </button>
        )}

        {/* Invoice Download Button */}
        {order.internalId && (
          <button
            onClick={handleDownloadInvoice}
            disabled={downloading}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ borderColor: t.border, color: t.textSecondary }}
            title="Download Invoice"
          >
            {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Invoice
          </button>
        )}

        {canCancel && (
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors hover:bg-red-50"
            style={{ borderColor: "#FECACA", color: t.outOfStock }}
          >
            <XCircle className="w-3.5 h-3.5" /> Cancel
          </button>
        )}
      </div>

      {showCancelConfirm && (
        <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: t.border }}>
          <p className="text-xs" style={{ color: t.textSecondary }}>Are you sure you want to cancel this order?</p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="px-3 py-1.5 rounded-lg border text-xs font-bold"
              style={{ borderColor: t.border, color: t.textSecondary }}
            >
              No, Keep
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-50"
              style={{ background: t.outOfStock }}
            >
              {cancelling ? <Loader2 className="w-3 h-3 animate-spin inline" /> : "Yes, Cancel"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
