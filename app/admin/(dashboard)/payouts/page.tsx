"use client";

import { useState, useEffect } from "react";
import { Wallet, Loader2, CheckCircle, Clock, ArrowRight } from "lucide-react";
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

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "#FEF3C7", text: "#92400E", label: "Pending" },
  processing: { bg: "#DBEAFE", text: "#1E40AF", label: "Processing" },
  completed: { bg: "#D1FAE5", text: "#065F46", label: "Completed" },
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Wallet className="w-6 h-6 text-[#1A6FD4]" />
        <h1 className="text-xl font-bold text-[#1A1A2E]">Payout Management</h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["all", "pending", "processing", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{
              background: filter === f ? "#1A6FD4" : "#F3F4F6",
              color: filter === f ? "#FFFFFF" : "#4B5563",
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {payouts.length === 0 ? (
        <div className="text-center py-16">
          <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-[#9CA3AF]">No payouts found</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#E8EEF4] bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8EEF4] bg-[#F8FAFC]">
                <th className="text-left px-5 py-3 font-semibold text-[#4B5563]">Seller</th>
                <th className="text-left px-5 py-3 font-semibold text-[#4B5563]">Amount</th>
                <th className="text-left px-5 py-3 font-semibold text-[#4B5563]">Requested</th>
                <th className="text-left px-5 py-3 font-semibold text-[#4B5563]">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-[#4B5563]">Ref</th>
                <th className="text-right px-5 py-3 font-semibold text-[#4B5563]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => {
                const s = STATUS_STYLES[p.status] || STATUS_STYLES.pending;
                return (
                  <tr key={p.id} className="border-b border-[#E8EEF4] last:border-0 hover:bg-[#F8FAFC]">
                    <td className="px-5 py-3">
                      <p className="font-medium text-[#1A1A2E]">{p.users?.full_name || "—"}</p>
                      <p className="text-xs text-[#9CA3AF]">{p.users?.email || ""}</p>
                    </td>
                    <td className="px-5 py-3 font-semibold text-[#1A1A2E]">{formatINR(p.amount)}</td>
                    <td className="px-5 py-3 text-[#4B5563]">{formatDate(p.requested_at)}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: s.bg, color: s.text }}>
                        {p.status === "completed" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {s.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#9CA3AF]">{p.transaction_ref || "—"}</td>
                    <td className="px-5 py-3 text-right">
                      {p.status === "pending" && (
                        <button
                          onClick={() => setRefModal({ id: p.id, status: "processing" })}
                          disabled={actionLoading === p.id}
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                          style={{ background: "#1A6FD4" }}
                        >
                          {actionLoading === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <>Mark Processing</>}
                        </button>
                      )}
                      {p.status === "processing" && (
                        <button
                          onClick={() => setRefModal({ id: p.id, status: "completed" })}
                          disabled={actionLoading === p.id}
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                          style={{ background: "#16A34A" }}
                        >
                          {actionLoading === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <>Complete</>}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Transaction Ref Modal */}
      {refModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h3 className="text-base font-semibold text-[#1A1A2E] mb-3">
              {refModal.status === "completed" ? "Complete Payout" : "Process Payout"}
            </h3>
            <label className="block text-sm font-medium text-[#4B5563] mb-1.5">Transaction Reference</label>
            <input
              type="text"
              className="h-11 w-full rounded-lg border border-[#E8EEF4] bg-white px-4 text-sm placeholder:text-[#9CA3AF] focus:border-[#1A6FD4] focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/10"
              placeholder="e.g. NEFT-REF-12345"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
            />
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setRefModal(null); setTransactionRef(""); }}
                className="flex-1 rounded-lg border border-[#E8EEF4] py-2.5 text-sm font-medium text-[#4B5563]"
              >
                Cancel
              </button>
              <button
                onClick={handleProcess}
                disabled={!!actionLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: refModal.status === "completed" ? "#16A34A" : "#1A6FD4" }}
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
