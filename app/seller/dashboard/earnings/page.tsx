"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2, IndianRupee, Clock, CheckCircle2, Wallet, ArrowRight, FileText, TrendingUp, ChevronLeft, ChevronRight, PackageOpen } from "lucide-react";
import Link from "next/link";

interface EarningSummary {
  total: number;
  pending: number;
  available: number;
  requested: number;
  paid: number;
}

interface EarningRecord {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  order_items?: { product_name: string; quantity: number; order_id?: string; product_image?: string };
}

function formatINR(v: number) {
  return "\u20B9" + v.toLocaleString("en-IN");
}

const statusCfg: Record<string, { bg: string; text: string; label: string; border: string }> = {
  pending: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", label: "Pending" },
  available: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", label: "Available" },
  requested: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", label: "Payout Requested" },
  paid: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Paid" },
};

export default function EarningsPage() {
  const [summary, setSummary] = useState<EarningSummary | null>(null);
  const [history, setHistory] = useState<EarningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const [s, h] = await Promise.all([
          api.get<EarningSummary>("/api/seller/earnings", { silent: true }),
          api.get<{ data: EarningRecord[]; total: number; limit: number }>(`/api/seller/earnings/history?page=${page}&limit=10`, { silent: true }),
        ]);
        setSummary(s);
        setHistory(h?.data || []);
        setTotalPages(Math.ceil((h?.total || 0) / (h?.limit || 10)));
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [page]);

  const cards = [
    { label: "Total Earnings", value: summary?.total || 0, icon: <TrendingUp className="w-6 h-6" />, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Pending Clearance", value: summary?.pending || 0, icon: <Clock className="w-6 h-6" />, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-100" },
    { label: "Available to Withdraw", value: summary?.available || 0, icon: <Wallet className="w-6 h-6" />, color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
    { label: "Payout Requested", value: summary?.requested || 0, icon: <FileText className="w-6 h-6" />, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
    { label: "Successfully Paid", value: summary?.paid || 0, icon: <CheckCircle2 className="w-6 h-6" />, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  ];

  return (
    <main className="w-full mx-auto max-w-7xl px-3 sm:px-4 py-6 md:px-8 md:py-10 text-[#1A1A2E]">
      
      {/* ── Desktop Header ── */}
      <div className="hidden md:flex items-center justify-between mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Earnings</h1>
          <p className="text-[15px] text-gray-500 font-medium">Track your revenue, pending balances, and total earnings.</p>
        </div>
        <Link
          href="/seller/dashboard/payouts"
          className="flex items-center gap-2 h-12 px-6 bg-[#1A6FD4] text-white text-[15px] font-bold rounded-2xl hover:bg-[#155bb5] transition-all shadow-md active:scale-[0.98]"
        >
          Manage Payouts <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ── Mobile Header ── */}
      <div className="md:hidden flex flex-col gap-4 mb-8">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-gray-900">Earnings</h1>
          <p className="text-[14px] text-gray-500 font-medium mt-1">Track your revenue and balances.</p>
        </div>
        <Link
          href="/seller/dashboard/payouts"
          className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-[#1A6FD4] text-white text-[15px] font-bold rounded-2xl shadow-md"
        >
          Manage Payouts <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ── Metric Cards ── */}
      {loading && !summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 h-36 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          {cards.map((c) => (
            <div key={c.label} className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-24 h-24 ${c.bg} rounded-bl-full -mr-4 -mt-4 opacity-50 transition-transform group-hover:scale-110`} />
              
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 relative z-10 ${c.bg} ${c.color} border ${c.border}`}>
                {c.icon}
              </div>
              <div className="relative z-10">
                <p className="text-[28px] font-bold text-gray-900 tracking-tight leading-none mb-1">{formatINR(c.value)}</p>
                <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wide">{c.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Earnings History Table ── */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-[18px] font-bold text-gray-900">Recent Earnings History</h2>
        </div>
        
        {loading && history.length === 0 ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4]" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
              <IndianRupee className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-[18px] font-bold text-gray-900 mb-2">No earnings yet</h3>
            <p className="text-[14px] font-medium text-gray-500 max-w-sm">
              Your earnings will appear here once you start processing and delivering orders.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200">
                    <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[40%]">Product / Source</th>
                    <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[15%]">Qty</th>
                    <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[15%]">Amount</th>
                    <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[15%]">Status</th>
                    <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right w-[15%]">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((e) => {
                    const sc = statusCfg[e.status] || statusCfg.pending;
                    return (
                      <tr key={e.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                              {e.order_items?.product_image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={e.order_items.product_image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <PackageOpen className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-[14px] text-gray-900 truncate">
                                {e.order_items?.product_name || "Order earning"}
                              </span>
                              {e.order_items?.order_id && (
                                <span className="text-[12px] font-medium text-gray-400 mt-0.5 font-mono">
                                  Ord: {e.order_items.order_id.split('-')[0]}...
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-[14px] font-bold text-gray-600">
                            {e.order_items?.quantity ? `×${e.order_items.quantity}` : "—"}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-bold text-[15px] text-gray-900">
                            {formatINR(Number(e.amount))}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold border uppercase tracking-wide ${sc.bg} ${sc.text} ${sc.border}`}>
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className="text-[13px] font-medium text-gray-500">
                            {new Date(e.created_at).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
                <p className="text-[14px] font-medium text-gray-500 hidden sm:block">
                  Page <span className="font-bold text-gray-900">{page}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
                </p>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[14px] font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-all active:scale-[0.98] shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <span className="text-[14px] font-bold text-gray-900 sm:hidden">{page} / {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[14px] font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-all active:scale-[0.98] shadow-sm"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
