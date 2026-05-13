"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, Filter, AlertTriangle, ShieldAlert, CheckCircle2, X } from "lucide-react";
import { disputesApi, Dispute, DisputeStatus } from "@/lib/disputesApi";
import toast from "react-hot-toast";

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | "all">("all");

  const [resolutionNote, setResolutionNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const res = await disputesApi.adminList({
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setDisputes(res.data);
    } catch (err) {
      toast.error("Failed to load disputes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleResolve = async (status: 'resolved_refund' | 'resolved_replace' | 'resolved_rejected') => {
    if (!selectedDispute) return;
    try {
      setSubmitting(true);
      await disputesApi.adminResolve(selectedDispute.id, {
        status,
        admin_resolution: resolutionNote.trim() || undefined,
      });
      toast.success("Dispute resolved successfully");
      setSelectedDispute(null);
      setResolutionNote("");
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve dispute");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex">Open</span>;
      case "seller_responded":
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex">Seller Responded</span>;
      case "admin_review":
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex">Escalated</span>;
      case "resolved_refund":
      case "resolved_replace":
      case "resolved_rejected":
      case "closed":
        return <span className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex">Resolved</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex">{status}</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Disputes Queue</h1>
          <p className="text-[15px] text-gray-500 font-medium">Review and resolve marketplace disputes</p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-2xl shadow-sm self-start lg:self-auto overflow-x-auto no-scrollbar">
          {[
            { value: "all", label: "All Statuses" },
            { value: "open", label: "Open" },
            { value: "seller_responded", label: "Seller Responded" },
            { value: "admin_review", label: "Admin Review" },
            { value: "resolved_refund", label: "Resolved" },
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
      ) : disputes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-[20px] font-bold text-gray-900 mb-2">Queue is Clear</h2>
          <p className="text-[15px] text-gray-500 font-medium">No disputes found matching your filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Dispute Type</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Filed Date</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {disputes.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                       <span className="text-[13px] font-black text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded-lg">#{d.order_id.split('-')[0].toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[14px] font-bold text-gray-900 capitalize">{d.type.replace('_', ' ')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">
                        {new Date(d.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(d.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedDispute(d);
                          setResolutionNote("");
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B5CF6] text-white text-[12px] font-bold hover:bg-[#7C3AED] transition-all shadow-sm opacity-0 group-hover:opacity-100"
                      >
                        Review Dispute
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Resolution Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-[#8B5CF6]" />
                 </div>
                 <div>
                    <h2 className="text-[20px] font-bold text-gray-900 leading-tight">Admin Dispute Review</h2>
                    <p className="text-[13px] font-medium text-gray-500 font-mono uppercase tracking-tight">Case ID: {selectedDispute.id}</p>
                 </div>
              </div>
              <button 
                onClick={() => setSelectedDispute(null)} 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-3">
                  <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    Customer Complaint
                  </h3>
                  <div className="text-[14px] font-medium text-gray-700 bg-red-50/50 p-6 rounded-[24px] border border-red-100 italic leading-relaxed">
                    "{selectedDispute.reason}"
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    Seller Response
                  </h3>
                  <div className="text-[14px] font-medium text-gray-700 bg-blue-50/50 p-6 rounded-[24px] border border-blue-100 italic leading-relaxed">
                    {selectedDispute.seller_response ? `"${selectedDispute.seller_response}"` : <span className="text-gray-400 font-bold">Waiting for seller response...</span>}
                  </div>
                </div>
              </div>

              {selectedDispute.admin_resolution && (
                <div className="mb-8 bg-green-50/50 p-6 rounded-[24px] border border-green-100">
                  <h3 className="text-[12px] font-bold text-green-700 uppercase tracking-widest mb-3">Previous Resolution</h3>
                  <p className="text-[14px] font-bold text-green-900 italic">
                    "{selectedDispute.admin_resolution}"
                  </p>
                </div>
              )}

              {!selectedDispute.status.startsWith('resolved') && (
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h3 className="text-[14px] font-black text-gray-900 uppercase tracking-wider mb-4">Resolution Dashboard</h3>
                  
                  <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Final Resolution Notes</label>
                  <textarea
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="Provide a detailed reason for your decision. This will be shared with both parties."
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-5 text-[14px] font-medium text-gray-900 placeholder:text-gray-400 h-32 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all resize-none mb-6 shadow-inner"
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                      onClick={() => handleResolve('resolved_refund')}
                      disabled={submitting}
                      className="h-14 rounded-2xl bg-green-500 text-white font-black text-[14px] hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 disabled:opacity-70 flex items-center justify-center uppercase tracking-wider"
                    >
                      Issue Refund
                    </button>
                    <button
                      onClick={() => handleResolve('resolved_replace')}
                      disabled={submitting}
                      className="h-14 rounded-2xl bg-blue-600 text-white font-black text-[14px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70 flex items-center justify-center uppercase tracking-wider"
                    >
                      Approve Replace
                    </button>
                    <button
                      onClick={() => handleResolve('resolved_rejected')}
                      disabled={submitting}
                      className="h-14 rounded-2xl bg-white border-2 border-red-200 text-red-600 font-black text-[14px] hover:bg-red-50 transition-all disabled:opacity-70 flex items-center justify-center uppercase tracking-wider"
                    >
                      Reject Dispute
                    </button>
                  </div>
                  {submitting && (
                    <div className="flex items-center justify-center mt-4 gap-2 text-[#8B5CF6] font-bold text-[14px]">
                       <Loader2 className="w-5 h-5 animate-spin" /> Processing Resolution...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
