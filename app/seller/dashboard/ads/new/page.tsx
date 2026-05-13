"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Upload, Megaphone } from "lucide-react";
import Link from "next/link";
import { adsApi } from "@/lib/adsApi";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface ProductOption {
  id: string;
  name: string;
}

export default function NewAdCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [form, setForm] = useState({
    product_id: "",
    placement: "home_hero",
    starts_at: "",
    ends_at: "",
    banner_url: "",
    headline: "",
    cta_text: "Shop Now",
    budget_inr: 500,
  });

  useEffect(() => {
    async function loadProducts() {
      try {
        // Fetch seller products
        const res = await api.get<{ data: ProductOption[] }>('/api/products?limit=100');
        setProducts(res.data);
        if (res.data.length > 0) {
          setForm(f => ({ ...f, product_id: res.data[0].id }));
        }
      } catch (err) {
        toast.error("Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    }
    loadProducts();

    // Set default dates (tomorrow to next week)
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    const nextWk = new Date(tmrw);
    nextWk.setDate(nextWk.getDate() + 7);

    setForm(f => ({
      ...f,
      starts_at: tmrw.toISOString().slice(0, 16),
      ends_at: nextWk.toISOString().slice(0, 16)
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_id) return toast.error("Please select a product");
    
    // Quick validation
    if (new Date(form.starts_at) >= new Date(form.ends_at)) {
      return toast.error("End date must be after start date");
    }

    try {
      setLoading(true);
      await adsApi.requestAd({
        ...form,
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at: new Date(form.ends_at).toISOString(),
      });
      toast.success("Ad campaign requested successfully!");
      router.push("/seller/dashboard/ads");
    } catch (err: any) {
      toast.error(err.message || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/seller/dashboard/ads" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Campaigns
      </Link>

      <div className="flex items-center gap-3 pb-4 border-b border-[#E8EEF4]">
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
          <Megaphone className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-[#1A1A2E] tracking-tight">Create Ad Campaign</h1>
          <p className="text-sm text-[#4B5563]">Submit a request to advertise your product.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8EEF4] shadow-sm p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Select Product</label>
              {loadingProducts ? (
                <div className="h-12 bg-gray-100 animate-pulse rounded-xl" />
              ) : (
                <select
                  required
                  value={form.product_id}
                  onChange={e => setForm({ ...form, product_id: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-[#1A6FD4] focus:border-transparent outline-none bg-white"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Placement Area</label>
              <select
                required
                value={form.placement}
                onChange={e => setForm({ ...form, placement: e.target.value })}
                className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-[#1A6FD4] focus:border-transparent outline-none bg-white"
              >
                <option value="home_hero">Homepage Hero Banner</option>
                <option value="category_top">Category Top Banner</option>
                <option value="search_sidebar">Search Sidebar</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Start Date & Time</label>
              <input
                type="datetime-local"
                required
                value={form.starts_at}
                onChange={e => setForm({ ...form, starts_at: e.target.value })}
                className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-[#1A6FD4] focus:border-transparent outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">End Date & Time</label>
              <input
                type="datetime-local"
                required
                value={form.ends_at}
                onChange={e => setForm({ ...form, ends_at: e.target.value })}
                className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-[#1A6FD4] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Banner Image URL</label>
            <input
              type="url"
              required
              placeholder="https://example.com/image.jpg"
              value={form.banner_url}
              onChange={e => setForm({ ...form, banner_url: e.target.value })}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-[#1A6FD4] focus:border-transparent outline-none"
            />
            {form.banner_url && (
              <div className="mt-4 w-full h-40 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden relative group">
                <img src={form.banner_url} alt="Banner Preview" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white font-bold text-sm">Banner Preview</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-gray-700">Headline Text</label>
              <input
                type="text"
                required
                minLength={5}
                maxLength={100}
                placeholder="E.g. Huge Summer Sale on Electronics!"
                value={form.headline}
                onChange={e => setForm({ ...form, headline: e.target.value })}
                className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-[#1A6FD4] focus:border-transparent outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Call to Action (CTA) Button</label>
              <input
                type="text"
                required
                maxLength={30}
                placeholder="Shop Now"
                value={form.cta_text}
                onChange={e => setForm({ ...form, cta_text: e.target.value })}
                className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-[#1A6FD4] focus:border-transparent outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Proposed Budget (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                <input
                  type="number"
                  required
                  min={500}
                  step={100}
                  value={form.budget_inr}
                  onChange={e => setForm({ ...form, budget_inr: Number(e.target.value) })}
                  className="w-full rounded-xl border border-gray-200 p-3 pl-8 text-sm focus:ring-2 focus:ring-[#1A6FD4] focus:border-transparent outline-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum budget is ₹500. Admin will review and confirm final fee.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#1A6FD4] text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center min-w-[200px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit for Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
