"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Loader2, Megaphone, TrendingUp, MousePointerClick, Calendar, ArrowRight } from "lucide-react";
import { adsApi, AdCampaign } from "@/lib/adsApi";
import toast from "react-hot-toast";

export default function SellerAdsPage() {
  const [ads, setAds] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await adsApi.listMine();
        setAds(res.ads);
      } catch (err) {
        toast.error("Failed to load ad campaigns");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wide bg-amber-50 text-amber-700 border-amber-200">Pending Review</span>;
      case "approved": return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wide bg-blue-50 text-blue-700 border-blue-200">Approved</span>;
      case "active": return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wide bg-green-50 text-green-700 border-green-200 animate-pulse">Active</span>;
      case "completed": return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wide bg-gray-100 text-gray-700 border-gray-200">Completed</span>;
      case "rejected": return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wide bg-red-50 text-red-700 border-red-200">Rejected</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wide bg-gray-100 text-gray-700 border-gray-200">{status}</span>;
    }
  };

  return (
    <main className="w-full mx-auto max-w-7xl px-3 sm:px-4 py-6 md:px-8 md:py-10 text-[#1A1A2E]">
      
      {/* ── Desktop Header ── */}
      <div className="hidden md:flex items-center justify-between mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Ad Campaigns</h1>
          <p className="text-[15px] text-gray-500 font-medium">Promote your products and increase sales visibility.</p>
        </div>
        <Link
          href="/seller/dashboard/ads/new"
          className="flex items-center gap-2 h-12 px-6 bg-[#1A6FD4] text-white text-[15px] font-bold rounded-2xl hover:bg-[#155bb5] transition-all shadow-md active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" /> Create Campaign
        </Link>
      </div>

      {/* ── Mobile Header ── */}
      <div className="md:hidden flex flex-col gap-4 mb-8">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-gray-900">Ad Campaigns</h1>
          <p className="text-[14px] text-gray-500 font-medium mt-1">Promote your products.</p>
        </div>
        <Link
          href="/seller/dashboard/ads/new"
          className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-[#1A6FD4] text-white text-[15px] font-bold rounded-2xl shadow-md"
        >
          <Plus className="w-5 h-5" /> Create Campaign
        </Link>
      </div>

      {/* ── Metric Cards (Optional/Future) ── */}
      {!loading && ads.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-3xl border border-blue-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 opacity-50 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100 mb-4">
                <Megaphone className="w-6 h-6" />
              </div>
              <p className="text-[32px] font-bold text-gray-900 tracking-tight leading-none mb-1">{ads.filter(a => a.status === 'active').length}</p>
              <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wide">Active Campaigns</p>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-green-50 text-green-600 border border-green-100 mb-4">
                <MousePointerClick className="w-6 h-6" />
              </div>
              <p className="text-[32px] font-bold text-gray-900 tracking-tight leading-none mb-1">
                {ads.reduce((acc, curr) => acc + curr.clicks, 0).toLocaleString()}
              </p>
              <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wide">Total Clicks</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50 text-indigo-600 border border-indigo-100 mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-[32px] font-bold text-gray-900 tracking-tight leading-none mb-1">
                {ads.reduce((acc, curr) => acc + curr.impressions, 0).toLocaleString()}
              </p>
              <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wide">Total Impressions</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Campaigns Table ── */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-[18px] font-bold text-gray-900 flex items-center gap-2">
            Your Campaigns
          </h2>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4]" />
          </div>
        ) : ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6">
              <Megaphone className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-[20px] font-bold text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-[15px] font-medium text-gray-500 max-w-md mb-8 leading-relaxed">
              Create your first ad campaign to showcase your products on the homepage, category tops, or search sidebar.
            </p>
            <Link
              href="/seller/dashboard/ads/new"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white font-bold text-[15px] rounded-2xl hover:bg-black transition-all shadow-md active:scale-[0.98]"
            >
              <Plus className="w-5 h-5" /> Start Advertising
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[35%]">Campaign Details</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[25%]">Placement & Dates</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[20%] text-center">Performance</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right w-[20%]">Budget & Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ads.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200 shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={ad.banner_url} alt="Ad Banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-[15px] text-gray-900 truncate mb-1" title={ad.headline}>
                            {ad.headline}
                          </span>
                          <span className="text-[13px] font-medium text-gray-500 truncate">
                            Product: <span className="text-gray-900 font-bold">{ad.products?.name || ad.product_id.split('-')[0]}</span>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Megaphone className="w-4 h-4 text-blue-500" />
                          <span className="font-bold text-[13px] text-gray-900 capitalize bg-gray-100 px-2 py-0.5 rounded-md">
                            {ad.placement.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[13px] font-medium text-gray-500">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(ad.starts_at).toLocaleDateString()} - {new Date(ad.ends_at).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-full max-w-[120px] flex items-center justify-between text-indigo-600 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-[13px]">{ad.impressions.toLocaleString()} <span className="text-indigo-400 text-[11px] uppercase">vws</span></span>
                        </div>
                        <div className="w-full max-w-[120px] flex items-center justify-between text-green-600 font-bold bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                          <MousePointerClick className="w-4 h-4" />
                          <span className="text-[13px]">{ad.clicks.toLocaleString()} <span className="text-green-400 text-[11px] uppercase">clks</span></span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex flex-col items-end gap-2">
                        <div className="font-bold text-[16px] text-gray-900">
                          ₹{ad.budget_inr.toLocaleString()}
                        </div>
                        {getStatusBadge(ad.status)}
                        {ad.status === 'rejected' && ad.reject_reason && (
                           <div className="text-[11px] font-medium text-red-600 mt-1 max-w-[150px] truncate" title={ad.reject_reason}>
                             {ad.reject_reason}
                           </div>
                        )}
                        {ad.status === 'approved' && ad.approved_fee_inr && (
                           <div className="text-[11px] font-bold text-blue-600 mt-1 bg-blue-50 px-2 py-0.5 rounded-md">
                             Fee: ₹{ad.approved_fee_inr}
                           </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
