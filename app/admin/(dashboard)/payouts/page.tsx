"use client";

import { useState, useEffect } from "react";
import { Wallet, Loader2, CheckCircle, Clock, ArrowRight, X } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface Payout {
  id: string;
  seller_id: string;
  amount: number;
  status: "pending" | "processing" | "completed";
  transaction_ref?: string;
  requested_at: string;
  processed_at?: string;
  users?: { full_name?: string; email?: string };
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string; icon: any }> = {
  pending: { bg: "bg-yellow-50", text: "text-yellow-700 border-yellow-200", label: "Pending", icon: Clock },
  processing: { bg: "bg-blue-50", text: "text-blue-700 border-blue-200", label: "Processing", icon: Loader2 },
  completed: { bg: "bg-green-50", text: "text-green-700 border-green-200", label: "Completed", icon: CheckCircle },
};

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [refModal, setRefModal] = useState<{ id: string; status: string } | null>(null);
  const [transactionRef, setTransactionRef] = useState("");

  const fetchPayouts = async () => {
    try {
      const url = filter === "all" ? "/api/admin/payouts" : `/api/admin/payouts?status=${filter}`;
      const res = await api.get<{ data: Payout[] }>(url, { silent: true });
      setPayouts(res?.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchPayouts();
  }, [filter]);

  const handleProcess = async () => {
    if (!refModal) return;
    setActionLoading(refModal.id);
    try {
      await api.patch(`/api/admin/payouts/${refModal.id}/process`, {
        status: refModal.status,
        transaction_ref: transactionRef,
      });
      toast.success(`Payout ${refModal.status === "completed" ? "completed" : "marked processing"}`);
      setRefModal(null);
      setTransactionRef("");
      await fetchPayouts();
    } catch {
      toast.error("Failed to process payout");
    }
    setActionLoading(null);
  };

  const formatINR = (v: number) => "\u20B9" + v.toLocaleString("en-IN", { minimumFractionDigits: 2 });
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Payout Management</h1>
          <p className="text-[15px] text-gray-500 font-medium">Manage seller withdrawals and settlements</p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-2xl shadow-sm self-start lg:self-auto overflow-x-auto no-scrollbar">
          {["all", "pending", "processing", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-[14px] font-bold transition-all ${
                filter === f
                  ? "bg-[#8B5CF6] text-white shadow-md shadow-purple-500/20"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-[#8B5CF6]" />
        </div>
      ) : payouts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Wallet className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-[20px] font-bold text-gray-900 mb-2">No Payouts Found</h2>
          <p className="text-[15px] text-gray-500 font-medium">There are no payouts matching the current filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Seller</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Requested</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payouts.map((p) => {
                  const s = STATUS_STYLES[p.status] || STATUS_STYLES.pending;
                  const Icon = s.icon;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="min-w-0 flex flex-col justify-center">
                          <p className="font-bold text-[14px] text-gray-900">{p.users?.full_name || "—"}</p>
                          <p className="text-[13px] font-medium text-gray-500">{p.users?.email || ""}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-black text-[16px] text-gray-900">{formatINR(p.amount)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14px] font-medium text-gray-600">{formatDate(p.requested_at)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide ${s.bg} ${s.text}`}>
                          <Icon className={`w-3 h-3 ${p.status === 'processing' ? 'animate-spin' : ''}`} />
                          {s.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[13px] font-medium text-gray-400 font-mono tracking-tight">{p.transaction_ref || "—"}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {p.status === "pending" && (
                          <button
                            onClick={() => setRefModal({ id: p.id, status: "processing" })}
                            disabled={actionLoading === p.id}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 text-[12px] font-bold hover:bg-blue-100 transition-colors disabled:opacity-50 shadow-sm"
                          >
                            {actionLoading === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>Process</>}
                          </button>
                        )}
                        {p.status === "processing" && (
                          <button
                            onClick={() => setRefModal({ id: p.id, status: "completed" })}
                            disabled={actionLoading === p.id}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 border border-green-200 text-[12px] font-bold hover:bg-green-100 transition-colors disabled:opacity-50 shadow-sm"
                          >
                            {actionLoading === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>Complete</>}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction Ref Modal */}
      {refModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[20px] font-bold text-gray-900">
                {refModal.status === "completed" ? "Complete Payout" : "Process Payout"}
              </h3>
              <button 
                onClick={() => { setRefModal(null); setTransactionRef(""); }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-4">
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Transaction Reference</label>
              <input
                type="text"
                className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-[14px] font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all shadow-inner"
                placeholder="e.g. NEFT-REF-12345"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setRefModal(null); setTransactionRef(""); }}
                className="flex-1 h-12 rounded-xl border border-gray-200 bg-white text-[14px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleProcess}
                disabled={!!actionLoading}
                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-white text-[14px] font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                style={{ background: refModal.status === "completed" ? "#22C55E" : "#8B5CF6" }}
              >
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
