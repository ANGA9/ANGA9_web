"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2, Wallet, ArrowLeft, IndianRupee, Landmark, CheckCircle2, AlertCircle } from "lucide-react";
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

const statusCfg: Record<string, { bg: string; text: string; label: string; border: string }> = {
  pending: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", label: "Pending" },
  processing: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Processing" },
  completed: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", label: "Completed" },
  failed: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Failed" },
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
      toast.success("Payout requested successfully", {
        style: { borderRadius: '16px', background: '#333', color: '#fff' }
      });
      fetchData();
    } catch {
      toast.error("Failed to request payout", { style: { borderRadius: '16px' } });
    }
    setRequesting(false);
  };

  const available = summary?.available || 0;

  return (
    <main className="w-full mx-auto max-w-7xl px-3 sm:px-4 py-6 md:px-8 md:py-10 text-[#1A1A2E]">
      
      <Link href="/seller/dashboard/earnings" className="inline-flex items-center gap-1.5 text-[14px] font-bold text-gray-500 hover:text-[#1A6FD4] transition-colors mb-6 group">
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Earnings
      </Link>

      {/* ── Desktop Header ── */}
      <div className="hidden md:flex items-center justify-between mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Payouts</h1>
          <p className="text-[15px] text-gray-500 font-medium">Request bank transfers and view payout history.</p>
        </div>
      </div>

      {/* ── Mobile Header ── */}
      <div className="md:hidden flex flex-col gap-1 mb-6">
        <h1 className="text-[24px] font-bold tracking-tight text-gray-900">Payouts</h1>
        <p className="text-[14px] text-gray-500 font-medium">Manage bank transfers.</p>
      </div>

      {loading && !summary ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          {[1, 2, 3].map(i => <div key={i} className="h-40 rounded-3xl bg-white border border-gray-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          {/* Primary Action Card */}
          <div className="bg-white rounded-3xl border border-blue-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110" />
            <div className="relative z-10 flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100">
                <Wallet className="w-6 h-6" />
              </div>
              <span className="text-[12px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wide border border-blue-100">
                Available
              </span>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-[36px] font-bold text-gray-900 tracking-tight leading-none mb-1">{formatINR(available)}</p>
                <p className="text-[14px] font-medium text-gray-500">Ready to withdraw</p>
              </div>
              <button
                onClick={handleRequestPayout}
                disabled={requesting || available <= 0}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-[#1A6FD4] text-white text-[15px] font-bold rounded-2xl hover:bg-[#155bb5] transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
              >
                {requesting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Withdraw"}
              </button>
            </div>
          </div>

          {/* Requested Card */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col shadow-sm">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-yellow-50 text-yellow-600 border border-yellow-100 mb-6">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[32px] font-bold text-gray-900 tracking-tight leading-none mb-1">{formatINR(summary?.requested || 0)}</p>
              <p className="text-[14px] font-medium text-gray-500">Payouts Processing</p>
            </div>
          </div>

          {/* Paid Out Card */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col shadow-sm">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-green-50 text-green-600 border border-green-100 mb-6">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[32px] font-bold text-gray-900 tracking-tight leading-none mb-1">{formatINR(summary?.paid || 0)}</p>
              <p className="text-[14px] font-medium text-gray-500">Total Transferred</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Payout History Table ── */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-[18px] font-bold text-gray-900 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-[#1A6FD4]" /> Bank Transfers
          </h2>
        </div>

        {loading && payouts.length === 0 ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4]" />
          </div>
        ) : payouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-[18px] font-bold text-gray-900 mb-2">No payouts requested</h3>
            <p className="text-[14px] font-medium text-gray-500 max-w-sm">
              When you withdraw your available balance, the bank transfer records will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[20%]">Amount</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[20%]">Status</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[20%]">Requested</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[20%]">Processed</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[20%]">Bank Ref No.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payouts.map((p) => {
                  const sc = statusCfg[p.status] || statusCfg.pending;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <span className="font-bold text-[16px] text-gray-900">{formatINR(Number(p.amount))}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold border uppercase tracking-wide ${sc.bg} ${sc.text} ${sc.border}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[14px] font-medium text-gray-500">
                          {new Date(p.requested_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[14px] font-medium text-gray-500">
                          {p.processed_at ? new Date(p.processed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[13px] font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                          {p.transaction_ref || "Pending"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
