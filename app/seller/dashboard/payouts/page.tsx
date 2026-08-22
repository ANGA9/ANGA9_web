"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2, Wallet, ArrowLeft, IndianRupee, Landmark, CheckCircle2, AlertCircle, X, FileText, Download } from "lucide-react";
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

import { useBrand } from "@/lib/BrandContext";

export default function PayoutsPage() {
  const { brands, activeBrandId } = useBrand();
  const activeBrand = brands.find((b) => b.id === activeBrandId) || brands[0];
  const activeBrandName = activeBrand?.seller_profiles?.store_name || activeBrand?.full_name || "Selected Brand";

  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [summary, setSummary] = useState<EarningSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const available = summary?.available || 0;

  const handleDownloadCommissionInvoice = async (payoutId: string) => {
    if (downloadingId) return;
    try {
      setDownloadingId(payoutId);
      const res = await api.get<{ url: string }>(`/api/seller/payouts/${payoutId}/commission-invoice`);
      if (res.url) {
        window.open(res.url, "_blank");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to download commission invoice", { style: { borderRadius: '16px' } });
    } finally {
      setDownloadingId(null);
    }
  };

  const fetchData = async () => {
    try {
      const q = activeBrandId ? `?seller_id=${activeBrandId}` : "";
      const [p, s] = await Promise.all([
        api.get<{ data: Payout[] }>(`/api/seller/payouts${q}`, { silent: true }),
        api.get<EarningSummary>(`/api/seller/earnings${q}`, { silent: true }),
      ]);
      setPayouts(p?.data || []);
      setSummary(s);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { 
    fetchData(); 
  }, [activeBrandId]);

  const handleRequestPayout = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (requesting) return;
    
    const amt = parseFloat(customAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount", { style: { borderRadius: '16px' } });
      return;
    }
    if (amt > available) {
      toast.error("Amount cannot exceed available balance", { style: { borderRadius: '16px' } });
      return;
    }

    setRequesting(true);
    try {
      const q = activeBrandId ? `?seller_id=${activeBrandId}` : "";
      await api.post(`/api/seller/payouts/request${q}`, { amount: amt });
      toast.success("Payout requested successfully", {
        style: { borderRadius: '16px', background: '#333', color: '#fff' }
      });
      setShowModal(false);
      setCustomAmount("");
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to request payout", { style: { borderRadius: '16px' } });
    }
    setRequesting(false);
  };

  const handleCancelPayout = async (id: string) => {
    if (cancellingId) return;
    setCancellingId(id);
    try {
      await api.post(`/api/seller/payouts/${id}/cancel`, {});
      toast.success("Payout cancelled successfully", {
        style: { borderRadius: '16px', background: '#333', color: '#fff' }
      });
      fetchData();
    } catch {
      toast.error("Failed to cancel payout", { style: { borderRadius: '16px' } });
    }
    setCancellingId(null);
  };

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {/* Primary Action Card */}
          <div className="bg-white rounded-2xl border-l-4 border-l-[#1A6FD4] border border-gray-200 p-5 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-gray-400" />
                <span className="text-[14px] font-bold text-gray-500 uppercase tracking-wide">Available Balance</span>
              </div>
              <span className="text-[14px] font-bold text-[#1A6FD4] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                Ready
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <p className="text-[32px] font-bold text-gray-900 tracking-tight leading-none mb-1">{formatINR(available)}</p>
                <p className="text-[14px] font-medium text-gray-500">Ready to withdraw</p>
              </div>
              <button
                onClick={() => {
                  setCustomAmount(available.toString());
                  setShowModal(true);
                }}
                disabled={available <= 0}
                className="inline-flex items-center justify-center gap-2 h-11 px-5 text-[14px] font-bold rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 bg-[#1A6FD4] text-white hover:bg-[#1559B3]"
              >
                Withdraw
              </button>
            </div>
          </div>

          {/* Requested Card */}
          <div className="bg-white rounded-2xl border-l-4 border-l-amber-400 border border-gray-200 p-5 flex flex-col justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-gray-400" />
              <span className="text-[14px] font-bold text-gray-500 uppercase tracking-wide">Payouts Processing</span>
            </div>
            <div>
              <p className="text-[32px] font-bold text-gray-900 tracking-tight leading-none mb-1">{formatINR(summary?.requested || 0)}</p>
              <p className="text-[14px] font-medium text-gray-500">Pending transfer</p>
            </div>
          </div>

          {/* Paid Out Card */}
          <div className="bg-white rounded-2xl border-l-4 border-l-green-500 border border-gray-200 p-5 flex flex-col justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-gray-400" />
              <span className="text-[14px] font-bold text-gray-500 uppercase tracking-wide">Total Transferred</span>
            </div>
            <div>
              <p className="text-[32px] font-bold text-gray-900 tracking-tight leading-none mb-1">{formatINR(summary?.paid || 0)}</p>
              <p className="text-[14px] font-medium text-gray-500">Lifetime payouts</p>
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
                  <th className="px-6 py-4 text-[14px] font-bold text-gray-500 uppercase tracking-wider w-[20%]">Amount</th>
                  <th className="px-6 py-4 text-[14px] font-bold text-gray-500 uppercase tracking-wider w-[20%]">Status</th>
                  <th className="px-6 py-4 text-[14px] font-bold text-gray-500 uppercase tracking-wider w-[20%]">Requested</th>
                  <th className="px-6 py-4 text-[14px] font-bold text-gray-500 uppercase tracking-wider w-[20%]">Processed</th>
                  <th className="px-6 py-4 text-[14px] font-bold text-gray-500 uppercase tracking-wider w-[10%]">Bank Ref No.</th>
                  <th className="px-6 py-4 text-[14px] font-bold text-gray-500 uppercase tracking-wider w-[10%] text-right">Actions</th>
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
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-[14px] font-bold border uppercase tracking-wide ${sc.bg} ${sc.text} ${sc.border}`}>
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
                        <span className="text-[14px] font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                          {p.transaction_ref || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        {p.status === "pending" && (
                          <button
                            onClick={() => handleCancelPayout(p.id)}
                            disabled={cancellingId === p.id}
                            className="text-[14px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            {cancellingId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null} Cancel
                          </button>
                        )}
                        {p.status === "completed" && (
                          <button
                            onClick={() => handleDownloadCommissionInvoice(p.id)}
                            disabled={downloadingId === p.id}
                            className="text-[13px] font-semibold text-[#1A6FD4] hover:text-[#1559B3] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                            title="Download Commission & TCS Tax Invoice"
                          >
                            {downloadingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                            <span>Invoice</span>
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
      </div>

      {/* ── Custom Amount Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="text-[20px] font-bold text-gray-900">Request Payout</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleRequestPayout} className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[14px] font-bold text-gray-700">Amount to Withdraw (₹)</label>
                  <span className="text-[14px] font-medium text-gray-500">
                    Max: <button type="button" onClick={() => setCustomAmount(available.toString())} className="font-bold text-[#1A6FD4] hover:underline">{formatINR(available)}</button>
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="1"
                    max={available}
                    required
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-8 pr-4 py-3 text-[16px] font-bold text-gray-900 outline-none focus:bg-white focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all shadow-inner"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-12 rounded-xl bg-gray-50 text-[15px] font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requesting || !customAmount || parseFloat(customAmount) <= 0 || parseFloat(customAmount) > available}
                  className="flex-1 h-12 rounded-xl text-[15px] font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 bg-[#1A6FD4] text-white hover:bg-[#1559B3]"
                >
                  {requesting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Withdraw"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
