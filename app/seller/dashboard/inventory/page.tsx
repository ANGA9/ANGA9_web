"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2, Package, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  status: string;
  base_price: number;
  images?: { url: string }[];
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
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState("");
  const [editThreshold, setEditThreshold] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    try {
      const prodRes = await api.get<{ products?: Product[]; data?: Product[]; total?: number }>(
        "/api/products?seller_id=me&limit=100",
        { silent: true }
      );
      const products = prodRes?.products || prodRes?.data || [];

      const stockPromises = products.map(async (p) => {
        try {
          const s = await api.get<StockRecord | StockRecord[]>(`/api/inventory/${p.id}`, { silent: true });
          const stock = Array.isArray(s) ? s[0] || null : s;
          return { product: p, stock };
        } catch {
          return { product: p, stock: null };
        }
      });

      const results = await Promise.all(stockPromises);
      setRows(results);
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
      await api.patch(`/api/inventory/${productId}`, {
        quantity: parseInt(editQty, 10),
        low_stock_threshold: parseInt(editThreshold, 10),
      });
      toast.success("Stock updated");
      setEditingId(null);
      setRows((prev) =>
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
      toast.error("Failed to update stock");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4]" />
      </div>
    );
  }

  const lowStockCount = rows.filter(
    (r) => r.stock && r.stock.quantity > 0 && r.stock.quantity <= r.stock.low_stock_threshold
  ).length;
  const outOfStockCount = rows.filter((r) => !r.stock || r.stock.quantity <= 0).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-[#1A1A2E]">Inventory</h1>
        <p className="text-sm text-[#9CA3AF]">Manage stock levels for your products</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#E8EEF4] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#EAF2FF]">
            <Package className="w-5 h-5 text-[#1A6FD4]" />
          </div>
          <div>
            <p className="text-xl font-bold text-[#1A1A2E]">{rows.length}</p>
            <p className="text-xs text-[#9CA3AF]">Total Products</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E8EEF4] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#FFFBEB]">
            <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <p className="text-xl font-bold text-[#1A1A2E]">{lowStockCount}</p>
            <p className="text-xs text-[#9CA3AF]">Low Stock</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E8EEF4] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#FEF2F2]">
            <XCircle className="w-5 h-5 text-[#EF4444]" />
          </div>
          <div>
            <p className="text-xl font-bold text-[#1A1A2E]">{outOfStockCount}</p>
            <p className="text-xs text-[#9CA3AF]">Out of Stock</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E8EEF4] overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-10 h-10 mx-auto mb-2 text-[#E8EEF4]" />
            <p className="text-sm text-[#9CA3AF]">No products found. Add products first.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FBFF] border-b border-[#E8EEF4]">
                  <th className="text-left px-5 py-3 font-semibold text-[#4B5563]">Product</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#4B5563]">Price</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#4B5563]">Stock</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#4B5563]">Reserved</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#4B5563]">Status</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#4B5563]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const qty = row.stock?.quantity ?? 0;
                  const threshold = row.stock?.low_stock_threshold ?? 10;
                  const isEditing = editingId === row.product.id;

                  let statusLabel = "In Stock";
                  let statusBg = "#F0FDF4";
                  let statusColor = "#22C55E";
                  if (qty <= 0) {
                    statusLabel = "Out of Stock";
                    statusBg = "#FEF2F2";
                    statusColor = "#EF4444";
                  } else if (qty <= threshold) {
                    statusLabel = "Low Stock";
                    statusBg = "#FFFBEB";
                    statusColor = "#F59E0B";
                  }

                  return (
                    <tr key={row.product.id} className="border-b border-[#E8EEF4] last:border-0 hover:bg-[#F8FBFF]">
                      <td className="px-5 py-3">
                        <p className="font-medium text-[#1A1A2E] truncate max-w-[200px]">{row.product.name}</p>
                      </td>
                      <td className="px-5 py-3 text-[#1A1A2E]">{formatINR(row.product.base_price)}</td>
                      <td className="px-5 py-3">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editQty}
                            onChange={(e) => setEditQty(e.target.value)}
                            className="w-20 h-8 rounded border border-[#E8EEF4] px-2 text-sm focus:border-[#1A6FD4] focus:outline-none"
                          />
                        ) : (
                          <span className="font-bold text-[#1A1A2E]">{qty}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-[#9CA3AF]">{row.stock?.reserved ?? 0}</td>
                      <td className="px-5 py-3">
                        <span
                          className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: statusBg, color: statusColor }}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(row.product.id)}
                              disabled={saving}
                              className="px-3 py-1 rounded-lg text-xs font-bold text-white disabled:opacity-50"
                              style={{ background: "#22C55E" }}
                            >
                              {saving ? <Loader2 className="w-3 h-3 animate-spin inline" /> : "Save"}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1 rounded-lg border text-xs font-bold"
                              style={{ borderColor: "#E8EEF4", color: "#4B5563" }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(row)}
                            className="text-xs font-semibold hover:underline"
                            style={{ color: "#1A6FD4" }}
                          >
                            Edit Stock
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
