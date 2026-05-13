"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Loader2, Megaphone, TrendingUp, MousePointerClick, Calendar, CheckCircle2 } from "lucide-react";
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
      case "pending": return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase">Pending Review</span>;
      case "approved": return <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase">Approved (Waiting to Start)</span>;
      case "active": return <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase animate-pulse">Active</span>;
      case "completed": return <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase">Completed</span>;
      case "rejected": return <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase">Rejected</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1A1A2E] tracking-tight">Ad Campaigns</h1>
          <p className="text-sm text-[#4B5563] mt-1">Promote your products and increase sales.</p>
        </div>
        <Link
          href="/seller/dashboard/ads/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A6FD4] text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8EEF4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4]" />
            </div>
          ) : ads.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Megaphone className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No active campaigns</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                Create your first ad campaign to showcase your products on the homepage, category tops, or search sidebar.
              </p>
              <Link
                href="/seller/dashboard/ads/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-black transition-colors"
              >
                <Plus className="w-4 h-4" />
                Start Advertising
              </Link>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FBFF] text-[#4B5563] text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Campaign Details</th>
                  <th className="px-6 py-4">Placement & Dates</th>
                  <th className="px-6 py-4 text-center">Performance</th>
                  <th className="px-6 py-4 text-right">Budget & Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EEF4]">
                {ads.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                          <img src={ad.banner_url} alt="Ad Banner" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 mb-1 line-clamp-1">{ad.headline}</p>
                          <p className="text-xs text-gray-500">Product: {ad.products?.name || ad.product_id.split('-')[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Megaphone className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium text-gray-900 capitalize">{ad.placement.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(ad.starts_at).toLocaleDateString()} - {new Date(ad.ends_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="flex items-center gap-1.5 text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded-md">
                          <TrendingUp className="w-3.5 h-3.5" />
                          {ad.impressions.toLocaleString()} views
                        </div>
                        <div className="flex items-center gap-1.5 text-green-600 font-bold bg-green-50 px-2.5 py-1 rounded-md">
                          <MousePointerClick className="w-3.5 h-3.5" />
                          {ad.clicks.toLocaleString()} clicks
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-bold text-gray-900 mb-2">₹{ad.budget_inr.toLocaleString()}</div>
                      {getStatusBadge(ad.status)}
                      {ad.status === 'rejected' && ad.reject_reason && (
                         <div className="text-xs text-red-600 mt-2 max-w-[200px] truncate ml-auto" title={ad.reject_reason}>
                           Note: {ad.reject_reason}
                         </div>
                      )}
                      {ad.status === 'approved' && ad.approved_fee_inr && (
                         <div className="text-xs text-green-600 mt-2">
                           Approved Fee: ₹{ad.approved_fee_inr}
                         </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
