"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, Filter, AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";
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
        return <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase">Open</span>;
      case "seller_responded":
        return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase">Seller Responded</span>;
      case "admin_review":
        return <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase">Escalated</span>;
      case "resolved_refund":
      case "resolved_replace":
      case "resolved_rejected":
      case "closed":
        return <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase">Resolved</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1A1A2E] tracking-tight">Disputes Queue</h1>
          <p className="text-sm text-[#4B5563] mt-1">Review and resolve customer-seller disputes.</p>
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
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="seller_responded">Seller Responded</option>
              <option value="admin_review">Needs Admin Review (Escalated)</option>
              <option value="resolved_refund">Resolved</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#8B5CF6]" />
            </div>
          ) : disputes.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-gray-400" />
              </div>
              <p className="font-medium text-gray-900">No disputes found in this view</p>
              <p className="text-sm mt-1">Try changing the filter.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FBFF] text-[#4B5563] text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EEF4]">
                {disputes.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{d.order_id.split('-')[0]}...</td>
                    <td className="px-6 py-4 font-medium text-gray-900 capitalize">{d.type.replace('_', ' ')}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(d.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedDispute(d);
                          setResolutionNote("");
                        }}
                        className="text-[#8B5CF6] font-bold hover:underline text-sm"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Admin Resolution Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#8B5CF6]" />
                Admin Dispute Review
              </h2>
              <button onClick={() => setSelectedDispute(null)} className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Close</span>
                &times;
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Customer Complaint</h3>
                  <p className="text-sm text-gray-800 bg-red-50 p-4 rounded-xl border border-red-100 h-full">
                    "{selectedDispute.reason}"
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Seller Response</h3>
                  <p className="text-sm text-gray-800 bg-blue-50 p-4 rounded-xl border border-blue-100 h-full">
                    {selectedDispute.seller_response ? `"${selectedDispute.seller_response}"` : <span className="text-gray-400 italic">No response provided yet.</span>}
                  </p>
                </div>
              </div>

              {selectedDispute.admin_resolution && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Previous Resolution</h3>
                  <p className="text-sm text-gray-800 bg-green-50 p-4 rounded-xl border border-green-100">
                    "{selectedDispute.admin_resolution}"
                  </p>
                </div>
              )}

              {!selectedDispute.status.startsWith('resolved') && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Admin Resolution Actions</h3>
                  <textarea
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="Internal note or reason for resolution (optional)..."
                    className="w-full rounded-xl border-gray-200 border p-3 text-sm h-24 focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent outline-none resize-none mb-4"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => handleResolve('resolved_refund')}
                      disabled={submitting}
                      className="py-3 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-colors disabled:opacity-70 flex items-center justify-center"
                    >
                      Issue Refund
                    </button>
                    <button
                      onClick={() => handleResolve('resolved_replace')}
                      disabled={submitting}
                      className="py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center"
                    >
                      Approve Replacement
                    </button>
                    <button
                      onClick={() => handleResolve('resolved_rejected')}
                      disabled={submitting}
                      className="py-3 rounded-xl border-2 border-red-200 text-red-700 font-bold text-sm hover:bg-red-50 transition-colors disabled:opacity-70 flex items-center justify-center"
                    >
                      Reject Request
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
