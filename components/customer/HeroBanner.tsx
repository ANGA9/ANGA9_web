import { ArrowRight } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";

export default function HeroBanner() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-8 sm:p-10"
      style={{ background: t.bluePrimary }}
    >
      {/* Decorative squares (right side) */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden sm:flex flex-col gap-3 items-end">
        <div className="h-16 w-16 rounded-xl bg-white/15 -rotate-6" />
        <div className="h-20 w-20 rounded-xl bg-white/10 rotate-3 -mt-4 mr-6" />
        <div className="h-14 w-14 rounded-xl bg-white/15 -rotate-12 -mt-3" />
      </div>

      <div className="relative z-10 max-w-lg">
        <span
          className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white mb-4"
          style={{ background: "rgba(255,255,255,0.2)" }}
        >
          B2B Exclusive
        </span>
        <h2 className="text-2xl sm:text-[28px] font-bold leading-tight mb-2 text-white">
          Bulk Discounts on Office Essentials
        </h2>
        <p className="text-sm text-white/85 mb-6 leading-relaxed">
          Up to 40% off for verified businesses
        </p>
        <button
          className="inline-flex items-center gap-2 rounded-[10px] px-6 py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
          style={{ background: t.yellowCta, color: t.ctaText }}
        >
          Shop Now
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
