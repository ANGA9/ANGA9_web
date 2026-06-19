"use client";

import { useState, useEffect } from "react";
import { dealsApi, type Deal } from "@/lib/dealsApi";
import { api } from "@/lib/api";
import { Plus, Tag, Search, Calendar, Clock, Loader2, ArrowRight, X, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface ProductOption {
  id: string;
  name: string;
  base_price: number;
  sale_price?: number;
}

export default function SellerDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const data = await dealsApi.getDeals();
      setDeals(data);
    } catch {
      toast.error("Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this deal?")) return;
    try {
      await dealsApi.deleteDeal(id);
      toast.success("Deal removed");
      setDeals((prev) => prev.filter((d) => d.id !== id));
    } catch {
      toast.error("Failed to delete deal");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotional Deals</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your product discounts, flash sales, and special offers.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-[#1A6FD4] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Deal
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4]" />
          </div>
        ) : deals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Tag className="w-8 h-8 text-[#1A6FD4]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No deals active</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-sm">
              You haven't created any promotional deals yet. Boost your sales by offering limited-time discounts!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 font-semibold text-[#1A6FD4] hover:underline"
            >
              Create your first deal
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Deal Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Timeline</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deals.map((deal) => {
                  const now = new Date();
                  const start = new Date(deal.starts_at);
                  const end = new Date(deal.ends_at);
                  let status = "Inactive";
                  let statusColor = "bg-gray-100 text-gray-700";
                  
                  if (deal.active) {
                    if (now < start) {
                      status = "Scheduled";
                      statusColor = "bg-amber-100 text-amber-700";
                    } else if (now > end) {
                      status = "Expired";
                      statusColor = "bg-red-100 text-red-700";
                    } else {
                      status = "Active";
                      statusColor = "bg-green-100 text-green-700";
                    }
                  }

                  return (
                    <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 max-w-[200px] truncate">
                        {deal.products?.name || "Unknown Product"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">₹{deal.deal_price}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs text-gray-600">
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Start: {start.toLocaleString()}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> End: {end.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(deal.id)}
                          className="text-red-500 hover:text-red-700 font-medium text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <CreateDealModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchDeals();
          }}
        />
      )}
    </div>
  );
}

function CreateDealModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);
  
  const [formData, setFormData] = useState({
    product_id: "",
    type: "flash_sale" as "flash_sale" | "discount",
    deal_price: "",
    starts_at: "",
    ends_at: "",
  });

  useEffect(() => {
    async function loadProducts() {
      setLoadingProducts(true);
      try {
        const res = await api.get<{ data: ProductOption[] }>("/api/products?limit=50");
        setProducts(res.data || []);
      } catch {
        toast.error("Failed to load your products");
      }
      setLoadingProducts(false);
    }
    loadProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id || !formData.deal_price || !formData.starts_at || !formData.ends_at) {
      toast.error("Please fill all fields");
      return;
    }
    
    setSaving(true);
    try {
      await dealsApi.createDeal({
        product_id: formData.product_id,
        type: formData.type,
        deal_price: Number(formData.deal_price),
        starts_at: new Date(formData.starts_at).toISOString(),
        ends_at: new Date(formData.ends_at).toISOString(),
      });
      toast.success("Deal created successfully");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to create deal");
    } finally {
      setSaving(false);
    }
  };

  const selectedProduct = products.find(p => p.id === formData.product_id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Create New Deal</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Select Product</label>
            {loadingProducts ? (
              <div className="h-11 flex items-center px-4 border rounded-xl bg-gray-50 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading products...
              </div>
            ) : (
              <select
                className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:border-[#1A6FD4] focus:ring-1 focus:ring-[#1A6FD4] outline-none"
                value={formData.product_id}
                onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                required
              >
                <option value="" disabled>-- Select a product --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (₹{p.sale_price ?? p.base_price})</option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Deal Type</label>
              <select
                className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:border-[#1A6FD4] outline-none"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="flash_sale">Flash Sale</option>
                <option value="discount">Discount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Deal Price (₹)</label>
              <input
                type="number"
                min="1"
                className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:border-[#1A6FD4] outline-none"
                value={formData.deal_price}
                onChange={e => setFormData({ ...formData, deal_price: e.target.value })}
                placeholder={selectedProduct ? `Max: ₹${selectedProduct.sale_price ?? selectedProduct.base_price}` : "e.g. 499"}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Start Date & Time</label>
              <input
                type="datetime-local"
                className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:border-[#1A6FD4] outline-none"
                value={formData.starts_at}
                onChange={e => setFormData({ ...formData, starts_at: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">End Date & Time</label>
              <input
                type="datetime-local"
                className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:border-[#1A6FD4] outline-none"
                value={formData.ends_at}
                onChange={e => setFormData({ ...formData, ends_at: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.product_id}
              className="flex-1 py-2.5 rounded-xl bg-[#1A6FD4] font-bold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Create Deal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
