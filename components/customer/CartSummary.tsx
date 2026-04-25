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
      className="rounded-[14px] border p-5 sticky top-28"
      style={{ background: t.bgCard, borderColor: t.border }}
    >
      <h3
        className="text-base font-semibold mb-4"
        style={{ color: t.textPrimary }}
      >
        Order Summary
      </h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span style={{ color: t.textSecondary }}>Subtotal</span>
          <span className="font-medium" style={{ color: t.textPrimary }}>
            {formatINR(subtotal)}
          </span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: t.textSecondary }}>GST (18%)</span>
          <span className="font-medium" style={{ color: t.textPrimary }}>
            {formatINR(gst)}
          </span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: t.textSecondary }}>Delivery</span>
          <span className="font-medium" style={{ color: t.textPrimary }}>
            {delivery === 0 ? "Free" : formatINR(delivery)}
          </span>
        </div>

        <div className="border-t pt-3" style={{ borderColor: t.border }}>
          <div className="flex justify-between">
            <span
              className="text-base font-semibold"
              style={{ color: t.textPrimary }}
            >
              Total
            </span>
            <span
              className="text-xl font-bold"
              style={{ color: t.textPrimary }}
            >
              {formatINR(total)}
            </span>
          </div>
        </div>
      </div>

      {delivery === 0 && (
        <p
          className="mt-3 text-xs font-medium"
          style={{ color: t.inStock }}
        >
          Free delivery on orders above ₹10,000
        </p>
      )}

      <button
        onClick={() => router.push("/checkout")}
        className="mt-5 flex w-full items-center justify-center rounded-[10px] py-3.5 text-base font-bold transition-opacity hover:opacity-90"
        style={{ background: t.yellowCta, color: t.ctaText }}
      >
        Proceed to Checkout
      </button>

      <Link
        href="/"
        className="mt-3 block text-center text-sm md:text-base font-medium transition-opacity hover:opacity-80"
        style={{ color: t.bluePrimary }}
      >
        Continue Shopping
      </Link>
    </div>
  );
}
