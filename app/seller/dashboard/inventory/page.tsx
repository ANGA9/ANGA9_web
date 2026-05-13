"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, Package, AlertTriangle, XCircle, ChevronLeft, ChevronRight, Pencil, Check, X, Search } from "lucide-react";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Product {
  id: string;
  name: string;
  status: string;
  base_price: number;
  images?: string[];
}

interface StockRecord {
  product_id: string;
  variant_id?: string;
  quantity: number;
  reserved: number;
  low_stock_threshold: number;
}

interface InventoryRow {
  product: Product;
  stock: StockRecord | null;
}

function formatINR(v: number) {
  return "\u20B9" + v.toLocaleString("en-IN");
}

export default function InventoryPage() {
  const { loading: authLoading, getToken, dbUser } = useAuth();
  const [allRows, setAllRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState("");
  const [editThreshold, setEditThreshold] = useState("");
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 20;

  useEffect(() => {
    if (!authLoading && dbUser) fetchInventory();
  }, [authLoading, dbUser]);

  async function fetchInventory() {
    if (!dbUser) return;
    try {
      const token = await getToken();
      if (!token) return;

      const params = new URLSearchParams({
        seller_id: dbUser.id,
        status: "active,pending_review,draft,archived,rejected",
        limit: "200",
      });
      const res = await fetch(`${API}/api/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setLoading(false); return; }
      const prodRes = await res.json();
      const products: Product[] = prodRes?.data || prodRes?.products || [];

      const batchSize = 10;
      const results: InventoryRow[] = [];
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (p) => {
            try {
              const stockRes = await fetch(`${API}/api/inventory/${p.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (!stockRes.ok) return { product: p, stock: null };
              const s = await stockRes.json();
              const stock = Array.isArray(s) ? s[0] || null : s;
              return { product: p, stock };
            } catch {
              return { product: p, stock: null };
            }
          })
        );
        results.push(...batchResults);
      }
      setAllRows(results);
    } catch { /* ignore */ }
    setLoading(false);
  }

  const startEdit = (row: InventoryRow) => {
    setEditingId(row.product.id);
    setEditQty(String(row.stock?.quantity ?? 0));
    setEditThreshold(String(row.stock?.low_stock_threshold ?? 10));
  };

  const handleSave = async (productId: string) => {
    setSaving(true);
    try {
      const token = await getToken();
      if (!token) { setSaving(false); return; }
      const res = await fetch(`${API}/api/inventory/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quantity: parseInt(editQty, 10),
          low_stock_threshold: parseInt(editThreshold, 10),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Stock updated successfully", {
        style: {
          borderRadius: '16px',
          background: '#333',
          color: '#fff',
        },
      });
      setEditingId(null);
      setAllRows((prev) =>
        prev.map((r) =>
          r.product.id === productId
            ? {
                ...r,
                stock: {
                  product_id: productId,
                  quantity: parseInt(editQty, 10),
                  reserved: r.stock?.reserved ?? 0,
                  low_stock_threshold: parseInt(editThreshold, 10),
                },
              }
            : r
        )
      );
    } catch {
      toast.error("Failed to update stock", {
        style: {
          borderRadius: '16px',
        },
      });
    }
    setSaving(false);
  };

  const filteredRows = allRows.filter(r => r.product.name.toLowerCase().includes(search.toLowerCase()));

  const lowStockCount = allRows.filter(
    (r) => r.stock && r.stock.quantity > 0 && r.stock.quantity <= r.stock.low_stock_threshold
  ).length;
  const outOfStockCount = allRows.filter((r) => !r.stock || r.stock.quantity <= 0).length;

  const totalPages = Math.ceil(filteredRows.length / limit);
  const paginated = filteredRows.slice((page - 1) * limit, page * limit);

  return (
    <main className="w-full mx-auto max-w-7xl px-3 sm:px-4 py-6 md:px-8 md:py-10 text-[#1A1A2E]">
      
      {/* ── Desktop Header ── */}
      <div className="hidden md:flex items-center justify-between mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Inventory</h1>
          <p className="text-[15px] text-gray-500 font-medium">Manage stock levels, low stock alerts, and track reservations.</p>
        </div>
      </div>

      {/* ── Mobile Header ── */}
      <div className="md:hidden flex flex-col gap-1 mb-6">
        <h1 className="text-[24px] font-bold tracking-tight text-gray-900">Inventory</h1>
        <p className="text-[14px] text-gray-500 font-medium">Manage stock levels.</p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-50 mb-4 text-[#1A6FD4]">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[32px] font-bold text-gray-900 leading-none mb-1">{allRows.length}</p>
            <p className="text-[14px] font-medium text-gray-500">Total Products</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-yellow-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-yellow-50 mb-4 text-yellow-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[32px] font-bold text-gray-900 leading-none mb-1">{lowStockCount}</p>
            <p className="text-[14px] font-medium text-gray-500">Low Stock Alerts</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-red-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-red-50 mb-4 text-red-500">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[32px] font-bold text-gray-900 leading-none mb-1">{outOfStockCount}</p>
            <p className="text-[14px] font-medium text-gray-500">Out of Stock</p>
          </div>
        </div>
      </div>

      {/* ── Search & Filters ── */}
      <div className="bg-white rounded-3xl border border-gray-200 p-4 md:p-5 mb-6 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-3 text-[14px] font-medium text-gray-900 outline-none focus:bg-white focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

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
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          {filteredRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-[18px] font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-[14px] font-medium text-gray-500">
                {search ? `No products matching "${search}"` : "You haven't added any products to manage inventory."}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200">
                      <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Price</th>
                      <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Available Stock</th>
                      <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Low Alert At</th>
                      <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Reserved</th>
                      <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginated.map((row) => {
                      const qty = row.stock?.quantity ?? 0;
                      const threshold = row.stock?.low_stock_threshold ?? 10;
                      const isEditing = editingId === row.product.id;

                      let statusLabel = "In Stock";
                      let statusClasses = "bg-green-50 text-green-700 border-green-200";
                      
                      if (qty <= 0) {
                        statusLabel = "Out of Stock";
                        statusClasses = "bg-red-50 text-red-700 border-red-200";
                      } else if (qty <= threshold) {
                        statusLabel = "Low Stock";
                        statusClasses = "bg-yellow-50 text-yellow-700 border-yellow-200";
                      }

                      return (
                        <tr key={row.product.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 shrink-0 hidden sm:flex items-center justify-center">
                                {row.product.images && row.product.images.length > 0 ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={row.product.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                  <Package className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-[15px] text-gray-900 truncate max-w-[200px] lg:max-w-[300px] mb-1.5">
                                  {row.product.name}
                                </p>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wide ${statusClasses}`}>
                                  {statusLabel}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-[15px] font-bold text-gray-900 hidden md:table-cell">
                            {formatINR(row.product.base_price)}
                          </td>
                          <td className="px-6 py-5">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editQty}
                                onChange={(e) => setEditQty(e.target.value)}
                                className="w-24 rounded-xl border border-gray-300 bg-white px-3 py-2 text-[14px] font-bold text-gray-900 outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all"
                              />
                            ) : (
                              <span className="font-bold text-[16px] text-gray-900">{qty}</span>
                            )}
                          </td>
                          <td className="px-6 py-5 hidden sm:table-cell">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={editThreshold}
                                onChange={(e) => setEditThreshold(e.target.value)}
                                className="w-24 rounded-xl border border-gray-300 bg-white px-3 py-2 text-[14px] font-bold text-gray-900 outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all"
                              />
                            ) : (
                              <span className="text-[15px] font-medium text-gray-500">{threshold}</span>
                            )}
                          </td>
                          <td className="px-6 py-5 hidden lg:table-cell">
                            <span className="text-[15px] font-medium text-gray-400">{row.stock?.reserved ?? 0} units</span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleSave(row.product.id)}
                                  disabled={saving}
                                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50"
                                  title="Save Stock"
                                >
                                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-5 h-5" />}
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                  title="Cancel"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startEdit(row)}
                                className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 text-gray-500 border border-gray-200 hover:bg-white hover:border-[#1A6FD4] hover:text-[#1A6FD4] hover:shadow-sm transition-all active:scale-95"
                                title="Edit Stock"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
                  <p className="text-[14px] font-medium text-gray-500 hidden sm:block">
                    Showing <span className="font-bold text-gray-900">{(page - 1) * limit + 1}</span> to <span className="font-bold text-gray-900">{Math.min(page * limit, filteredRows.length)}</span> of <span className="font-bold text-gray-900">{filteredRows.length}</span>
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
            </>
          )}
        </div>
      )}
    </main>
  );
}
