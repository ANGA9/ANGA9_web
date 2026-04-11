import { ArrowRight } from "lucide-react";

export default function HeroBanner() {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#6C47FF] to-[#8B6CFF] p-8 sm:p-10 text-white relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -right-4 h-24 w-24 rounded-full bg-white/5" />

      <div className="relative z-10 max-w-lg">
        <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold mb-4">
          B2B Exclusive
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-2">
          Bulk Discounts on Office Essentials
        </h2>
        <p className="text-sm text-white/80 mb-6 leading-relaxed">
          Up to 40% off on furniture, stationery, and tech for your workspace. Verified suppliers only.
        </p>
        <button className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#6C47FF] shadow-sm transition-colors hover:bg-white/90">
          Shop Now
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
