"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, List, SlidersHorizontal, X, Check, Search } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { CATEGORY_TREE, TOP_LEVEL_CATEGORIES } from "@/lib/categories";

const FILTER_TABS = TOP_LEVEL_CATEGORIES;

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
  const [activeFilterTab, setActiveFilterTab] = useState<string>(FILTER_TABS[0]);
  const [filterSearch, setFilterSearch] = useState("");

  const handleSortChange = (val: string) => {
    updateUrl({ sort: val });
    setActiveModal(null);
  };

  const handleClose = () => setActiveModal(null);

  const filterTabSubItems = useMemo<string[]>(() => {
    const cols = CATEGORY_TREE[activeFilterTab];
    if (!cols) return [];
    const items = cols.flatMap((c) => c.items);
    if (!filterSearch.trim()) return items;
    const q = filterSearch.toLowerCase();
    return items.filter((i) => i.toLowerCase().includes(q));
  }, [activeFilterTab, filterSearch]);

  return (
    <>
      {/* 
        THE STRIP
        Sticky below header for mobile, and normal toolbar for desktop
      */}
      <div className="sticky top-[60px] md:top-0 z-30 px-2 md:px-0 pb-1 md:pb-0">
        <div 
          className="flex items-center border border-gray-200 bg-white w-full overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] rounded-xl"
        >
          <button 
            onClick={() => setActiveModal("sort")}
            className="flex-1 flex items-center justify-center gap-2 py-3 md:py-4 text-sm md:text-base font-semibold border-r border-gray-200 hover:bg-gray-50 transition-colors"
            style={{ color: t.textPrimary }}
          >
            <ArrowUpDown className="w-4 h-4 md:w-5 md:h-5" style={{ color: t.textSecondary }} />
            Sort
          </button>
          <button 
            onClick={() => setActiveModal("category")}
            className="flex-1 flex items-center justify-center gap-2 py-3 md:py-4 text-sm md:text-base font-semibold border-r border-gray-200 hover:bg-gray-50 transition-colors"
            style={{ color: t.textPrimary }}
          >
            Category
            <span className="text-xs md:text-sm ml-1 text-gray-400">▼</span>
          </button>
          <button 
            onClick={() => setActiveModal("filters")}
            className="flex-1 flex items-center justify-center gap-2 py-3 md:py-4 text-sm md:text-base font-semibold hover:bg-gray-50 transition-colors"
            style={{ color: t.textPrimary }}
          >
            <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5" style={{ color: t.textSecondary }} />
            Filters
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full absolute ml-[70px] mb-[15px]" style={{ background: t.bluePrimary }} />
            )}
          </button>
        </div>
      </div>

      {/* MODALS */}
      
      {/* SORT MODAL */}
      {activeModal === "sort" && (
        <div className="fixed inset-0 z-[10000] flex flex-col justify-end md:justify-center md:items-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
          <div className="relative bg-white rounded-t-2xl md:rounded-2xl flex flex-col max-h-[70dvh] md:max-h-[80vh] w-full md:w-[400px] shadow-2xl mb-[calc(56px+env(safe-area-inset-bottom,0px))] md:mb-0">
            <div className="shrink-0 flex items-center justify-between p-4 md:p-5 border-b">
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
        <div className="fixed inset-0 z-[10000] flex flex-col justify-end md:justify-center md:items-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
          <div className="relative bg-white rounded-t-2xl md:rounded-2xl flex flex-col max-h-[70dvh] md:max-h-[80vh] w-full md:w-[500px] shadow-2xl mb-[calc(56px+env(safe-area-inset-bottom,0px))] md:mb-0">
            <div className="shrink-0 flex items-center justify-between p-4 md:p-5 border-b">
              <h3 className="font-bold text-sm md:text-base md:text-base md:text-lg uppercase tracking-wide" style={{ color: t.textPrimary }}>Categories</h3>
              <button onClick={handleClose} className="hover:bg-gray-100 p-1.5 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {TOP_LEVEL_CATEGORIES.map((cat) => (
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
            <div className="shrink-0 p-4 md:p-5 border-t bg-gray-50 md:bg-white md:rounded-b-2xl flex items-center justify-between">
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
        <div className="fixed inset-0 z-[10000] flex flex-col justify-end md:justify-center md:items-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
          <div className="relative bg-white rounded-t-2xl md:rounded-2xl flex flex-col max-h-[75dvh] md:h-[600px] md:max-h-[80vh] w-full md:w-[700px] shadow-2xl mb-[calc(56px+env(safe-area-inset-bottom,0px))] md:mb-0">
            <div className="shrink-0 flex items-center justify-between p-4 md:p-5 border-b">
              <h3 className="font-bold text-sm md:text-base md:text-base md:text-lg uppercase tracking-wide" style={{ color: t.textPrimary }}>Filters</h3>
              <button onClick={handleClose} className="hover:bg-gray-100 p-1.5 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar */}
              <div className="w-[140px] md:w-[200px] bg-[#F4F4F8] md:bg-gray-50 overflow-y-auto border-r border-[#E8EEF4]">
                {FILTER_TABS.map((tab) => {
                  const isActive = tab === activeFilterTab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        setActiveFilterTab(tab);
                        setFilterSearch("");
                      }}
                      className={`w-full text-left p-3 md:px-4 md:py-3 text-xs md:text-sm cursor-pointer transition-colors uppercase tracking-wide ${
                        isActive ? "bg-white border-l-4 font-semibold" : "text-gray-600 hover:bg-gray-100"
                      }`}
                      style={{
                        borderLeftColor: isActive ? t.bluePrimary : "transparent",
                        color: isActive ? t.bluePrimary : undefined,
                      }}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white">
                <h4 className="font-bold text-base md:text-lg mb-4">{activeFilterTab}</h4>
                <div className="relative mb-5">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    placeholder={`Search in ${activeFilterTab.toLowerCase()}...`}
                    className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border rounded-xl text-sm md:text-base outline-none transition-colors focus:ring-2 focus:ring-[#1A6FD4]/20 focus:border-[#1A6FD4]"
                    style={{ borderColor: t.border }}
                  />
                  {filterSearch && (
                    <button
                      type="button"
                      onClick={() => setFilterSearch("")}
                      aria-label="Clear search"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>
                <div className="space-y-5">
                  {(CATEGORY_TREE[activeFilterTab] ?? []).map((col) => {
                    const visibleItems = filterSearch.trim()
                      ? col.items.filter((i) => i.toLowerCase().includes(filterSearch.toLowerCase()))
                      : col.items;
                    if (visibleItems.length === 0) return null;
                    return (
                      <div key={col.heading}>
                        <p
                          className="text-xs font-bold uppercase tracking-[0.04em] pb-1.5 mb-2.5 border-b"
                          style={{ color: t.bluePrimary, borderColor: t.bluePrimary }}
                        >
                          {col.heading}
                        </p>
                        <div className="space-y-2">
                          {visibleItems.map((item) => (
                            <label key={item} className="flex items-center gap-3 py-1 cursor-pointer group">
                              <div className="relative flex items-center justify-center">
                                <input
                                  type="checkbox"
                                  checked={categoryParam === item}
                                  onChange={() => {
                                    updateUrl({ category: categoryParam === item ? "" : item });
                                  }}
                                  className="w-5 h-5 rounded border-gray-300 appearance-none border-2 transition-colors cursor-pointer"
                                  style={{
                                    borderColor: categoryParam === item ? t.bluePrimary : t.border,
                                    background: categoryParam === item ? t.bluePrimary : "transparent",
                                  }}
                                />
                                {categoryParam === item && (
                                  <Check className="w-3.5 h-3.5 text-white absolute pointer-events-none" />
                                )}
                              </div>
                              <span
                                className="text-sm md:text-base group-hover:text-black transition-colors"
                                style={{ color: t.textSecondary }}
                              >
                                {item}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {filterTabSubItems.length === 0 && filterSearch.trim() && (
                    <p className="text-sm text-gray-400">No items match &quot;{filterSearch}&quot;.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="shrink-0 p-4 md:p-5 border-t bg-gray-50 md:bg-white md:rounded-b-2xl flex items-center justify-between">
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
