"use client";

import { useCart } from "@/lib/CartContext";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { EmptyOrdersIllustration } from "./EmptyOrdersIllustration";

export function LoggedOutState({ 
  title = "Please login", 
  desc = "Login to view this page and continue shopping.",
  illustration = "orders"
}: { 
  title?: string, 
  desc?: string,
  illustration?: "orders" | "help" | "notifications" | "privacy"
}) {
  const { openLoginSheet } = useCart();
  return (
    <div className="flex flex-col items-center justify-center pt-8 pb-16 md:pt-12 md:pb-24 text-center px-4 w-full h-full min-h-[60vh]">
      <EmptyOrdersIllustration type={illustration} />
      <h3 className="text-[17px] md:text-[20px] font-semibold mb-2 mt-2" style={{ color: t.textPrimary }}>{title}</h3>
      <p className="text-[13px] md:text-[15px] mb-5 max-w-[280px] mx-auto" style={{ color: t.textMuted }}>{desc}</p>
      <button
        onClick={() => openLoginSheet()}
        className="rounded-full md:rounded-xl px-8 py-3 md:px-10 md:py-3.5 text-[15px] md:text-[16px] font-semibold md:font-bold transition-all active:scale-95 shadow-sm md:shadow-md bg-white border-2 hover:bg-gray-50 inline-block"
        style={{ borderColor: t.primaryCta, color: t.primaryCta }}
      >
        Login
      </button>
    </div>
  );
}
