"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";

function formatINR(value: number) {
  return "\u20B9" + value.toLocaleString("en-IN");
}

interface CartSummaryProps {
  subtotal: number;
}

export default function CartSummary({ subtotal }: CartSummaryProps) {
  const router = useRouter();
  const gst = Math.round(subtotal * 0.18);
  const delivery = subtotal > 10000 ? 0 : 500;
  const total = subtotal + gst + delivery;

  return (
    <div
      className="rounded-xl border p-6 sticky top-28 bg-gray-100/80"
      style={{ borderColor: t.border }}
    >
      <h3
        className="text-[15px] font-black mb-6 uppercase tracking-wider"
        style={{ color: t.textPrimary }}
      >
        Price Details
      </h3>

      <div className="space-y-4 text-[15px]">
        <div className="flex justify-between">
          <span style={{ color: t.textSecondary }}>Subtotal</span>
          <span className="font-bold" style={{ color: t.textPrimary }}>
            {formatINR(subtotal)}
          </span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: t.textSecondary }}>GST (18%)</span>
          <span className="font-bold" style={{ color: t.textPrimary }}>
            {formatINR(gst)}
          </span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: t.textSecondary }}>Delivery Charges</span>
          <span className="font-bold" style={{ color: delivery === 0 ? t.inStock : t.textPrimary }}>
            {delivery === 0 ? "FREE" : formatINR(delivery)}
          </span>
        </div>

        <div className="border-t border-gray-300 pt-5 mt-2" style={{ borderColor: t.border }}>
          <div className="flex justify-between items-end">
            <span
              className="text-[17px] font-black"
              style={{ color: t.textPrimary }}
            >
              Total Amount
            </span>
            <span
              className="text-[22px] font-black leading-none tracking-tight"
              style={{ color: t.textPrimary }}
            >
              {formatINR(total)}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push("/checkout")}
        className="mt-8 flex w-full items-center justify-center rounded-xl h-[52px] text-[18px] font-black transition-all active:scale-[0.98] shadow-lg shadow-indigo-100"
        style={{ background: t.primaryCta, color: t.ctaText }}
      >
        Proceed to Checkout
      </button>

      <Link
        href="/"
        className="mt-4 block text-center text-sm font-bold transition-opacity hover:opacity-80"
        style={{ color: t.bluePrimary }}
      >
        Continue Shopping
      </Link>
    </div>
  );
}
