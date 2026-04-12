import { PackageOpen } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";

export interface Order {
  id: string;
  date: string;
  product: string;
  seller: string;
  qty: number;
  amount: number;
  status: "Delivered" | "Processing" | "Cancelled";
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

export default function OrderCard({ order }: { order: Order }) {
  const s = statusConfig[order.status];

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
      </div>
    </div>
  );
}
