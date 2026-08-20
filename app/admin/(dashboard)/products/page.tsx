"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import {
  Loader2,
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  StarOff,
  Archive,
  ArchiveRestore,
  Percent,
} from "lucide-react";
import toast from "react-hot-toast";
import { cdnUrl } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  sale_price: number | null;
  commission_rate?: number | null;
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
  const { dbUser } = useAuth();
  const isSuperAdmin = dbUser?.admin_level === "super_admin";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Commission Modal State
  const [editingCommission, setEditingCommission] = useState<Product | null>(null);
  const [commissionInput, setCommissionInput] = useState<string>("");
  const [savingCommission, setSavingCommission] = useState(false);

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

  const toggleArchiveProduct = async (id: string, currentStatus: string) => {
    setActionLoading(id);
    const newStatus = currentStatus === "archived" ? "active" : "archived";
    try {
      try {
        if (newStatus === "archived") {
          await api.patch(`/api/admin/products/${id}/archive`, {});
        } else {
          await api.patch(`/api/admin/products/${id}/unarchive`, {});
        }
      } catch {
        await api.patch(`/api/products/${id}`, { status: newStatus });
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
      toast.success(newStatus === "archived" ? "Product archived from storefront" : "Product restored to active");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update product status");
    }
    setActionLoading(null);
  };

  const handleEditCommission = (product: Product) => {
    setEditingCommission(product);
    setCommissionInput(
      product.commission_rate !== null && product.commission_rate !== undefined
        ? (product.commission_rate * 100).toString()
        : ""
    );
  };

  const saveCommission = async () => {
    if (!editingCommission) return;
    
    let rate: number | null = null;
    if (commissionInput.trim() !== "") {
      rate = parseFloat(commissionInput) / 100;
      if (isNaN(rate) || rate < 0 || rate > 1) {
        toast.error("Please enter a valid percentage between 0 and 100");
        return;
      }
    }

    setSavingCommission(true);
    try {
      await api.patch(`/api/products/${editingCommission.id}/commission`, { commission_rate: rate });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingCommission.id ? { ...p, commission_rate: rate } : p
        )
      );
      toast.success("Commission rate updated");
      setEditingCommission(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update commission rate");
    }
    setSavingCommission(false);
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
      </div>

      {/* ── Tabs & Search ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0" style={{ scrollbarWidth: "none" }}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all whitespace-nowrap ${
                statusFilter === tab.key
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-[13px] bg-white outline-none focus:border-gray-900 transition-colors"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 rounded-xl bg-gray-900 text-white text-[13px] font-bold hover:bg-gray-800 transition-colors shrink-0"
          >
            Search
          </button>
        </div>
      </div>

      {/* ── Products Table ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <p className="text-[13px] font-medium text-gray-400">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center p-4">
            <Package className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-[15px] font-bold text-gray-900">No products found</p>
            <p className="text-[13px] text-gray-400 mt-1">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[25%]">Product</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Seller</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Wholesale / MRP</th>
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
                            <img src={cdnUrl(p.image)} alt={p.name} className="w-full h-full object-cover" />
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
                      {(p.commission_rate !== null && p.commission_rate !== undefined) && (
                        <div className="mt-1 flex justify-end">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                            Com: {p.commission_rate * 100}%
                          </span>
                        </div>
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
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleEditCommission(p)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors"
                            title="Edit Commission Override"
                          >
                            <Percent className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => toggleFeatured(p.id, p.is_featured)}
                          disabled={actionLoading === p.id}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-yellow-50 text-gray-400 hover:text-yellow-500 transition-colors disabled:opacity-50"
                          title={p.is_featured ? "Remove featured" : "Mark featured"}
                        >
                          {actionLoading === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : p.is_featured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => toggleArchiveProduct(p.id, p.status)}
                          disabled={actionLoading === p.id}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 ${
                            p.status === "archived"
                              ? "hover:bg-green-50 text-green-600"
                              : "hover:bg-red-50 text-gray-400 hover:text-red-500"
                          }`}
                          title={p.status === "archived" ? "Restore / Unarchive Product" : "Archive product"}
                        >
                          {actionLoading === p.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : p.status === "archived" ? (
                            <ArchiveRestore className="w-4 h-4" />
                          ) : (
                            <Archive className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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

      {/* Commission Modal */}
      {editingCommission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Edit Commission Rate</h3>
              <p className="text-sm text-gray-500 font-medium mt-1 truncate">
                {editingCommission.name}
              </p>
            </div>
            <div className="p-6">
              <label className="block text-[13px] font-bold text-gray-700 mb-2">
                Custom Commission Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={commissionInput}
                onChange={(e) => setCommissionInput(e.target.value)}
                placeholder="e.g. 5 (Leave empty for default)"
                className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-[14px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm"
              />
              <p className="mt-2 text-xs text-gray-500">
                Leave empty to fallback to the seller's tier commission rate.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setEditingCommission(null)}
                className="px-4 py-2 rounded-xl text-[13px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                disabled={savingCommission}
              >
                Cancel
              </button>
              <button
                onClick={saveCommission}
                disabled={savingCommission}
                className="px-5 py-2 rounded-xl text-[13px] font-bold disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2 bg-white border-2 border-[#8B5CF6] text-[#8B5CF6] hover:bg-gray-50"
              >
                {savingCommission && <Loader2 className="w-4 h-4 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
