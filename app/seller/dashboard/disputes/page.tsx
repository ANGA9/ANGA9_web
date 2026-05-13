"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, Filter, AlertTriangle, MessageSquare, CheckCircle2 } from "lucide-react";
import { disputesApi, Dispute, DisputeStatus } from "@/lib/disputesApi";
import toast from "react-hot-toast";

export default function SellerDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | "all">("all");

  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const res = await disputesApi.sellerList({
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

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute) return;
    if (response.trim().length < 5) {
      toast.error("Response must be at least 5 characters");
      return;
    }

    try {
      setSubmitting(true);
      await disputesApi.sellerRespond(selectedDispute.order_id, selectedDispute.id, {
        seller_response: response.trim(),
      });
      toast.success("Response sent successfully");
      setSelectedDispute(null);
      setResponse("");
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit response");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase">Open</span>;
      case "seller_responded":
      case "admin_review":
        return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase">In Review</span>;
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
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1A1A2E] tracking-tight">Disputes & Returns</h1>
          <p className="text-sm text-[#4B5563] mt-1">Manage customer issues and return requests.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8EEF4] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E8EEF4] flex flex-wrap gap-4 items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]"
            >
              <option value="all">All Statuses</option>
              <option value="open">Action Required (Open)</option>
              <option value="seller_responded">Responded</option>
              <option value="resolved_refund">Resolved (Refunded)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4]" />
            </div>
          ) : disputes.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-gray-400" />
              </div>
              <p className="font-medium text-gray-900">No disputes found</p>
              <p className="text-sm mt-1">You're all caught up!</p>
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
                          setResponse("");
                        }}
                        className="text-[#1A6FD4] font-bold hover:underline text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h2 className="text-lg font-black text-gray-900">Dispute Details</h2>
              <button onClick={() => setSelectedDispute(null)} className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Close</span>
                &times;
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Customer Reason</h3>
                <p className="text-sm text-gray-800 bg-red-50 p-3 rounded-lg border border-red-100">
                  "{selectedDispute.reason}"
                </p>
              </div>

              {selectedDispute.seller_response && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Response</h3>
                  <p className="text-sm text-gray-800 bg-blue-50 p-3 rounded-lg border border-blue-100">
                    "{selectedDispute.seller_response}"
                  </p>
                </div>
              )}

              {selectedDispute.admin_resolution && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Admin Resolution</h3>
                  <p className="text-sm text-gray-800 bg-green-50 p-3 rounded-lg border border-green-100">
                    "{selectedDispute.admin_resolution}"
                  </p>
                </div>
              )}

              {selectedDispute.status === "open" && (
                <form onSubmit={handleRespond} className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Reply to Customer</h3>
                  <textarea
                    required
                    minLength={5}
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Provide a resolution or explanation..."
                    className="w-full rounded-xl border-gray-200 border p-3 text-sm h-32 focus:ring-2 focus:ring-[#1A6FD4] focus:border-transparent outline-none resize-none mb-4"
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedDispute(null)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-2.5 rounded-xl bg-[#1A6FD4] font-bold text-white hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 text-sm disabled:opacity-70"
                    >
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      Send Response
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
