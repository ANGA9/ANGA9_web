"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { sellerFetch, effectiveSellerId } from "@/lib/api";
import { bulkApi } from "@/lib/bulkApi";
import Link from "next/link";
import { Loader2, ArrowLeft, Save, Search, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Product {
  id: string;
  name: string;
  base_price: number;
  sale_price?: number;
  status: string;
}

interface ProductEditState {
  base_price: number;
  sale_price: number | "";
  dirty: boolean;
}

export default function BulkEditPage() {
  const { loading: authLoading, getToken, dbUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [edits, setEdits] = useState<Record<string, ProductEditState>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const fetchProducts = useCallback(async () => {
    if (authLoading || !dbUser) return;
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const params = new URLSearchParams({
        seller_id: effectiveSellerId(dbUser.id),
        limit: "100", // Bulk edit loads up to 100 for now
      });
      if (search) params.set("search", search);
      
      const res = await sellerFetch(`${API}/api/products?${params}`);
      if (res.ok) {
        const d = await res.json();
        const items: Product[] = d.data || [];
        setProducts(items);
        
        // Initialize edit state
        const initialEdits: Record<string, ProductEditState> = {};
        items.forEach(p => {
          initialEdits[p.id] = {
            base_price: p.base_price,
            sale_price: p.sale_price ?? "",
            dirty: false,
          };
        });
        setEdits(initialEdits);
      }
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [authLoading, dbUser, getToken, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEdit = (id: string, field: keyof ProductEditState, value: number | "") => {
    setEdits(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
        dirty: true,
      }
    }));
  };

  const handleSaveAll = async () => {
    const changed = Object.entries(edits)
      .filter(([_, state]) => state.dirty)
      .map(([id, state]) => ({
        id,
        base_price: state.base_price,
        sale_price: state.sale_price === "" ? null : state.sale_price,
      }));

    if (changed.length === 0) {
      toast("No changes to save", { icon: "ℹ️" });
      return;
    }

    setSaving(true);
    try {
      await bulkApi.updatePrices(changed);
      toast.success(`Successfully updated ${changed.length} products`);
      // Reset dirty flags
      setEdits(prev => {
        const next = { ...prev };
        changed.forEach(c => {
          if (next[c.id]) next[c.id].dirty = false;
        });
        return next;
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to update products");
    } finally {
      setSaving(false);
    }
  };

  const dirtyCount = Object.values(edits).filter(e => e.dirty).length;

  return (
    <main className="w-full mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/seller/dashboard/products" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </Link>
          <div>
            <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Bulk Edit Prices</h1>
            <p className="text-[15px] text-gray-500 font-medium">Rapidly update base and sale prices across your catalog</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {dirtyCount > 0 && (
            <span className="text-[14px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              {dirtyCount} unsaved change{dirtyCount !== 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={handleSaveAll}
            disabled={saving || dirtyCount === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1A6FD4] text-[14px] font-bold text-white transition-all shadow-md hover:bg-[#155ab0] disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save All Changes
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-3xl border border-gray-200 p-4 mb-6 shadow-sm flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-2.5 text-[14px] font-medium text-gray-900 outline-none focus:bg-white focus:border-[#1A6FD4] focus:ring-2 focus:ring-[#1A6FD4]/10 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 text-[13px] font-medium text-gray-500">
          <AlertCircle className="w-4 h-4 text-gray-400" />
          Sale price must be lower than base price. Leave sale price empty to remove it.
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-1/2">Product Name</th>
                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-1/4">Base Price (₹)</th>
                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-1/4">Sale Price (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4] mx-auto" />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-[15px] font-medium text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const state = edits[p.id];
                  if (!state) return null;
                  const hasError = state.sale_price !== "" && state.sale_price >= state.base_price;

                  return (
                    <tr key={p.id} className={`hover:bg-gray-50/50 transition-colors ${state.dirty ? 'bg-blue-50/20' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[14px] text-gray-900 truncate pr-4">
                          {p.name}
                        </div>
                        {state.dirty && <span className="text-[11px] font-bold text-[#1A6FD4] mt-1">Edited</span>}
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="1"
                          value={state.base_price}
                          onChange={(e) => handleEdit(p.id, "base_price", Number(e.target.value) || 0)}
                          className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-[14px] font-bold text-gray-900 focus:outline-none focus:border-[#1A6FD4] focus:ring-2 focus:ring-[#1A6FD4]/10 transition-all"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="1"
                          placeholder="Optional"
                          value={state.sale_price}
                          onChange={(e) => handleEdit(p.id, "sale_price", e.target.value === "" ? "" : Number(e.target.value))}
                          className={`w-full h-10 px-3 rounded-xl border bg-white text-[14px] font-bold focus:outline-none focus:ring-2 transition-all ${
                            hasError
                              ? "border-red-300 text-red-700 focus:border-red-500 focus:ring-red-500/20"
                              : "border-gray-200 text-gray-900 focus:border-[#1A6FD4] focus:ring-[#1A6FD4]/10"
                          }`}
                        />
                        {hasError && (
                          <p className="text-[11px] font-bold text-red-600 mt-1">Must be &lt; Base Price</p>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
