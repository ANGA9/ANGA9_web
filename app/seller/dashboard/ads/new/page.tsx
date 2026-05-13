"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Megaphone, Image as ImageIcon, IndianRupee, Calendar, Type } from "lucide-react";
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
      toast.success("Ad campaign requested successfully!", {
        style: { borderRadius: '16px', background: '#333', color: '#fff' }
      });
      router.push("/seller/dashboard/ads");
    } catch (err: any) {
      toast.error(err.message || "Failed to create campaign", {
        style: { borderRadius: '16px' }
      });
    } finally {
      setLoading(false);
    }
  };

  const labelCls = "block text-[14px] font-bold text-gray-700 mb-2";
  const inputCls = "w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-[15px] font-medium text-gray-900 outline-none focus:bg-white focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all shadow-sm placeholder:text-gray-400";

  return (
    <main className="w-full mx-auto max-w-5xl px-3 sm:px-4 py-6 md:px-8 md:py-10 text-[#1A1A2E]">
      
      <Link href="/seller/dashboard/ads" className="inline-flex items-center gap-1.5 text-[14px] font-bold text-gray-500 hover:text-[#1A6FD4] transition-colors mb-6 group">
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Campaigns
      </Link>

      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Create Ad Campaign</h1>
        <p className="text-[15px] text-gray-500 font-medium">Submit a request to advertise your product and boost sales.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        
        {/* Left Form Area */}
        <div className="flex-1 space-y-6">
          <form id="ad-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* ── Placement & Product ── */}
            <section className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-6">
              <h2 className="text-[18px] font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#1A6FD4]" /> Basics
              </h2>
              
              <div>
                <label className={labelCls}>Select Product</label>
                {loadingProducts ? (
                  <div className="h-12 w-full bg-gray-100 animate-pulse rounded-2xl" />
                ) : (
                  <div className="relative">
                    <select
                      required
                      value={form.product_id}
                      onChange={e => setForm({ ...form, product_id: e.target.value })}
                      className={`${inputCls} appearance-none pr-10`}
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className={labelCls}>Placement Area</label>
                <div className="relative">
                  <select
                    required
                    value={form.placement}
                    onChange={e => setForm({ ...form, placement: e.target.value })}
                    className={`${inputCls} appearance-none pr-10`}
                  >
                    <option value="home_hero">Homepage Hero Banner</option>
                    <option value="category_top">Category Top Banner</option>
                    <option value="search_sidebar">Search Sidebar</option>
                  </select>
                </div>
              </div>
            </section>

            {/* ── Banner & Copy ── */}
            <section className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-6">
              <h2 className="text-[18px] font-bold text-gray-900 mb-2 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#1A6FD4]" /> Creative
              </h2>
              
              <div>
                <label className={labelCls}>Banner Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/banner.jpg"
                  value={form.banner_url}
                  onChange={e => setForm({ ...form, banner_url: e.target.value })}
                  className={inputCls}
                />
                {form.banner_url && (
                  <div className="mt-4 w-full aspect-[21/9] bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.banner_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-bold text-sm">Banner Preview</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Headline Text</label>
                  <input
                    type="text"
                    required
                    minLength={5}
                    maxLength={100}
                    placeholder="Huge Summer Sale!"
                    value={form.headline}
                    onChange={e => setForm({ ...form, headline: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Call to Action (CTA)</label>
                  <input
                    type="text"
                    required
                    maxLength={30}
                    placeholder="Shop Now"
                    value={form.cta_text}
                    onChange={e => setForm({ ...form, cta_text: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>
            </section>

            {/* ── Dates & Budget ── */}
            <section className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-6">
              <h2 className="text-[18px] font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#1A6FD4]" /> Schedule & Budget
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Start Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.starts_at}
                    onChange={e => setForm({ ...form, starts_at: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>End Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.ends_at}
                    onChange={e => setForm({ ...form, ends_at: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Proposed Budget (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  <input
                    type="number"
                    required
                    min={500}
                    step={100}
                    value={form.budget_inr}
                    onChange={e => setForm({ ...form, budget_inr: Number(e.target.value) })}
                    className={`${inputCls} pl-10`}
                  />
                </div>
                <p className="text-[13px] text-gray-500 font-medium mt-2">
                  Minimum budget is ₹500. An admin will review and confirm the final fee before billing.
                </p>
              </div>
            </section>

          </form>
        </div>

        {/* ── Right Action Sidebar ── */}
        <div className="hidden lg:block w-[320px] shrink-0">
          <div className="sticky top-[104px] flex flex-col gap-5">
            <div className="bg-[#F8FBFF] rounded-3xl border border-blue-100 p-6 shadow-sm">
              <h3 className="text-[16px] font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Type className="w-5 h-5 text-[#1A6FD4]" /> Next Steps
              </h3>
              <p className="text-[13px] text-gray-500 font-medium mb-6 leading-relaxed">
                After submission, your campaign will be reviewed by an administrator. You will be notified once it is approved and goes live.
              </p>
              <button
                type="submit"
                form="ad-form"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1A6FD4] px-6 py-4 text-[15px] font-bold text-white transition-all shadow-md hover:shadow-lg hover:bg-[#155bb5] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit for Review"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Action ── */}
        <div className="lg:hidden pb-10">
          <button
            type="submit"
            form="ad-form"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1A6FD4] px-6 py-4 text-[16px] font-bold text-white transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit for Review"}
          </button>
        </div>

      </div>
    </main>
  );
}
