"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, ShieldAlert, X, MessageSquare, AlertTriangle, MessageCircle } from "lucide-react";
import { disputesApi, Dispute, DisputeStatus } from "@/lib/disputesApi";
import toast from "react-hot-toast";

const STATUS_TABS: { key: DisputeStatus | "all"; label: string }[] = [
  { key: "all", label: "All Disputes" },
  { key: "open", label: "Action Required" },
  { key: "seller_responded", label: "In Review" },
  { key: "resolved_refund", label: "Resolved" },
];

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
      toast.success("Response sent successfully", {
        style: { borderRadius: '16px', background: '#333', color: '#fff' }
      });
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
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold border uppercase tracking-wide bg-red-50 text-red-700 border-red-200">Action Required</span>;
      case "seller_responded":
      case "admin_review":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold border uppercase tracking-wide bg-yellow-50 text-yellow-700 border-yellow-200">In Review</span>;
      case "resolved_refund":
      case "resolved_replace":
      case "resolved_rejected":
      case "closed":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold border uppercase tracking-wide bg-green-50 text-green-700 border-green-200">Resolved</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold border uppercase tracking-wide bg-gray-100 text-gray-700 border-gray-200">{status}</span>;
    }
  };

  return (
    <main className="w-full mx-auto max-w-7xl px-3 sm:px-4 py-6 md:px-8 md:py-10 text-[#1A1A2E]">
      
      {/* ── Desktop Header ── */}
      <div className="hidden md:flex items-center justify-between mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Disputes & Returns</h1>
          <p className="text-[15px] text-gray-500 font-medium">Manage and resolve customer issues quickly.</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 px-5 py-3 shadow-sm flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-gray-400" />
          <div className="flex flex-col">
            <span className="text-[18px] font-bold text-gray-900 leading-none">{disputes.length}</span>
            <span className="text-[12px] font-medium text-gray-500">Active Issues</span>
          </div>
        </div>
      </div>

      {/* ── Mobile Header ── */}
      <div className="md:hidden flex flex-col gap-1 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold tracking-tight text-gray-900">Disputes</h1>
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[13px] font-bold">{disputes.length}</span>
        </div>
        <p className="text-[14px] text-gray-500 font-medium">Manage customer issues.</p>
      </div>

      {/* ── Filters Bar ── */}
      <div className="bg-white rounded-3xl border border-gray-200 p-4 md:p-5 mb-6 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`rounded-full px-5 py-2.5 text-[14px] font-bold transition-all active:scale-[0.98] whitespace-nowrap shrink-0 ${
                statusFilter === tab.key
                  ? "bg-gray-900 text-white shadow-md"
                  : "bg-gray-50 text-gray-500 border border-transparent hover:border-gray-200 hover:bg-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content Area ── */}
      {loading ? (
        <div className="rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 px-6 py-6 border-b border-gray-100 last:border-b-0">
              <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 w-1/4 rounded bg-gray-100 animate-pulse" />
                <div className="h-3 w-1/3 rounded bg-gray-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : disputes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100">
            <CheckCircle2 className="h-10 w-10 text-green-400" />
          </div>
          <h3 className="text-[18px] font-bold text-gray-900 mb-2">No active disputes</h3>
          <p className="max-w-md text-[14px] font-medium text-gray-500 leading-relaxed">
            You're all caught up! Great job maintaining excellent customer satisfaction.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[20%]">Order ID</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[25%]">Issue Type</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[20%]">Date Created</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[20%]">Status</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right w-[15%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {disputes.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <span className="font-mono font-bold text-[15px] text-gray-900">
                        {d.order_id.split('-')[0]}...
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${d.status === "open" ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-500"}`}>
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-[14px] text-gray-900 capitalize">
                          {d.type.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[14px] font-medium text-gray-500">
                        {new Date(d.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(d.status)}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => {
                          setSelectedDispute(d);
                          setResponse("");
                        }}
                        className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-[#1A6FD4] hover:border-[#1A6FD4] hover:shadow-sm transition-all active:scale-95 font-bold text-[13px]"
                      >
                        <MessageSquare className="w-4 h-4" /> Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Details Modal ── */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                  <ShieldAlert className="w-5 h-5 text-[#1A6FD4]" />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-gray-900">Dispute Details</h2>
                  <p className="text-[13px] font-medium text-gray-500">Order #{selectedDispute.order_id.split('-')[0]}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDispute(null)} 
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Customer Bubble */}
              <div className="flex flex-col gap-2 max-w-[85%]">
                <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider px-1">Customer Issue</span>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-4 text-[14px] text-gray-800 font-medium leading-relaxed border border-gray-200">
                  {selectedDispute.reason}
                </div>
              </div>

              {/* Seller Bubble */}
              {selectedDispute.seller_response && (
                <div className="flex flex-col gap-2 max-w-[85%] ml-auto items-end">
                  <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider px-1">Your Response</span>
                  <div className="bg-[#1A6FD4] rounded-2xl rounded-tr-sm p-4 text-[14px] text-white font-medium leading-relaxed shadow-sm">
                    {selectedDispute.seller_response}
                  </div>
                </div>
              )}

              {/* Admin Bubble */}
              {selectedDispute.admin_resolution && (
                <div className="flex flex-col gap-2 w-full items-center mt-8">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-white px-2 z-10">Admin Resolution</span>
                  <div className="w-full bg-green-50 rounded-2xl p-4 text-[14px] text-green-800 font-medium leading-relaxed border border-green-200 text-center -mt-3">
                    {selectedDispute.admin_resolution}
                  </div>
                </div>
              )}

              {/* Response Form */}
              {selectedDispute.status === "open" && (
                <form onSubmit={handleRespond} className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-[15px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#1A6FD4]" /> Reply to Customer
                  </h3>
                  <textarea
                    required
                    minLength={5}
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Provide a helpful resolution or explanation..."
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-[15px] font-medium text-gray-900 outline-none focus:bg-white focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all shadow-sm placeholder:text-gray-400 h-32 resize-none mb-4"
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedDispute(null)}
                      className="flex-1 py-3.5 rounded-2xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-[0.98] text-[15px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-[2] py-3.5 rounded-2xl bg-[#1A6FD4] font-bold text-white hover:bg-[#155bb5] transition-all active:scale-[0.98] shadow-md flex justify-center items-center gap-2 text-[15px] disabled:opacity-50 disabled:active:scale-100"
                    >
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageSquare className="w-5 h-5" />}
                      Send Resolution
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
