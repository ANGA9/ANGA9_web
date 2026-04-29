"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { Plus, Loader2, Package, Pencil, Search, ChevronLeft, ChevronRight } from "lucide-react";

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
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "pending_review", label: "Pending Review" },
  { key: "draft", label: "Draft" },
  { key: "rejected", label: "Rejected" },
];

const STATUS_BADGE: Record<string, string> = {
  active: "bg-[#F0FDF4] text-[#22C55E] border-[#BBF7D0]",
  pending_review: "bg-[#FFFBEB] text-[#F59E0B] border-[#FDE68A]",
  draft: "bg-[#F3F4F6] text-[#9CA3AF] border-[#E8EEF4]",
  archived: "bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]",
  rejected: "bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]",
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#1A1A2E]">Products</h1>
          <p className="text-sm md:text-base text-[#9CA3AF]">
            {total} product{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/seller/dashboard/products/new"
          className="flex items-center gap-2 h-10 px-5 bg-[#4338CA] text-white text-sm md:text-base font-semibold rounded-lg hover:bg-[#3730A3] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E8EEF4] p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                  statusFilter === tab.key
                    ? "bg-[#4338CA] text-white"
                    : "text-[#9CA3AF] hover:bg-[#F8FBFF]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-9 w-full rounded-lg border border-[#E8EEF4] bg-white pl-9 pr-3 text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF]/60 focus:border-[#1A6FD4] focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/10 transition-colors"
              />
            </div>
            <button
              onClick={handleSearch}
              className="h-9 px-4 rounded-lg bg-[#1A6FD4] text-white text-sm font-medium hover:bg-[#155bb5] transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-6 h-6 animate-spin text-[#1A6FD4]" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E8EEF4] p-12 text-center">
          <Package className="w-12 h-12 text-[#E8EEF4] mx-auto mb-4" />
          <h2 className="text-base md:text-lg font-bold text-[#1A1A2E] mb-2">
            {search ? "No Products Found" : "No Products Yet"}
          </h2>
          <p className="text-sm md:text-base text-[#9CA3AF] mb-6">
            {search
              ? "Try a different search term"
              : "Start by adding your first product to list on ANGA9"}
          </p>
          {!search && (
            <Link
              href="/seller/dashboard/products/new"
              className="inline-flex items-center gap-2 h-10 px-5 bg-[#1A6FD4] text-white text-sm md:text-base font-semibold rounded-lg hover:bg-[#155bb5] transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Your First Product
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E8EEF4] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base">
              <thead>
                <tr className="border-b border-[#E8EEF4] bg-[#F8FBFF]">
                  <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Product</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Min Qty</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Added</th>
                  <th className="text-right px-4 py-3 font-semibold text-[#4B5563]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-[#E8EEF4] last:border-0 hover:bg-[#F8FBFF] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images && p.images.length > 0 ? (
                          <img src={p.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover border border-[#E8EEF4]" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-[#F8FBFF] flex items-center justify-center">
                            <Package className="w-4 h-4 text-[#9CA3AF]" />
                          </div>
                        )}
                        <p className="font-medium text-[#1A1A2E] truncate max-w-[180px]">{p.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.sale_price ? (
                        <div>
                          <span className="font-medium text-[#EF4444]">₹{p.sale_price}</span>
                          <span className="block text-xs text-[#9CA3AF] line-through">₹{p.base_price}</span>
                        </div>
                      ) : (
                        <span className="font-medium text-[#1A1A2E]">₹{p.base_price}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#4B5563]">
                      {p.min_order_qty || 1} {p.unit || "pc"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative inline-block">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs md:text-sm font-semibold border cursor-pointer ${
                            STATUS_BADGE[p.status] || STATUS_BADGE.draft
                          }`}
                          onMouseEnter={() => p.status === "rejected" && setHoveredRejected(p.id)}
                          onMouseLeave={() => setHoveredRejected(null)}
                        >
                          {STATUS_LABEL[p.status] || p.status}
                        </span>
                        {p.status === "rejected" && hoveredRejected === p.id && p.review_notes && (
                          <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#1A1A2E] text-white text-xs md:text-sm rounded-lg p-3 shadow-lg z-50 pointer-events-none">
                            <p className="font-semibold mb-2">Rejection Reason:</p>
                            <p className="text-white/90 leading-relaxed">{p.review_notes}</p>
                            <div className="absolute top-full left-4 w-2 h-2 bg-[#1A1A2E] transform rotate-45"></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#9CA3AF]">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/seller/dashboard/products/${p.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#1A6FD4] bg-[#EAF2FF] rounded-lg hover:bg-[#D6E8FF] transition-colors"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#E8EEF4]">
              <p className="text-sm text-[#9CA3AF]">
                Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E8EEF4] text-sm text-[#9CA3AF] hover:bg-[#F8FBFF] disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <span className="text-sm font-medium text-[#1A1A2E]">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E8EEF4] text-sm text-[#9CA3AF] hover:bg-[#F8FBFF] disabled:opacity-40 transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
