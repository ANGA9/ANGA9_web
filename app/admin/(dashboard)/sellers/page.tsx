"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2, Store, CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";

interface Seller {
  id: string; 
  user_id: string; 
  business_name?: string; 
  business_type?: string;
  verification_status: string; 
  onboarding_complete: boolean; 
  city?: string;
  state?: string; 
  created_at: string;
}

const STATUS_BADGE: Record<string, { cls: string; label: string }> = {
  verified: { cls: "bg-green-50 text-green-700 border-green-200", label: "Verified" },
  pending: { cls: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Pending Review" },
  unverified: { cls: "bg-gray-100 text-gray-600 border-gray-200", label: "Unverified" },
  rejected: { cls: "bg-red-50 text-red-700 border-red-200", label: "Rejected" },
};

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<{ sellers: Seller[] }>("/api/users/sellers", { silent: true });
        setSellers(res?.sellers || []);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const handleApprove = async (sellerId: string) => {
    setActionLoading(sellerId);
    try {
      await api.patch(`/api/users/sellers/${sellerId}/verify`, { status: "verified" });
      setSellers((prev) =>
        prev.map((s) => (s.id === sellerId ? { ...s, verification_status: "verified" } : s))
      );
      toast.success("Seller approved successfully");
    } catch {
      toast.error("Failed to approve seller");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (sellerId: string) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;
    setActionLoading(sellerId);
    try {
      await api.patch(`/api/users/sellers/${sellerId}/verify`, { status: "rejected", reason });
      setSellers((prev) =>
        prev.map((s) => (s.id === sellerId ? { ...s, verification_status: "rejected" } : s))
      );
      toast.success("Seller rejected");
    } catch {
      toast.error("Failed to reject seller");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Seller Directory</h1>
          <p className="text-[15px] text-gray-500 font-medium">{sellers.length} store{sellers.length !== 1 ? "s" : ""} on the platform</p>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-[#8B5CF6]" />
        </div>
      ) : sellers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Store className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-[20px] font-bold text-gray-900 mb-2">No Sellers Yet</h2>
          <p className="text-[15px] text-gray-500 font-medium">Sellers will appear here after they begin onboarding.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Business Name</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sellers.map((s) => {
                  const badge = STATUS_BADGE[s.verification_status] || STATUS_BADGE.unverified;
                  return (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center border border-purple-100 shadow-sm shrink-0">
                            <Store className="w-5 h-5 text-purple-600" />
                          </div>
                          <span className="font-bold text-[14px] text-gray-900">
                            {s.business_name || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14px] font-medium text-gray-600 capitalize">
                          {s.business_type?.replace("_", " ") || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14px] font-medium text-gray-600">
                          {[s.city, s.state].filter(Boolean).join(", ") || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px] font-medium text-gray-500">
                        {new Date(s.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {s.verification_status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(s.id)}
                                disabled={actionLoading === s.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 text-white text-[13px] font-bold hover:bg-green-600 transition-all shadow-sm disabled:opacity-50"
                              >
                                {actionLoading === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Approve
                              </button>
                              <button
                                onClick={() => handleReject(s.id)}
                                disabled={actionLoading === s.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-red-200 text-red-600 text-[13px] font-bold hover:bg-red-50 transition-all shadow-sm disabled:opacity-50"
                              >
                                <XCircle className="w-4 h-4" /> Reject
                              </button>
                            </>
                          )}
                          {s.verification_status === "verified" && (
                            <span className="text-[13px] font-bold text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Approved
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
