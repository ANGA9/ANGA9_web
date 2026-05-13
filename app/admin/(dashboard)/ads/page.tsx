"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, Filter, Megaphone, CheckCircle2, XCircle, X } from "lucide-react";
import { adsApi, AdCampaign, AdStatus } from "@/lib/adsApi";
import toast from "react-hot-toast";

export default function AdminAdsPage() {
  const [ads, setAds] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<AdStatus | "all">("all");

  const [selectedAd, setSelectedAd] = useState<AdCampaign | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  
  // Action state
  const [fee, setFee] = useState<number | ''>('');
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const res = await adsApi.adminList({
        status: statusFilter === "all" ? undefined : statusFilter,
        limit: 100
      });
      setAds(res.data);
    } catch (err) {
      toast.error("Failed to load ad campaigns");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAd || !actionType) return;

    try {
      setSubmitting(true);
      if (actionType === 'approve') {
        if (typeof fee !== 'number' || fee < 0) return toast.error("Invalid fee amount");
        await adsApi.adminApprove(selectedAd.id, fee);
        toast.success("Campaign approved successfully");
      } else {
        if (reason.trim().length < 5) return toast.error("Reason must be at least 5 characters");
        await adsApi.adminReject(selectedAd.id, reason.trim());
        toast.success("Campaign rejected");
      }
      
      setSelectedAd(null);
      setActionType(null);
      setFee('');
      setReason('');
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to process campaign");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex">Pending Review</span>;
      case "approved": return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex">Approved</span>;
      case "active": return <span className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex animate-pulse">Active</span>;
      case "completed": return <span className="bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex">Completed</span>;
      case "rejected": return <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex">Rejected</span>;
      default: return <span className="bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex">{status}</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Ad Campaigns</h1>
          <p className="text-[15px] text-gray-500 font-medium">Review and moderate seller advertising requests</p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-2xl shadow-sm self-start lg:self-auto overflow-x-auto no-scrollbar">
          {[
            { value: "all", label: "All Campaigns" },
            { value: "pending", label: "Pending Review" },
            { value: "approved", label: "Approved" },
            { value: "active", label: "Active" },
            { value: "completed", label: "Completed" },
            { value: "rejected", label: "Rejected" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value as any)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-[14px] font-bold transition-all ${
                statusFilter === f.value
                  ? "bg-[#8B5CF6] text-white shadow-md shadow-purple-500/20"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-[#8B5CF6]" />
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Megaphone className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-[20px] font-bold text-gray-900 mb-2">No Campaigns Found</h2>
          <p className="text-[15px] text-gray-500 font-medium">There are no ad campaigns matching your filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[35%]">Campaign & Seller</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Placement & Dates</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Budget / Fee</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ads.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200 shadow-sm flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={ad.banner_url} alt="Ad Banner" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList.add('bg-gray-200'); }} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[14px] text-gray-900 line-clamp-1">{ad.headline}</p>
                          <p className="text-[12px] text-gray-500 font-mono mt-0.5 truncate">Seller: {ad.seller_id.split('-')[0]}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[14px] text-gray-900 capitalize mb-0.5">{ad.placement.replace('_', ' ')}</div>
                      <div className="text-[13px] font-medium text-gray-500">
                        {new Date(ad.starts_at).toLocaleDateString()} - {new Date(ad.ends_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[15px] text-gray-900">₹{ad.budget_inr.toLocaleString()}</div>
                      {ad.approved_fee_inr && (
                        <div className="text-[12px] font-bold text-[#8B5CF6] mt-0.5 flex items-center gap-1">
                           Fee: ₹{ad.approved_fee_inr.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(ad.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {ad.status === 'pending' ? (
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setSelectedAd(ad); setActionType('approve'); setFee(ad.budget_inr); }}
                            className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 text-[12px] font-bold hover:bg-green-100 transition-colors shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => { setSelectedAd(ad); setActionType('reject'); setReason(''); }}
                            className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-[12px] font-bold hover:bg-red-100 transition-colors shadow-sm"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setSelectedAd(ad); setActionType(null); }}
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-[12px] font-bold hover:bg-gray-50 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                        >
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {selectedAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-[20px] font-bold text-gray-900">
                {actionType === 'approve' ? 'Approve Campaign' : actionType === 'reject' ? 'Reject Campaign' : 'Campaign Details'}
              </h2>
              <button 
                onClick={() => { setSelectedAd(null); setActionType(null); }} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {/* Ad Preview */}
              <div className="mb-6 rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="h-40 bg-gray-100 w-full relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedAd.banner_url} alt="Banner" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent flex flex-col justify-end p-4">
                     <h3 className="text-white font-bold text-[18px] leading-tight">{selectedAd.headline}</h3>
                  </div>
                </div>
                <div className="p-4 bg-white text-[13px] border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400 block text-[11px] uppercase tracking-wider font-bold mb-1">Placement</span>
                      <span className="font-bold text-gray-900 capitalize">{selectedAd.placement.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px] uppercase tracking-wider font-bold mb-1">Proposed Budget</span>
                      <span className="font-bold text-gray-900">₹{selectedAd.budget_inr.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {actionType ? (
                <form onSubmit={handleAction} className="space-y-5">
                  {actionType === 'approve' ? (
                    <div>
                      <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Final Approved Fee (₹)</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={fee}
                        onChange={(e) => setFee(Number(e.target.value))}
                        className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-[14px] font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-inner"
                      />
                      <p className="text-[13px] font-medium text-gray-500 mt-2">This fee will be charged to the seller.</p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Rejection Reason</label>
                      <textarea
                        required
                        minLength={5}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Explain why this ad is being rejected..."
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-[14px] font-medium text-gray-900 placeholder:text-gray-400 h-32 focus:outline-none focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none shadow-inner"
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => { setSelectedAd(null); setActionType(null); }}
                      className="flex-1 h-12 rounded-xl border border-gray-200 bg-white text-[14px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`flex-1 h-12 rounded-xl text-[14px] font-bold text-white transition-all flex justify-center items-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 ${
                        actionType === 'approve' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                      }`}
                    >
                      {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                      {actionType === 'approve' ? 'Approve Ad' : 'Reject Ad'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="pt-2">
                   <button 
                     onClick={() => setSelectedAd(null)} 
                     className="w-full h-12 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                   >
                     Close Details
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
