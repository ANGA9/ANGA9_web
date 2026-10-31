"use client";

import { useLoginSheet } from "@/lib/LoginSheetContext";
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
  const { open: openLoginSheet } = useLoginSheet();
  return (
    <div className="flex flex-col items-center justify-center pt-8 pb-16 md:pt-12 md:pb-24 text-center px-4 w-full h-full min-h-[60vh]">
      <EmptyOrdersIllustration type={illustration} />
      <h3 className="text-[17px] md:text-[20px] font-semibold mb-2 mt-2" style={{ color: t.textPrimary }}>{title}</h3>
      <p className="text-[13px] md:text-[15px] mb-5 max-w-[280px] mx-auto" style={{ color: t.textMuted }}>{desc}</p>
      <button
        onClick={() => openLoginSheet()}
        className="rounded-full px-10 py-3 text-[15px] font-semibold text-white transition-all active:scale-95 shadow-md hover:bg-blue-700 inline-block bg-[#2563EB]"
      >
        Login
      </button>
    </div>
  );
}
