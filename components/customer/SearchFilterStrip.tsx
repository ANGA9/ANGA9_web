"use client";

import { useState } from "react";
import { ArrowUpDown, List, SlidersHorizontal, X, Check, Search } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";

interface SearchFilterStripProps {
  sortParam: string;
  categoryParam: string;
  hasActiveFilters: boolean;
  updateUrl: (updates: Record<string, string>) => void;
  // Use the existing FilterSidebar from the page to render inside the mobile modal
  renderDesktopSidebar: () => React.ReactNode; 
}

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest First" }, // Mapped to New Arrivals
  { value: "price_desc", label: "Price (High to Low)" },
  { value: "price_asc", label: "Price (Low to High)" },
  { value: "ratings", label: "Ratings" },
  { value: "discount", label: "Discount" },
];

export default function SearchFilterStrip({
  sortParam,
  categoryParam,
  hasActiveFilters,
  updateUrl,
  renderDesktopSidebar,
}: SearchFilterStripProps) {
  const [activeModal, setActiveModal] = useState<"sort" | "category" | "filters" | null>(null);

  const handleSortChange = (val: string) => {
    updateUrl({ sort: val });
    setActiveModal(null);
  };

  const handleClose = () => setActiveModal(null);

  return (
    <>
      {/* 
        THE STRIP
        Sticky below header for mobile, and normal toolbar for desktop
      */}
      <div 
        className="sticky top-[56px] md:top-0 z-30 flex items-center border-b border-t md:border-t-0 md:rounded-t-xl bg-white w-full"
        style={{ borderColor: t.border }}
      >
        <button 
          onClick={() => setActiveModal("sort")}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-medium border-r"
          style={{ borderColor: t.border, color: t.textPrimary }}
        >
          <ArrowUpDown className="w-4 h-4" style={{ color: t.textSecondary }} />
          Sort
        </button>
        <button 
          onClick={() => setActiveModal("category")}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-medium border-r"
          style={{ borderColor: t.border, color: t.textPrimary }}
        >
          Category
          <span className="text-[10px] ml-1">▼</span>
        </button>
        <button 
          onClick={() => setActiveModal("filters")}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-medium"
          style={{ color: t.textPrimary }}
        >
          <SlidersHorizontal className="w-4 h-4" style={{ color: t.textSecondary }} />
          Filters
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.bluePrimary }} />
          )}
        </button>
      </div>

      {/* MODALS */}
      
      {/* SORT MODAL (Bottom Sheet) */}
      {activeModal === "sort" && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
          <div className="relative bg-white rounded-t-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-[14px] uppercase tracking-wide" style={{ color: t.textPrimary }}>Sort</h3>
              <button onClick={handleClose}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-2 overflow-y-auto">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSortChange(opt.value)}
                  className="w-full flex items-center justify-between p-4 text-[15px] hover:bg-gray-50"
                  style={{ color: t.textPrimary }}
                >
                  {opt.label}
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                       style={{ borderColor: sortParam === opt.value ? "#9C27B0" : t.border }}>
                    {sortParam === opt.value && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#9C27B0" }} />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL (Full Screen with Checkboxes like MegaDropdown) */}
      {activeModal === "category" && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-bold text-[14px] uppercase tracking-wide" style={{ color: t.textPrimary }}>Category</h3>
            <button onClick={handleClose}><X className="w-5 h-5 text-gray-500" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Example static categories matching the screenshot style */}
            {["Women Analog Watches", "Kids - Girls Frocks & Dresses", "Women Bra", "Women Dresses", "Kids - Boys Tshirts & Polos", "Women T-shirts", "Women Tops And Tunics"].map((cat) => (
              <label key={cat} className="flex items-center gap-3 py-2">
                <input 
                  type="checkbox" 
                  checked={categoryParam === cat}
                  onChange={() => {
                    updateUrl({ category: categoryParam === cat ? "" : cat });
                  }}
                  className="w-5 h-5 rounded border-gray-300 text-[#9C27B0] focus:ring-[#9C27B0]"
                />
                <span className="text-[14px]" style={{ color: t.textSecondary }}>{cat}</span>
              </label>
            ))}
          </div>
          <div className="p-4 border-t flex items-center justify-between">
            <span className="text-[13px] text-gray-500">1000+ Products</span>
            <button 
              onClick={handleClose}
              className="px-8 py-2.5 rounded-[4px] text-white font-bold text-[14px]"
              style={{ background: "#9C27B0" }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* FILTERS MODAL (Sidebar Layout) */}
      {activeModal === "filters" && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-bold text-[14px] uppercase tracking-wide" style={{ color: t.textPrimary }}>Filters</h3>
            <button onClick={handleClose}><X className="w-5 h-5 text-gray-500" /></button>
          </div>
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-[120px] bg-[#F4F4F8] overflow-y-auto border-r border-[#E8EEF4]">
              {["Category", "Gender", "Color", "Fabric", "Size", "Price", "Rating", "Occasion", "Combo", "Discount"].map((tab, i) => (
                <div 
                  key={tab} 
                  className={`p-4 text-[13px] ${i === 0 ? "bg-white border-l-4 border-l-[#9C27B0] text-[#9C27B0] font-medium" : "text-gray-600"}`}
                >
                  {tab}
                </div>
              ))}
            </div>
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4">
              <h4 className="font-bold text-[16px] mb-4">Category</h4>
              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input type="text" placeholder="Search" className="w-full pl-9 pr-3 py-2 border rounded-full text-[14px] outline-none focus:border-[#9C27B0]" />
              </div>
              <div className="space-y-4">
                {["Women T-shirts", "Women Tops And Tunics", "Analog Watches", "Appliance Covers", "Bangles & Bracelets"].map((cat) => (
                   <label key={cat} className="flex items-center gap-3 py-2">
                   <input 
                     type="checkbox" 
                     checked={categoryParam === cat}
                     onChange={() => {
                       updateUrl({ category: categoryParam === cat ? "" : cat });
                     }}
                     className="w-5 h-5 rounded border-gray-300 text-[#9C27B0] focus:ring-[#9C27B0]"
                   />
                   <span className="text-[14px]" style={{ color: t.textSecondary }}>{cat}</span>
                 </label>
                ))}
              </div>
              {/* Inject the actual working filters below the visual placeholders if needed */}
              <div className="mt-8 pt-4 border-t">
                {renderDesktopSidebar()}
              </div>
            </div>
          </div>
          <div className="p-4 border-t flex items-center justify-between">
            <span className="text-[13px] text-gray-500">1000+ Products</span>
            <button 
              onClick={handleClose}
              className="px-8 py-2.5 rounded-[4px] text-white font-bold text-[14px]"
              style={{ background: "#9C27B0" }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
