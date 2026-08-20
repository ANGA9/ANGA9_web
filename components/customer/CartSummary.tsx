"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ChevronRight } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { useAuth } from "@/lib/AuthContext";
import { useLoginSheet } from "@/lib/LoginSheetContext";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";

function formatINR(value: number) {
  return "\u20B9" + value.toLocaleString("en-IN");
}

interface CartSummaryProps {
  subtotal: number;
}

export default function CartSummary({ subtotal }: CartSummaryProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { open: openLoginSheet } = useLoginSheet();
  const gst = Math.round(subtotal * 0.18);
  const delivery = subtotal > 10000 ? 0 : 500;
  const total = subtotal + gst + delivery;

  const handleCheckout = () => {
    if (!user) {
      toast("Please login to place your order", { icon: <Lock size={18} color="#1A6FD4" /> });
      openLoginSheet();
      return;
    }
    router.push("/checkout");
  };

  return (
    <div
      className="rounded-xl border p-6 sticky top-28 bg-white"
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

      <Button
        variant="cta"
        size="lg"
        onClick={handleCheckout}
        className="mt-8 flex w-full h-[52px] text-[18px] font-black"
      >
        Proceed to Checkout
      </Button>

      {/* Minimalist 18% GST Invoicing Tag */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1A6FD4] font-bold text-[11px] uppercase tracking-wider shrink-0">
            GST Invoice
          </span>
          <span className="text-gray-500 font-medium truncate text-[12px]">
            Save 18% with GST credit
          </span>
        </div>
        <Link
          href="/account/business"
          className="text-[#1A6FD4] font-bold hover:underline shrink-0 text-[12px] flex items-center gap-0.5 transition-colors"
        >
          Add GSTIN <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <Link
        href="/"
        className="mt-3 block text-center text-sm font-bold transition-opacity hover:opacity-80"
        style={{ color: t.bluePrimary }}
      >
        ← Continue Shopping
      </Link>
    </div>
  );
}
