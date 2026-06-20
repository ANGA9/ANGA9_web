"use client";

import { useState, useEffect, useRef } from "react";
import { dealsApi, type Deal } from "@/lib/dealsApi";
import { sellerFetch, effectiveSellerId } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Plus, Tag, Search, Calendar, Clock, Loader2, X, ChevronDown, Check } from "lucide-react";
import { toast } from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface ProductOption {
  id: string;
  name: string;
  base_price: number;
  sale_price?: number;
  images?: string[];
}

export default function SellerDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"All Deals" | "Active" | "Scheduled" | "Expired">("All Deals");

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

  // Filter deals based on search and tab
  const now = new Date();
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.products?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const start = new Date(deal.starts_at);
    const end = new Date(deal.ends_at);
    let status = "Inactive";
    if (deal.active) {
      if (now < start) status = "Scheduled";
      else if (now > end) status = "Expired";
      else status = "Active";
    }

    if (activeTab === "All Deals") return true;
    return status === activeTab;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight flex items-center gap-3">
            Promotional Deals
            <span className="text-[14px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{deals.length}</span>
          </h1>
          <p className="text-[15px] text-gray-500 font-medium mt-1">
            Manage your product discounts, flash sales, and special offers.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-[#1A6FD4] px-6 py-3 text-[14px] font-bold text-white shadow-md hover:shadow-lg hover:bg-[#155ab0] active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Deal
        </button>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1">
          {["All Deals", "Active", "Scheduled", "Expired"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-5 py-2.5 rounded-xl text-[14px] font-bold whitespace-nowrap transition-all ${
                activeTab === tab 
                  ? "bg-gray-900 text-white shadow-sm" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-80 px-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search deals by product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-[14px] font-medium focus:outline-none focus:border-[#1A6FD4] focus:ring-2 focus:ring-[#1A6FD4]/10 transition-all"
          />
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#1A6FD4]" />
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
              <Tag className="w-10 h-10 text-[#1A6FD4]" />
            </div>
            <h3 className="text-[20px] font-bold text-gray-900">No deals found</h3>
            <p className="text-[15px] text-gray-500 mt-2 max-w-sm">
              {searchQuery ? "No deals matched your search criteria." : "You haven't created any promotional deals yet. Boost your sales by offering limited-time discounts!"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-8 font-bold text-[#1A6FD4] bg-blue-50 px-6 py-3 rounded-xl hover:bg-blue-100 transition-colors"
              >
                Create your first deal
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[800px]">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-5 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-5/12">Product</th>
                  <th className="px-6 py-5 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Deal Price</th>
                  <th className="px-6 py-5 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-5 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Timeline</th>
                  <th className="px-6 py-5 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDeals.map((deal) => {
                  const start = new Date(deal.starts_at);
                  const end = new Date(deal.ends_at);
                  let status = "Inactive";
                  let statusBadge = "bg-gray-100 text-gray-700 border-gray-200";
                  
                  if (deal.active) {
                    if (now < start) {
                      status = "Scheduled";
                      statusBadge = "bg-amber-50 text-amber-700 border-amber-200";
                    } else if (now > end) {
                      status = "Expired";
                      statusBadge = "bg-red-50 text-red-700 border-red-200";
                    } else {
                      status = "Active";
                      statusBadge = "bg-green-50 text-green-700 border-green-200";
                    }
                  }

                  return (
                    <tr key={deal.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[14px] text-gray-900 line-clamp-2 pr-4">
                          {deal.products?.name || "Unknown Product"}
                        </div>
                        <div className="text-[12px] text-gray-500 font-medium mt-1 flex items-center gap-1">
                          <Tag className="w-3 h-3" /> {
                            deal.type === 'flash' ? 'Flash Sale' : 
                            deal.type === 'deal_of_day' ? 'Deal of the Day' : 
                            deal.type === 'quantity' ? 'Quantity Discount' : deal.type
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-black text-[16px] text-gray-900">₹{deal.deal_price}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-[12px] font-bold border ${statusBadge}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 text-[13px] font-medium text-gray-600">
                          <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /> {start.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                          <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /> {end.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(deal.id)}
                          className="px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 font-bold text-[13px] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
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
  const { dbUser, getToken } = useAuth();
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    product_id: "",
    type: "flash" as "flash" | "deal_of_day" | "quantity",
    deal_price: "",
    start_datetime: "",
    end_datetime: "",
  });

  useEffect(() => {
    async function loadProducts() {
      if (!dbUser) return;
      setLoadingProducts(true);
      try {
        const token = await getToken();
        if (!token) return;
        const params = new URLSearchParams({
          seller_id: effectiveSellerId(dbUser.id),
          limit: "100"
        });
        const res = await sellerFetch(`${API}/api/products?${params}`);
        if (res.ok) {
          const d = await res.json();
          setProducts(d.data || []);
        }
      } catch {
        toast.error("Failed to load your products");
      }
      setLoadingProducts(false);
    }
    loadProducts();
  }, [dbUser, getToken]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id || !formData.deal_price || !formData.start_datetime || !formData.end_datetime) {
      toast.error("Please fill all fields");
      return;
    }
    
    setSaving(true);
    try {
      await dealsApi.createDeal({
        product_id: formData.product_id,
        type: formData.type,
        deal_price: Number(formData.deal_price),
        starts_at: new Date(formData.start_datetime).toISOString(),
        ends_at: new Date(formData.end_datetime).toISOString(),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-[540px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-[20px] font-bold text-gray-900">Create New Deal</h2>
            <p className="text-[13px] font-medium text-gray-500 mt-0.5">Offer a discount to boost your sales</p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="relative" ref={dropdownRef}>
            <label className="block text-[14px] font-bold text-gray-700 mb-2">Select Product</label>
            {loadingProducts ? (
              <div className="h-14 flex items-center px-4 border border-gray-200 rounded-2xl bg-gray-50 text-[14px] font-medium text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-3 text-[#1A6FD4]" /> Loading your catalog...
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full h-14 px-4 border rounded-2xl bg-white text-left flex items-center justify-between transition-all ${
                    isDropdownOpen ? "border-[#1A6FD4] ring-2 ring-[#1A6FD4]/10" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {selectedProduct ? (
                    <div className="flex flex-col">
                      <span className="font-bold text-[14px] text-gray-900 truncate pr-4">{selectedProduct.name}</span>
                      <span className="text-[12px] font-medium text-gray-500">Current Price: ₹{selectedProduct.sale_price ?? selectedProduct.base_price}</span>
                    </div>
                  ) : (
                    <span className="text-[14px] font-medium text-gray-500">-- Select a product --</span>
                  )}
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute z-10 top-[100%] left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-[300px] overflow-y-auto p-2">
                    {products.length === 0 ? (
                      <div className="p-4 text-center text-[14px] font-medium text-gray-500">No products found in your catalog.</div>
                    ) : (
                      products.map(p => {
                        const price = p.sale_price ?? p.base_price;
                        const isSelected = p.id === formData.product_id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, product_id: p.id });
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                              isSelected ? "bg-blue-50 border border-blue-100" : "hover:bg-gray-50 border border-transparent"
                            }`}
                          >
                            <div className="flex items-center gap-3 text-left">
                              <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                                {p.images && p.images[0] ? (
                                  <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <Tag className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className={`font-bold text-[14px] line-clamp-1 ${isSelected ? "text-[#1A6FD4]" : "text-gray-900"}`}>{p.name}</span>
                                <span className="font-bold text-[13px] text-gray-500">₹{price}</span>
                              </div>
                            </div>
                            {isSelected && <Check className="w-5 h-5 text-[#1A6FD4] shrink-0 ml-2" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[14px] font-bold text-gray-700 mb-2">Deal Type</label>
              <select
                className="w-full h-12 px-4 border border-gray-200 rounded-xl text-[14px] font-bold text-gray-900 focus:border-[#1A6FD4] focus:ring-2 focus:ring-[#1A6FD4]/10 outline-none transition-all appearance-none bg-white"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em' }}
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="flash">⚡ Flash Sale</option>
                <option value="deal_of_day">🏷️ Deal of the Day</option>
                <option value="quantity">📦 Bulk/Quantity Discount</option>
              </select>
            </div>
            <div>
              <label className="block text-[14px] font-bold text-gray-700 mb-2">Deal Price (₹)</label>
              <input
                type="number"
                min="1"
                className="w-full h-12 px-4 border border-gray-200 rounded-xl text-[14px] font-bold text-gray-900 focus:border-[#1A6FD4] focus:ring-2 focus:ring-[#1A6FD4]/10 outline-none transition-all"
                value={formData.deal_price}
                onChange={e => setFormData({ ...formData, deal_price: e.target.value })}
                placeholder={selectedProduct ? `Max: ₹${selectedProduct.sale_price ?? selectedProduct.base_price}` : "e.g. 499"}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[14px] font-bold text-gray-700 mb-2 text-left">Starts At</label>
              <input
                type="datetime-local"
                className="w-full h-12 px-4 border border-gray-200 rounded-xl text-[14px] font-bold text-gray-900 focus:border-[#1A6FD4] focus:ring-2 focus:ring-[#1A6FD4]/10 outline-none transition-all"
                value={formData.start_datetime}
                onChange={e => setFormData({ ...formData, start_datetime: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-gray-700 mb-2 text-left">Ends At</label>
              <input
                type="datetime-local"
                className="w-full h-12 px-4 border border-gray-200 rounded-xl text-[14px] font-bold text-gray-900 focus:border-[#1A6FD4] focus:ring-2 focus:ring-[#1A6FD4]/10 outline-none transition-all"
                value={formData.end_datetime}
                onChange={e => setFormData({ ...formData, end_datetime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="pt-6 flex gap-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl border border-gray-200 font-bold text-[14px] text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.product_id}
              className="flex-1 h-12 rounded-2xl bg-[#1A6FD4] font-bold text-[14px] text-white shadow-md hover:shadow-lg hover:bg-[#155ab0] transition-all disabled:opacity-50 disabled:active:scale-100 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
