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
      <style>{`
        @keyframes pulseBlueEdge {
          0% { box-shadow: inset 0 0 0 0 rgba(26, 111, 212, 0), 0 0 0 0 rgba(26, 111, 212, 0); }
          50% { box-shadow: inset 0 0 0 1px rgba(26, 111, 212, 0.5), 0 0 8px rgba(26, 111, 212, 0.2); }
          100% { box-shadow: inset 0 0 0 0 rgba(26, 111, 212, 0), 0 0 0 0 rgba(26, 111, 212, 0); }
        }
        .animated-blue-edge {
          animation: pulseBlueEdge 2s ease-in-out 15; /* 30 seconds total */
        }
      `}</style>
      {/* 
        THE STRIP
        Sticky below header for mobile, and normal toolbar for desktop
      */}
      <div 
        className="animated-blue-edge sticky top-[56px] md:top-0 z-30 flex items-center border-b border-t md:border border-gray-200 md:rounded-xl bg-white w-full overflow-hidden shadow-sm"
      >
        <button 
          onClick={() => setActiveModal("sort")}
          className="flex-1 flex items-center justify-center gap-2 py-3 md:py-4 text-sm md:text-base md:text-base md:text-lg font-semibold border-r hover:bg-gray-50 transition-colors"
          style={{ borderColor: t.border, color: t.textPrimary }}
        >
          <ArrowUpDown className="w-4 h-4 md:w-5 md:h-5" style={{ color: t.textSecondary }} />
          Sort
        </button>
        <button 
          onClick={() => setActiveModal("category")}
          className="flex-1 flex items-center justify-center gap-2 py-3 md:py-4 text-sm md:text-base md:text-base md:text-lg font-semibold border-r hover:bg-gray-50 transition-colors"
          style={{ borderColor: t.border, color: t.textPrimary }}
        >
          Category
          <span className="text-xs md:text-sm md:text-xs md:text-sm ml-1 text-gray-400">▼</span>
        </button>
        <button 
          onClick={() => setActiveModal("filters")}
          className="flex-1 flex items-center justify-center gap-2 py-3 md:py-4 text-sm md:text-base md:text-base md:text-lg font-semibold hover:bg-gray-50 transition-colors"
          style={{ color: t.textPrimary }}
        >
          <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5" style={{ color: t.textSecondary }} />
          Filters
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full absolute ml-[70px] mb-[15px]" style={{ background: t.bluePrimary }} />
          )}
        </button>
      </div>

      {/* MODALS */}
      
      {/* SORT MODAL */}
      {activeModal === "sort" && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
          <div className="relative bg-white rounded-t-2xl md:rounded-2xl flex flex-col max-h-[80vh] w-full md:w-[400px] shadow-2xl">
            <div className="flex items-center justify-between p-4 md:p-5 border-b">
              <h3 className="font-bold text-sm md:text-base md:text-base md:text-lg uppercase tracking-wide" style={{ color: t.textPrimary }}>Sort By</h3>
              <button onClick={handleClose} className="hover:bg-gray-100 p-1.5 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-2 md:p-3 overflow-y-auto">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSortChange(opt.value)}
                  className="w-full flex items-center justify-between p-4 md:p-3 md:rounded-xl text-base hover:bg-gray-50 transition-colors"
                  style={{ color: t.textPrimary }}
                >
                  {opt.label}
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                       style={{ borderColor: sortParam === opt.value ? t.bluePrimary : t.border }}>
                    {sortParam === opt.value && <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.bluePrimary }} />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {activeModal === "category" && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
          <div className="relative bg-white rounded-t-2xl md:rounded-2xl flex flex-col max-h-[80vh] w-full md:w-[500px] shadow-2xl">
            <div className="flex items-center justify-between p-4 md:p-5 border-b">
              <h3 className="font-bold text-sm md:text-base md:text-base md:text-lg uppercase tracking-wide" style={{ color: t.textPrimary }}>Categories</h3>
              <button onClick={handleClose} className="hover:bg-gray-100 p-1.5 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {["Women Analog Watches", "Kids - Girls Frocks & Dresses", "Women Bra", "Women Dresses", "Kids - Boys Tshirts & Polos", "Women T-shirts", "Women Tops And Tunics"].map((cat) => (
                <label key={cat} className="flex items-center gap-3 py-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={categoryParam === cat}
                      onChange={() => {
                        updateUrl({ category: categoryParam === cat ? "" : cat });
                      }}
                      className="w-5 h-5 rounded border-gray-300 appearance-none border-2 transition-colors cursor-pointer"
                      style={{ 
                        borderColor: categoryParam === cat ? t.bluePrimary : t.border,
                        background: categoryParam === cat ? t.bluePrimary : "transparent"
                      }}
                    />
                    {categoryParam === cat && <Check className="w-3.5 h-3.5 text-white absolute pointer-events-none" />}
                  </div>
                  <span className="text-sm md:text-base md:text-base group-hover:text-black transition-colors" style={{ color: t.textSecondary }}>{cat}</span>
                </label>
              ))}
            </div>
            <div className="p-4 md:p-5 border-t bg-gray-50 md:bg-white md:rounded-b-2xl flex items-center justify-between">
              <span className="text-sm md:text-base font-medium text-gray-500">1000+ Products</span>
              <button 
                onClick={handleClose}
                className="px-8 py-2.5 rounded-lg text-white font-bold text-sm md:text-base shadow-sm hover:opacity-90 transition-opacity"
                style={{ background: t.bluePrimary }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FILTERS MODAL */}
      {activeModal === "filters" && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
          <div className="relative bg-white rounded-t-2xl md:rounded-2xl flex flex-col max-h-[80vh] w-full md:w-[700px] md:h-[600px] shadow-2xl">
            <div className="flex items-center justify-between p-4 md:p-5 border-b">
              <h3 className="font-bold text-sm md:text-base md:text-base md:text-lg uppercase tracking-wide" style={{ color: t.textPrimary }}>Filters</h3>
              <button onClick={handleClose} className="hover:bg-gray-100 p-1.5 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar */}
              <div className="w-[120px] md:w-[160px] bg-[#F4F4F8] md:bg-gray-50 overflow-y-auto border-r border-[#E8EEF4]">
                {["Category", "Gender", "Color", "Fabric", "Size", "Price", "Rating", "Occasion", "Combo", "Discount"].map((tab, i) => (
                  <div 
                    key={tab} 
                    className={`p-4 md:px-5 md:py-4 text-sm md:text-base md:text-sm md:text-base cursor-pointer transition-colors ${i === 0 ? "bg-white border-l-4 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                    style={{ 
                      borderLeftColor: i === 0 ? t.bluePrimary : "transparent",
                      color: i === 0 ? t.bluePrimary : undefined
                    }}
                  >
                    {tab}
                  </div>
                ))}
              </div>
              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white">
                <h4 className="font-bold text-base md:text-lg mb-4">Category</h4>
                <div className="relative mb-5">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input type="text" placeholder="Search categories..." className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border rounded-xl text-sm md:text-base outline-none transition-colors" style={{ borderColor: t.border, focusBorderColor: t.bluePrimary }} />
                </div>
                <div className="space-y-4">
                  {["Women T-shirts", "Women Tops And Tunics", "Analog Watches", "Appliance Covers", "Bangles & Bracelets"].map((cat) => (
                     <label key={cat} className="flex items-center gap-3 py-2 cursor-pointer group">
                     <div className="relative flex items-center justify-center">
                       <input 
                         type="checkbox" 
                         checked={categoryParam === cat}
                         onChange={() => {
                           updateUrl({ category: categoryParam === cat ? "" : cat });
                         }}
                         className="w-5 h-5 rounded border-gray-300 appearance-none border-2 transition-colors cursor-pointer"
                         style={{ 
                           borderColor: categoryParam === cat ? t.bluePrimary : t.border,
                           background: categoryParam === cat ? t.bluePrimary : "transparent"
                         }}
                       />
                       {categoryParam === cat && <Check className="w-3.5 h-3.5 text-white absolute pointer-events-none" />}
                     </div>
                     <span className="text-sm md:text-base md:text-base group-hover:text-black transition-colors" style={{ color: t.textSecondary }}>{cat}</span>
                   </label>
                  ))}
                </div>
                {/* Real Desktop Sidebar Placeholder */}
                <div className="mt-8 pt-6 border-t" style={{ borderColor: t.border }}>
                  <p className="text-sm font-semibold mb-4 text-gray-400">Additional Filters</p>
                  {renderDesktopSidebar()}
                </div>
              </div>
            </div>
            <div className="p-4 md:p-5 border-t bg-gray-50 md:bg-white md:rounded-b-2xl flex items-center justify-between">
              <span className="text-sm md:text-base font-medium text-gray-500">1000+ Products</span>
              <button 
                onClick={handleClose}
                className="px-8 py-2.5 rounded-lg text-white font-bold text-sm md:text-base shadow-sm hover:opacity-90 transition-opacity"
                style={{ background: t.bluePrimary }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
