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
import Header from "@/components/Header";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

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
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "draft", label: "Draft" },
  { key: "pending_review", label: "Pending Review" },
  { key: "archived", label: "Archived" },
  { key: "rejected", label: "Rejected" },
];

const STATUS_BADGE: Record<string, string> = {
  active: "bg-[#F0FDF4] text-[#22C55E]",
  draft: "bg-[#F3F4F6] text-[#9CA3AF]",
  pending_review: "bg-[#FFFBEB] text-[#F59E0B]",
  archived: "bg-[#F3F4F6] text-[#6B7280]",
  rejected: "bg-[#FEF2F2] text-[#EF4444]",
};

const MOD_BADGE: Record<string, string> = {
  approved: "bg-[#F0FDF4] text-[#22C55E]",
  pending: "bg-[#FFFBEB] text-[#F59E0B]",
  rejected: "bg-[#FEF2F2] text-[#EF4444]",
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
    <div className="min-h-screen">
      <Header />
      <main className="p-6 xl:p-8">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-anga-text">Products</h1>
          <p className="text-sm md:text-base text-anga-text-secondary">
            {total} product{total !== 1 ? "s" : ""} total
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-anga-border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Status tabs */}
            <div className="flex flex-wrap gap-1">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors",
                    statusFilter === tab.key
                      ? "bg-[#1A6FD4] text-white"
                      : "text-anga-text-secondary hover:bg-anga-bg"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-anga-text-secondary" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="h-9 w-full rounded-lg border border-anga-border bg-white pl-9 pr-3 text-sm text-anga-text placeholder:text-anga-text-secondary/60 focus:border-[#1A6FD4] focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/10 transition-colors"
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

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="w-6 h-6 animate-spin text-[#1A6FD4]" />
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl border border-anga-border p-12 text-center">
            <Package className="w-12 h-12 text-[#E8EEF4] mx-auto mb-4" />
            <h2 className="text-base md:text-lg font-bold text-anga-text mb-2">No Products Found</h2>
            <p className="text-sm md:text-base text-anga-text-secondary">
              {search ? "Try a different search term" : "No products match the selected filter"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-anga-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-anga-border bg-[#F8FBFF]">
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Product</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Seller</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Category</th>
                    <th className="text-right px-4 py-3 font-semibold text-[#4B5563]">Price</th>
                    <th className="text-center px-4 py-3 font-semibold text-[#4B5563]">Stock</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Moderation</th>
                    <th className="text-center px-4 py-3 font-semibold text-[#4B5563]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-anga-border last:border-0 hover:bg-[#F8FBFF] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-anga-border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-anga-bg flex items-center justify-center">
                              <Package className="w-5 h-5 text-anga-text-secondary" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-anga-text truncate max-w-[200px]">{p.name}</p>
                            {p.is_featured && (
                              <span className="text-xs text-[#F59E0B] font-medium flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-current" /> Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-anga-text-secondary truncate max-w-[140px]">
                        {p.seller_name}
                      </td>
                      <td className="px-4 py-3 text-anga-text-secondary">{p.category_name}</td>
                      <td className="px-4 py-3 text-right font-medium text-anga-text">
                        {p.sale_price ? (
                          <div>
                            <span className="text-[#EF4444]">{formatINR(p.sale_price)}</span>
                            <span className="block text-xs text-anga-text-secondary line-through">
                              {formatINR(p.base_price)}
                            </span>
                          </div>
                        ) : (
                          formatINR(p.base_price)
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            "font-medium",
                            p.stock <= 0
                              ? "text-[#EF4444]"
                              : p.stock < 10
                              ? "text-[#F59E0B]"
                              : "text-anga-text"
                          )}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex px-2 py-0.5 rounded-full text-xs font-semibold",
                            STATUS_BADGE[p.status] || "bg-gray-100 text-gray-600"
                          )}
                        >
                          {capitalize(p.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex px-2 py-0.5 rounded-full text-xs font-semibold",
                            MOD_BADGE[p.moderation_status] || "bg-gray-100 text-gray-600"
                          )}
                        >
                          {capitalize(p.moderation_status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => toggleFeatured(p.id, p.is_featured)}
                            disabled={actionLoading === p.id}
                            className="p-1.5 rounded-md hover:bg-anga-bg transition-colors disabled:opacity-50"
                            title={p.is_featured ? "Remove featured" : "Mark featured"}
                          >
                            {p.is_featured ? (
                              <StarOff className="w-4 h-4 text-[#F59E0B]" />
                            ) : (
                              <Star className="w-4 h-4 text-anga-text-secondary" />
                            )}
                          </button>
                          {p.status !== "archived" && (
                            <button
                              onClick={() => archiveProduct(p.id)}
                              disabled={actionLoading === p.id}
                              className="p-1.5 rounded-md hover:bg-anga-bg transition-colors disabled:opacity-50"
                              title="Archive product"
                            >
                              <Archive className="w-4 h-4 text-anga-text-secondary" />
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
              <div className="flex items-center justify-between px-4 py-3 border-t border-anga-border">
                <p className="text-sm text-anga-text-secondary">
                  Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-anga-border text-sm text-anga-text-secondary hover:bg-anga-bg disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <span className="text-sm font-medium text-anga-text">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-anga-border text-sm text-anga-text-secondary hover:bg-anga-bg disabled:opacity-40 transition-colors"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
