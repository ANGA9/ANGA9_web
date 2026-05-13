"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, Filter, Megaphone, CheckCircle2, XCircle, TrendingUp, Calendar } from "lucide-react";
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
      case "pending": return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase">Pending Review</span>;
      case "approved": return <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase">Approved (Scheduled)</span>;
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
          <h1 className="text-2xl font-black text-[#1A1A2E] tracking-tight">Ad Campaigns Moderation</h1>
          <p className="text-sm text-[#4B5563] mt-1">Review and approve seller ad requests.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8EEF4] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E8EEF4] flex flex-wrap gap-4 items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] flex-1 md:flex-none"
            >
              <option value="all">All Campaigns</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved (Scheduled)</option>
              <option value="active">Active Now</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#8B5CF6]" />
            </div>
          ) : ads.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-gray-400" />
              </div>
              <p className="font-medium text-gray-900">No campaigns found</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FBFF] text-[#4B5563] text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Campaign & Seller</th>
                  <th className="px-6 py-4">Placement & Dates</th>
                  <th className="px-6 py-4">Budget / Fee</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EEF4]">
                {ads.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                          <img src={ad.banner_url} alt="Ad Banner" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{ad.headline}</p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">Seller: {ad.seller_id.split('-')[0]}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 capitalize mb-1">{ad.placement.replace('_', ' ')}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(ad.starts_at).toLocaleDateString()} - {new Date(ad.ends_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">Prop: ₹{ad.budget_inr.toLocaleString()}</div>
                      {ad.approved_fee_inr && (
                        <div className="text-xs text-green-600 font-bold mt-0.5">Fee: ₹{ad.approved_fee_inr.toLocaleString()}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(ad.status)}</td>
                    <td className="px-6 py-4 text-right">
                      {ad.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => { setSelectedAd(ad); setActionType('approve'); setFee(ad.budget_inr); }}
                            className="px-3 py-1.5 bg-green-100 text-green-700 font-bold rounded-lg hover:bg-green-200 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => { setSelectedAd(ad); setActionType('reject'); setReason(''); }}
                            className="px-3 py-1.5 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setSelectedAd(ad); setActionType(null); }}
                          className="text-[#8B5CF6] font-bold hover:underline"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {selectedAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h2 className="text-lg font-black text-gray-900">
                {actionType === 'approve' ? 'Approve Campaign' : actionType === 'reject' ? 'Reject Campaign' : 'Campaign Details'}
              </h2>
              <button onClick={() => { setSelectedAd(null); setActionType(null); }} className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Close</span>
                &times;
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {/* Ad Preview */}
              <div className="mb-6 rounded-xl border border-gray-200 overflow-hidden">
                <div className="h-32 bg-gray-100 w-full relative">
                  <img src={selectedAd.banner_url} alt="Banner" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                     <h3 className="text-white font-bold text-lg leading-tight">{selectedAd.headline}</h3>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500 block text-xs uppercase tracking-wider font-bold mb-1">Placement</span>
                      <span className="font-medium text-gray-900 capitalize">{selectedAd.placement.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs uppercase tracking-wider font-bold mb-1">Proposed Budget</span>
                      <span className="font-medium text-gray-900">₹{selectedAd.budget_inr.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {actionType ? (
                <form onSubmit={handleAction} className="space-y-4">
                  {actionType === 'approve' ? (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Final Approved Fee (₹)</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={fee}
                        onChange={(e) => setFee(Number(e.target.value))}
                        className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-1.5">This fee will be charged to the seller.</p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Rejection Reason</label>
                      <textarea
                        required
                        minLength={5}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Explain why this ad is being rejected..."
                        className="w-full rounded-xl border border-gray-200 p-3 text-sm h-24 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => { setSelectedAd(null); setActionType(null); }}
                      className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`flex-1 py-3 rounded-xl font-bold text-white transition-colors flex justify-center items-center gap-2 text-sm disabled:opacity-70 ${
                        actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      {actionType === 'approve' ? 'Approve Ad' : 'Reject Ad'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center pt-2">
                   <button onClick={() => setSelectedAd(null)} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                     Close
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
