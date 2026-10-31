"use client";

import { useState, useMemo, useEffect } from "react";
import { ArrowUpDown, SlidersHorizontal, X, Check, Search } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { useCategories } from "@/lib/useCategories";

const APPLY_INDIGO = "#1A6FD4";
const BOTTOM_NAV_OFFSET = "calc(56px + env(safe-area-inset-bottom, 0px))";

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
  { value: "newest", label: "Newest First" },
  { value: "price_desc", label: "Price (High to Low)" },
  { value: "price_asc", label: "Price (Low to High)" },
  { value: "ratings", label: "Ratings" },
  { value: "discount", label: "Discount" },
];

type ModalKind = "sort" | "category" | "filters";

export default function SearchFilterStrip({
  sortParam,
  categoryParam,
  hasActiveFilters,
  updateUrl,
  renderDesktopSidebar,
}: SearchFilterStripProps) {
  const [activeModal, setActiveModal] = useState<ModalKind | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  
  const { tabs: categoriesTree, loading } = useCategories();
  // Carry both name (for display) and slug (the value we filter by — the backend
  // resolves a category SLUG hierarchically). FILTER_TABS stays name-only for the
  // tab strip UI which keys off the active tab's name.
  const TOP_LEVEL_CATEGORIES = categoriesTree.map(t => ({ name: t.name, slug: t.slug }));
  const FILTER_TABS = categoriesTree.map(t => t.name);

  const [activeFilterTab, setActiveFilterTab] = useState<string>("");
  const [filterSearch, setFilterSearch] = useState("");
  const [draftSort, setDraftSort] = useState<string>(sortParam);

  useEffect(() => {
    if (FILTER_TABS.length > 0 && !activeFilterTab) {
      setActiveFilterTab(FILTER_TABS[0]);
    }
  }, [FILTER_TABS, activeFilterTab]);

  const openModal = (kind: ModalKind) => {
    setIsClosing(false);
    if (kind === "sort") setDraftSort(sortParam || "relevance");
    setActiveModal(kind);
  };

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    window.setTimeout(() => {
      setActiveModal(null);
      setIsClosing(false);
    }, 240);
  };

  // Lock background scroll while a sheet is open
  useEffect(() => {
    if (!activeModal) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevTouchAction = body.style.touchAction;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.touchAction = prevTouchAction;
    };
  }, [activeModal]);

  const handleApplySort = () => {
    updateUrl({ sort: draftSort });
    handleClose();
  };

  const filterTabSubItems = useMemo<string[]>(() => {
    const tab = categoriesTree.find(t => t.name === activeFilterTab);
    if (!tab) return [];
    const items = tab.children.map(c => c.name);
    if (!filterSearch.trim()) return items;
    const q = filterSearch.toLowerCase();
    return items.filter((i) => i.toLowerCase().includes(q));
  }, [activeFilterTab, filterSearch, categoriesTree]);

  const sheetAnimClass = isClosing ? "sheet-anim-out" : "sheet-anim-in";
  const overlayAnimClass = isClosing ? "overlay-anim-out" : "overlay-anim-in";

  return (
    <>
      <SheetAnimations />

      {/* THE STRIP */}
      <div className="sticky top-[60px] md:top-0 z-30 px-2 md:px-0 pb-1 md:pb-0">
        <div className="flex items-center border border-gray-200 bg-white w-full overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] rounded-xl">
          <button
            onClick={() => openModal("sort")}
            className="flex-1 flex items-center justify-center gap-2 py-3 md:py-4 text-sm md:text-base font-semibold border-r border-gray-200 hover:bg-gray-50 transition-colors"
            style={{ color: t.textPrimary }}
          >
            <ArrowUpDown className="w-4 h-4 md:w-5 md:h-5" style={{ color: t.textSecondary }} />
            Sort
          </button>
          <button
            onClick={() => openModal("category")}
            className="flex-1 flex items-center justify-center gap-2 py-3 md:py-4 text-sm md:text-base font-semibold border-r border-gray-200 hover:bg-gray-50 transition-colors"
            style={{ color: t.textPrimary }}
          >
            Category
            <span className="text-xs md:text-sm ml-1 text-gray-400">▼</span>
          </button>
          <button
            onClick={() => openModal("filters")}
            className="flex-1 flex items-center justify-center gap-2 py-3 md:py-4 text-sm md:text-base font-semibold hover:bg-gray-50 transition-colors"
            style={{ color: t.textPrimary }}
          >
            <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5" style={{ color: t.textSecondary }} />
            Filters
            {hasActiveFilters && (
              <span
                className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full absolute ml-[70px] mb-[15px]"
                style={{ background: '#FFFFFF', border: '2px solid ' + t.bluePrimary, color: t.bluePrimary }}
              />
            )}
          </button>
        </div>
      </div>

      {/* SORT MODAL */}
      {activeModal === "sort" && (
        <div className="fixed inset-0 z-[9998] flex flex-col justify-end md:justify-center md:items-center pointer-events-none">
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto ${overlayAnimClass}`}
            onClick={handleClose}
          />
          <div
            className={`relative pointer-events-auto bg-white rounded-t-3xl md:rounded-2xl flex flex-col max-h-[75dvh] md:max-h-[82vh] w-full md:w-[420px] shadow-2xl border border-gray-100 sheet-panel ${sheetAnimClass}`}
          >
            <MobileGrabber />
            <div className="shrink-0 flex items-center justify-between px-5 py-4 md:py-4.5 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-base md:text-lg text-gray-900 tracking-tight" style={{ color: t.textPrimary }}>
                  Sort By
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 md:p-4 overflow-y-auto overscroll-contain space-y-1.5">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = draftSort === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setDraftSort(opt.value)}
                    className={`w-full flex items-center justify-between px-4 py-3 md:py-2.5 rounded-xl text-sm md:text-base transition-all ${
                      isSelected
                        ? "bg-blue-50/70 text-[#1A6FD4] font-semibold border border-blue-100"
                        : "text-gray-700 hover:bg-gray-50 border border-transparent font-medium"
                    }`}
                  >
                    <span>{opt.label}</span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? "border-[#1A6FD4] bg-[#1A6FD4]" : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
            <ApplyFooter
              countLabel={null}
              label="Apply"
              onApply={handleApplySort}
              onClear={
                draftSort !== "relevance"
                  ? () => {
                      setDraftSort("relevance");
                      updateUrl({ sort: "" });
                      handleClose();
                    }
                  : undefined
              }
              clearLabel="Reset"
            />
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {activeModal === "category" && (
        <div className="fixed inset-0 z-[9998] flex flex-col justify-end md:justify-center md:items-center pointer-events-none">
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto ${overlayAnimClass}`}
            onClick={handleClose}
          />
          <div
            className={`relative pointer-events-auto bg-white rounded-t-3xl md:rounded-2xl flex flex-col max-h-[75dvh] md:max-h-[82vh] w-full md:w-[460px] shadow-2xl border border-gray-100 sheet-panel ${sheetAnimClass}`}
          >
            <MobileGrabber />
            <div className="shrink-0 flex items-center justify-between px-5 py-4 md:py-4.5 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-base md:text-lg text-gray-900 tracking-tight" style={{ color: t.textPrimary }}>
                  Categories
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain p-3 md:p-4 space-y-1.5">
              {/* All Categories Option */}
              <button
                type="button"
                onClick={() => updateUrl({ category: "" })}
                className={`w-full flex items-center justify-between px-4 py-3 md:py-2.5 rounded-xl text-sm md:text-base transition-all ${
                  !categoryParam
                    ? "bg-blue-50/70 text-[#1A6FD4] font-semibold border border-blue-100"
                    : "text-gray-700 hover:bg-gray-50 border border-transparent font-medium"
                }`}
              >
                <span>All Categories</span>
                {!categoryParam && <Check className="w-4 h-4 text-[#1A6FD4]" />}
              </button>

              {TOP_LEVEL_CATEGORIES.map((cat) => {
                const isSelected = categoryParam === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => {
                      updateUrl({ category: isSelected ? "" : cat.slug });
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 md:py-2.5 rounded-xl text-sm md:text-base transition-all ${
                      isSelected
                        ? "bg-blue-50/70 text-[#1A6FD4] font-semibold border border-blue-100"
                        : "text-gray-700 hover:bg-gray-50 border border-transparent font-medium"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        isSelected ? "bg-[#1A6FD4] border-[#1A6FD4]" : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
            <ApplyFooter
              countLabel={null}
              label="Apply"
              onApply={handleClose}
              onClear={categoryParam ? () => updateUrl({ category: "" }) : undefined}
              clearLabel="Clear"
            />
          </div>
        </div>
      )}

      {/* FILTERS MODAL */}
      {activeModal === "filters" && (
        <div className="fixed inset-0 z-[9998] flex flex-col justify-end md:justify-center md:items-center pointer-events-none">
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto ${overlayAnimClass}`}
            onClick={handleClose}
          />
          <div
            className={`relative pointer-events-auto bg-white rounded-t-3xl md:rounded-2xl flex flex-col max-h-[78dvh] md:h-[580px] md:max-h-[82vh] w-full md:w-[720px] shadow-2xl border border-gray-100 sheet-panel ${sheetAnimClass}`}
          >
            <MobileGrabber />
            <div className="shrink-0 flex items-center justify-between px-5 py-4 md:py-4.5 border-b border-gray-100">
              <h3 className="font-semibold text-base md:text-lg text-gray-900 tracking-tight" style={{ color: t.textPrimary }}>
                Filters
              </h3>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar */}
              <div className="w-[130px] md:w-[190px] bg-gray-50/80 overflow-y-auto overscroll-contain border-r border-gray-200/80 p-2 space-y-1">
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
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all ${
                        isActive
                          ? "bg-white text-[#1A6FD4] font-semibold shadow-xs border-l-3 border-[#1A6FD4]"
                          : "text-gray-600 hover:bg-gray-100/70"
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
              {/* Content Area */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 md:p-6 bg-white">
                <h4 className="font-semibold text-base md:text-lg text-gray-900 mb-3">{activeFilterTab}</h4>
                <div className="relative mb-4">
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
                <div className="space-y-4">
                  {(() => {
                    const tab = categoriesTree.find(t => t.name === activeFilterTab);
                    if (!tab) return null;
                    const items = tab.children.map(c => ({ name: c.name, slug: c.slug }));
                    const visibleItems = filterSearch.trim()
                      ? items.filter((i) => i.name.toLowerCase().includes(filterSearch.toLowerCase()))
                      : items;
                    if (visibleItems.length === 0) return null;
                    return (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 pb-1 border-b border-gray-100">
                          {activeFilterTab} Subcategories
                        </p>
                        <div className="space-y-1.5">
                          {visibleItems.map((item) => {
                            const isSelected = categoryParam === item.slug;
                            return (
                              <button
                                key={item.slug}
                                type="button"
                                onClick={() => {
                                  updateUrl({ category: isSelected ? "" : item.slug });
                                }}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                                  isSelected
                                    ? "bg-blue-50/70 text-[#1A6FD4] font-semibold border border-blue-100"
                                    : "text-gray-700 hover:bg-gray-50 border border-transparent font-medium"
                                }`}
                              >
                                <span>{item.name}</span>
                                <div
                                  className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
                                    isSelected ? "bg-[#1A6FD4] border-[#1A6FD4]" : "border-gray-300 bg-white"
                                  }`}
                                >
                                  {isSelected && <Check className="w-3 h-3 text-white" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                  {filterTabSubItems.length === 0 && filterSearch.trim() && (
                    <p className="text-sm text-gray-400">No items match &quot;{filterSearch}&quot;.</p>
                  )}
                </div>
              </div>
            </div>
            <ApplyFooter
              countLabel={null}
              label="Apply Filters"
              onApply={handleClose}
              onClear={categoryParam ? () => updateUrl({ category: "" }) : undefined}
              clearLabel="Clear All"
            />
          </div>
        </div>
      )}
    </>
  );
}

function MobileGrabber() {
  return (
    <div className="md:hidden flex justify-center pt-3 pb-1">
      <span className="block w-12 h-1.5 rounded-full bg-gray-300" />
    </div>
  );
}

function ApplyFooter({
  countLabel,
  label,
  onApply,
  onClear,
  clearLabel = "Clear",
}: {
  countLabel?: string | null;
  label: string;
  onApply: () => void;
  onClear?: () => void;
  clearLabel?: string;
}) {
  return (
    <div className="shrink-0 px-5 py-3.5 md:px-6 md:py-4 border-t border-gray-100 bg-white md:rounded-b-2xl flex items-center justify-between gap-3">
      <div>
        {onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors px-1 py-1"
          >
            {clearLabel}
          </button>
        ) : countLabel ? (
          <span className="text-xs md:text-sm font-medium text-gray-500">{countLabel}</span>
        ) : null}
      </div>
      <button
        onClick={onApply}
        className="px-7 py-2.5 rounded-xl font-semibold text-sm md:text-base shadow-sm bg-[#1A6FD4] hover:bg-[#1558B0] text-white transition-all active:scale-95"
      >
        {label}
      </button>
    </div>
  );
}

function SheetAnimations() {
  return (
    <style>{`
      @keyframes sheetSlideUp {
        from { transform: translateY(100%); }
        to   { transform: translateY(0); }
      }
      @keyframes sheetSlideDown {
        from { transform: translateY(0); }
        to   { transform: translateY(100%); }
      }
      @keyframes sheetFadeIn {
        from { opacity: 0; transform: scale(0.97); }
        to   { opacity: 1; transform: scale(1); }
      }
      @keyframes sheetFadeOut {
        from { opacity: 1; transform: scale(1); }
        to   { opacity: 0; transform: scale(0.97); }
      }
      @keyframes overlayIn  { from { opacity: 0; } to { opacity: 1; } }
      @keyframes overlayOut { from { opacity: 1; } to { opacity: 0; } }

      /* Mobile: sheet sits flush above bottom nav, no shadow between them */
      .sheet-panel {
        margin-bottom: calc(56px + env(safe-area-inset-bottom, 0px));
        box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
      }

      .sheet-anim-in   { animation: sheetSlideUp 240ms cubic-bezier(0.22, 1, 0.36, 1); }
      .sheet-anim-out  { animation: sheetSlideDown 220ms ease-in forwards; }
      .overlay-anim-in  { animation: overlayIn 200ms ease-out; }
      .overlay-anim-out { animation: overlayOut 200ms ease-in forwards; }

      @media (min-width: 768px) {
        .sheet-panel {
          margin-bottom: 0;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        }
        .sheet-anim-in  { animation: sheetFadeIn 200ms ease-out; }
        .sheet-anim-out { animation: sheetFadeOut 180ms ease-in forwards; }
      }
    `}</style>
  );
}
