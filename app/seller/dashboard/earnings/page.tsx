"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2, IndianRupee, Clock, CheckCircle2, Wallet, ArrowRight, FileText } from "lucide-react";
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
  order_items?: { product_name: string; quantity: number; order_id?: string };
}

function formatINR(v: number) {
  return "\u20B9" + v.toLocaleString("en-IN");
}

const statusCfg: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "#FFFBEB", text: "#F59E0B", label: "Pending" },
  available: { bg: "#F0FDF4", text: "#22C55E", label: "Available" },
  requested: { bg: "#EDE9FE", text: "#6C47FF", label: "Payout Requested" },
  paid: { bg: "#EAF2FF", text: "#1A6FD4", label: "Paid" },
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4]" />
      </div>
    );
  }

  const cards = [
    { label: "Total Earnings", value: summary?.total || 0, icon: <IndianRupee className="w-5 h-5 text-[#22C55E]" />, bg: "bg-[#F0FDF4]" },
    { label: "Pending", value: summary?.pending || 0, icon: <Clock className="w-5 h-5 text-[#F59E0B]" />, bg: "bg-[#FFFBEB]" },
    { label: "Available", value: summary?.available || 0, icon: <Wallet className="w-5 h-5 text-[#1A6FD4]" />, bg: "bg-[#EAF2FF]" },
    { label: "Payout Requested", value: summary?.requested || 0, icon: <FileText className="w-5 h-5 text-[#6C47FF]" />, bg: "bg-[#EDE9FE]" },
    { label: "Paid Out", value: summary?.paid || 0, icon: <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />, bg: "bg-[#F0FDF4]" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#1A1A2E]">Earnings</h1>
          <p className="text-sm text-[#9CA3AF]">Track your revenue and earnings</p>
        </div>
        <Link
          href="/seller/dashboard/payouts"
          className="flex items-center gap-2 h-10 px-5 bg-[#1A6FD4] text-white text-sm font-semibold rounded-lg hover:bg-[#155bb5] transition-colors"
        >
          View Payouts <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-[#E8EEF4] p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${c.bg}`}>{c.icon}</div>
            <div>
              <p className="text-xl font-bold text-[#1A1A2E]">{formatINR(c.value)}</p>
              <p className="text-xs text-[#9CA3AF] font-medium">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[#E8EEF4] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E8EEF4]">
          <h2 className="text-base font-bold text-[#1A1A2E]">Earnings History</h2>
        </div>
        {history.length === 0 ? (
          <div className="p-8 text-center">
            <IndianRupee className="w-10 h-10 mx-auto mb-2 text-[#E8EEF4]" />
            <p className="text-sm text-[#9CA3AF]">No earnings yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FBFF] border-b border-[#E8EEF4]">
                  <th className="text-left px-5 py-3 font-semibold text-[#4B5563]">Product</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#4B5563]">Qty</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#4B5563]">Amount</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#4B5563]">Status</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#4B5563]">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((e) => {
                  const sc = statusCfg[e.status] || statusCfg.pending;
                  return (
                    <tr key={e.id} className="border-b border-[#E8EEF4] last:border-0 hover:bg-[#F8FBFF]">
                      <td className="px-5 py-3 text-[#1A1A2E] font-medium">{e.order_items?.product_name || "Order earning"}</td>
                      <td className="px-5 py-3 text-[#4B5563]">{e.order_items?.quantity ?? "—"}</td>
                      <td className="px-5 py-3 font-bold text-[#1A1A2E]">{formatINR(Number(e.amount))}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: sc.bg, color: sc.text }}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#9CA3AF]">{new Date(e.created_at).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-[#E8EEF4]">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-40" style={{ borderColor: "#E8EEF4" }}>
              Prev
            </button>
            <span className="text-sm text-[#4B5563]">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-40" style={{ borderColor: "#E8EEF4" }}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
