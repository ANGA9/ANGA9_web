"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { Plus, Loader2, Package, Pencil, Search, ChevronLeft, ChevronRight, Filter, AlertCircle, Eye } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  sale_price?: number;
  min_order_qty?: number;
  unit?: string;
  status: string;
  images?: string[];
  category_id?: string;
  category_name?: string;
  created_at: string;
  review_notes?: string;
}

const STATUS_TABS = [
  { key: "all", label: "All Products" },
  { key: "active", label: "Active" },
  { key: "pending_review", label: "Pending Review" },
  { key: "draft", label: "Drafts" },
  { key: "rejected", label: "Rejected" },
];

const STATUS_BADGE: Record<string, string> = {
  active: "bg-green-50 text-[#059669] border-green-200",
  pending_review: "bg-yellow-50 text-yellow-700 border-yellow-200",
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  archived: "bg-red-50 text-red-700 border-red-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Published",
  pending_review: "Pending Review",
  draft: "Draft",
  archived: "Archived",
  rejected: "Rejected",
};

export default function ProductsPage() {
  const { loading: authLoading, getToken, dbUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [hoveredRejected, setHoveredRejected] = useState<string | null>(null);
  const limit = 20;

  const fetchProducts = useCallback(async () => {
    if (authLoading || !dbUser) return;
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const statuses = statusFilter === "all"
        ? "active,pending_review,draft,archived,rejected"
        : statusFilter;
      const params = new URLSearchParams({
        seller_id: dbUser.id,
        status: statuses,
        limit: String(limit),
        offset: String((page - 1) * limit),
      });
      if (search) params.set("search", search);
      const res = await fetch(`${API}/api/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setProducts(d.data || []);
        setTotal(d.total || 0);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [authLoading, dbUser, getToken, page, statusFilter, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleTabChange = (key: string) => {
    setPage(1);
    setSearch("");
    setSearchInput("");
    setStatusFilter(key);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="w-full mx-auto max-w-7xl px-3 sm:px-4 py-6 md:px-8 md:py-10 text-[#1A1A2E]">
      
      {/* ── Desktop Header ── */}
      <div className="hidden md:flex items-center justify-between mb-8">
        <div className="flex items-baseline gap-3">
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">
            Products
          </h1>
          <span className="text-[18px] font-bold text-gray-400">
            {total} product{total !== 1 ? "s" : ""}
          </span>
        </div>
        <Link
          href="/seller/dashboard/products/new"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#1A6FD4] px-6 py-3 text-[15px] font-bold text-white transition-all shadow-md hover:shadow-lg hover:bg-[#155bb5] active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" /> Add New Product
        </Link>
      </div>

      {/* ── Mobile Header ── */}
      <div className="md:hidden flex flex-col gap-3 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Products</h1>
          <span className="text-[14px] text-gray-500 font-medium px-3 py-1 bg-gray-100 rounded-full">{total}</span>
        </div>
        <Link
          href="/seller/dashboard/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1A6FD4] px-4 py-2.5 text-[14px] font-bold text-white shadow-sm w-full mt-2"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* ── Filters Bar ── */}
      <div className="bg-white rounded-3xl border border-gray-200 p-4 md:p-5 mb-6 shadow-sm flex flex-col xl:flex-row gap-5 items-start xl:items-center justify-between">
        <div className="flex gap-2 overflow-x-auto no-scrollbar w-full xl:w-auto pb-1 xl:pb-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`rounded-full px-5 py-2.5 text-[14px] font-bold transition-all active:scale-[0.98] whitespace-nowrap shrink-0 ${
                statusFilter === tab.key
                  ? "bg-gray-900 text-white shadow-md"
                  : "bg-gray-50 text-gray-500 border border-transparent hover:border-gray-200 hover:bg-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-[320px]">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-3 text-[14px] font-medium text-gray-900 outline-none focus:bg-white focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={handleSearch}
            className="rounded-2xl bg-gray-900 px-5 py-3 text-[14px] font-bold text-white transition-all hover:bg-gray-800 active:scale-[0.98] shrink-0"
          >
            Search
          </button>
        </div>
      </div>

      {/* ── Content Area ── */}
      {loading ? (
        <div className="rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 px-6 py-5 border-b border-gray-100 last:border-b-0">
              <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 w-1/3 rounded bg-gray-100 animate-pulse" />
                <div className="h-3 w-1/4 rounded bg-gray-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100">
            <Package className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-[18px] font-bold text-gray-900 mb-2">
            {search ? "No products found" : "No products yet"}
          </h3>
          <p className="max-w-md text-[14px] font-medium text-gray-500 leading-relaxed mb-6">
            {search
              ? `We couldn't find any products matching "${search}". Try adjusting your filters or search term.`
              : "Start by adding your first product. Once approved, it will be listed on the ANGA9 marketplace."}
          </p>
          {!search && (
            <Link
              href="/seller/dashboard/products/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#1A6FD4] px-6 py-3 text-[15px] font-bold text-white transition-all shadow-md hover:shadow-lg hover:bg-[#155bb5] active:scale-[0.98]"
            >
              <Plus className="w-5 h-5" /> Add Your First Product
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Pricing</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Date Added</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {p.images && p.images.length > 0 ? (
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-[15px] text-gray-900 truncate max-w-[200px] lg:max-w-[300px]">
                            {p.name}
                          </p>
                          <p className="text-[13px] font-medium text-gray-500 mt-0.5">
                            Min Qty: {p.min_order_qty || 1} {p.unit || "pc"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {p.sale_price ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-[15px] text-red-600">₹{p.sale_price}</span>
                          <span className="text-[13px] font-medium text-gray-400 line-through">₹{p.base_price}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-[15px] text-gray-900">₹{p.base_price}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative inline-block">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold border cursor-default transition-transform hover:scale-105 ${
                            STATUS_BADGE[p.status] || STATUS_BADGE.draft
                          }`}
                          onMouseEnter={() => p.status === "rejected" && setHoveredRejected(p.id)}
                          onMouseLeave={() => setHoveredRejected(null)}
                        >
                          {p.status === "rejected" && <AlertCircle className="w-3.5 h-3.5" />}
                          {STATUS_LABEL[p.status] || p.status}
                        </span>
                        {p.status === "rejected" && hoveredRejected === p.id && p.review_notes && (
                          <div className="absolute top-full left-0 mt-2 w-72 bg-gray-900 text-white rounded-2xl p-4 shadow-xl z-50 pointer-events-none">
                            <p className="font-bold text-[13px] mb-2 text-red-400 flex items-center gap-1.5">
                              <AlertCircle className="w-4 h-4" /> Rejection Reason
                            </p>
                            <p className="text-[13px] text-gray-200 leading-relaxed font-medium">{p.review_notes}</p>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-[14px] font-medium text-gray-500">
                        {new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/seller/dashboard/products/${p.id}`}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 text-gray-500 border border-gray-200 hover:bg-white hover:border-[#1A6FD4] hover:text-[#1A6FD4] hover:shadow-sm transition-all active:scale-95"
                        title="Edit Product"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <p className="text-[14px] font-medium text-gray-500 hidden sm:block">
                Showing <span className="font-bold text-gray-900">{(page - 1) * limit + 1}</span> to <span className="font-bold text-gray-900">{Math.min(page * limit, total)}</span> of <span className="font-bold text-gray-900">{total}</span>
              </p>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[14px] font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-all active:scale-[0.98] shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <span className="text-[14px] font-bold text-gray-900 sm:hidden">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[14px] font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-all active:scale-[0.98] shadow-sm"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
