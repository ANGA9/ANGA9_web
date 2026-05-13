"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import {
  Loader2,
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  StarOff,
  Archive,
} from "lucide-react";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  sale_price: number | null;
  status: string;
  moderation_status: string;
  is_featured: boolean;
  seller_id: string;
  seller_name: string;
  category_name: string;
  stock: number;
  reserved: number;
  image: string | null;
  created_at: string;
}

const STATUS_TABS = [
  { key: "all", label: "All Products" },
  { key: "active", label: "Active" },
  { key: "draft", label: "Draft" },
  { key: "pending_review", label: "Pending" },
  { key: "archived", label: "Archived" },
  { key: "rejected", label: "Rejected" },
];

const STATUS_BADGE: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  pending_review: "bg-yellow-50 text-yellow-700 border-yellow-200",
  archived: "bg-gray-100 text-gray-500 border-gray-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const MOD_BADGE: Record<string, string> = {
  approved: "bg-green-50 text-green-700 border-green-200",
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

function formatINR(value: number) {
  return "\u20B9" + Number(value).toLocaleString("en-IN");
}

function capitalize(s: string) {
  return s
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const limit = 20;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await api.get<{ products: Product[]; total: number }>(
        `/api/admin/products/all?${params}`,
        { silent: true }
      );
      if (res) {
        setProducts(res.products);
        setTotal(res.total);
      }
    } catch {
      toast.error("Failed to load products");
    }
    setLoading(false);
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleTabChange = (key: string) => {
    setPage(1);
    setStatusFilter(key);
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    setActionLoading(id);
    try {
      await api.patch(`/api/admin/products/${id}/feature`, { featured: !featured });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_featured: !featured } : p))
      );
      toast.success(featured ? "Removed from featured" : "Marked as featured");
    } catch {
      toast.error("Failed to update featured status");
    }
    setActionLoading(null);
  };

  const archiveProduct = async (id: string) => {
    setActionLoading(id);
    try {
      await api.patch(`/api/products/${id}`, { status: "archived" });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "archived" } : p))
      );
      toast.success("Product archived");
    } catch {
      toast.error("Failed to archive product");
    }
    setActionLoading(null);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Products Registry</h1>
          <p className="text-[15px] text-gray-500 font-medium">{total} product{total !== 1 ? "s" : ""} on platform</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-2xl shadow-sm w-full sm:w-auto overflow-x-auto no-scrollbar">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-[14px] font-bold transition-all ${
                  statusFilter === tab.key
                    ? "bg-[#8B5CF6] text-white shadow-md shadow-purple-500/20"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full h-11 pl-10 pr-16 bg-white border border-gray-200 rounded-2xl text-[14px] font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm"
            />
            <button
              onClick={handleSearch}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-[13px] font-bold transition-colors"
            >
              Go
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-[#8B5CF6]" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Package className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-[20px] font-bold text-gray-900 mb-2">No Products Found</h2>
          <p className="text-[15px] text-gray-500 font-medium">
            {search ? "Try adjusting your search query." : "There are no products matching this filter."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[25%]">Product</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Seller</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Price</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-center">Stock</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                          {p.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex flex-col justify-center">
                          <p className="font-bold text-[14px] text-gray-900 truncate max-w-[200px]">{p.name}</p>
                          {p.is_featured && (
                            <span className="text-[11px] font-black tracking-wide uppercase text-yellow-600 flex items-center gap-1 mt-0.5">
                              <Star className="w-3 h-3 fill-current" /> Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-medium text-gray-600 truncate max-w-[150px] block">
                        {p.seller_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-[12px] font-bold">
                        {p.category_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.sale_price ? (
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-[15px] text-red-600">{formatINR(p.sale_price)}</span>
                          <span className="text-[12px] font-medium text-gray-400 line-through">{formatINR(p.base_price)}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-[15px] text-gray-900">{formatINR(p.base_price)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[15px] font-black ${p.stock <= 0 ? 'text-red-500' : p.stock < 10 ? 'text-yellow-500' : 'text-gray-900'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide ${STATUS_BADGE[p.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                          {capitalize(p.status)}
                        </span>
                        {(p.moderation_status === "pending" || p.moderation_status === "rejected") && (
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${MOD_BADGE[p.moderation_status]}`}>
                            Mod: {capitalize(p.moderation_status)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleFeatured(p.id, p.is_featured)}
                          disabled={actionLoading === p.id}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-yellow-50 text-gray-400 hover:text-yellow-500 transition-colors disabled:opacity-50"
                          title={p.is_featured ? "Remove featured" : "Mark featured"}
                        >
                          {actionLoading === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : p.is_featured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                        </button>
                        {p.status !== "archived" && (
                          <button
                            onClick={() => archiveProduct(p.id)}
                            disabled={actionLoading === p.id}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                            title="Archive product"
                          >
                            {actionLoading === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <span className="text-[13px] font-medium text-gray-500">
                Showing <span className="font-bold text-gray-900">{(page - 1) * limit + 1}</span>-
                <span className="font-bold text-gray-900">{Math.min(page * limit, total)}</span> of <span className="font-bold text-gray-900">{total}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-[13px] font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <div className="w-10 text-center text-[13px] font-black text-gray-900">{page}</div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-[13px] font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
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
