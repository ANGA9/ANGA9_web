"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2, Wallet, ArrowLeft, IndianRupee } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Payout {
  id: string;
  amount: number;
  status: string;
  requested_at: string;
  processed_at?: string;
  transaction_ref?: string;
}

interface EarningSummary {
  total: number;
  pending: number;
  available: number;
  requested: number;
  paid: number;
}

function formatINR(v: number) {
  return "\u20B9" + v.toLocaleString("en-IN");
}

const statusCfg: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "#FFFBEB", text: "#F59E0B", label: "Pending" },
  processing: { bg: "#EAF2FF", text: "#1A6FD4", label: "Processing" },
  completed: { bg: "#F0FDF4", text: "#22C55E", label: "Completed" },
};

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [summary, setSummary] = useState<EarningSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  const fetchData = async () => {
    try {
      const [p, s] = await Promise.all([
        api.get<{ data: Payout[] }>("/api/seller/payouts", { silent: true }),
        api.get<EarningSummary>("/api/seller/earnings", { silent: true }),
      ]);
      setPayouts(p?.data || []);
      setSummary(s);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleRequestPayout = async () => {
    if (requesting) return;
    setRequesting(true);
    try {
      await api.post("/api/seller/payouts/request", {});
      toast.success("Payout requested successfully");
      fetchData();
    } catch {
      toast.error("Failed to request payout");
    }
    setRequesting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4]" />
      </div>
    );
  }

  const available = summary?.available || 0;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/seller/dashboard/earnings" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-[#4B5563]" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-bold text-[#1A1A2E]">Payouts</h1>
          <p className="text-sm text-[#9CA3AF]">Request and track your payouts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-[#E8EEF4] p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-[#EAF2FF]">
            <Wallet className="w-5 h-5 text-[#1A6FD4]" />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold text-[#1A1A2E]">{formatINR(available)}</p>
            <p className="text-xs text-[#9CA3AF] font-medium">Available for Payout</p>
          </div>
          <button
            onClick={handleRequestPayout}
            disabled={requesting || available <= 0}
            className="h-10 px-5 bg-[#22C55E] text-white text-sm font-semibold rounded-lg hover:bg-[#16A34A] transition-colors disabled:opacity-50"
          >
            {requesting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Request Payout"}
          </button>
        </div>
        <div className="bg-white rounded-xl border border-[#E8EEF4] p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-[#EDE9FE]">
            <IndianRupee className="w-5 h-5 text-[#6C47FF]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1A1A2E]">{formatINR(summary?.requested || 0)}</p>
            <p className="text-xs text-[#9CA3AF] font-medium">Payout Requested</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E8EEF4] p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-[#F0FDF4]">
            <IndianRupee className="w-5 h-5 text-[#22C55E]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1A1A2E]">{formatINR(summary?.paid || 0)}</p>
            <p className="text-xs text-[#9CA3AF] font-medium">Total Paid Out</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E8EEF4] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E8EEF4]">
          <h2 className="text-base font-bold text-[#1A1A2E]">Payout History</h2>
        </div>
        {payouts.length === 0 ? (
          <div className="p-8 text-center">
            <Wallet className="w-10 h-10 mx-auto mb-2 text-[#E8EEF4]" />
            <p className="text-sm text-[#9CA3AF]">No payouts yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FBFF] border-b border-[#E8EEF4]">
                  <th className="text-left px-5 py-3 font-semibold text-[#4B5563]">Amount</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#4B5563]">Status</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#4B5563]">Requested</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#4B5563]">Processed</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#4B5563]">Ref</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => {
                  const sc = statusCfg[p.status] || statusCfg.pending;
                  return (
                    <tr key={p.id} className="border-b border-[#E8EEF4] last:border-0 hover:bg-[#F8FBFF]">
                      <td className="px-5 py-3 font-bold text-[#1A1A2E]">{formatINR(Number(p.amount))}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: sc.bg, color: sc.text }}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#9CA3AF]">{new Date(p.requested_at).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-[#9CA3AF]">{p.processed_at ? new Date(p.processed_at).toLocaleDateString() : "—"}</td>
                      <td className="px-5 py-3 text-[#9CA3AF] font-mono text-xs">{p.transaction_ref || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
