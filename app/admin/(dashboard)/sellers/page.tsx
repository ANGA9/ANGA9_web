"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2, Store, CheckCircle2, Clock, XCircle } from "lucide-react";
import Header from "@/components/Header";

interface Seller {
  id: string; user_id: string; business_name?: string; business_type?: string;
  verification_status: string; onboarding_complete: boolean; city?: string;
  state?: string; created_at: string;
}

const STATUS_BADGE: Record<string, { cls: string; label: string }> = {
  verified: { cls: "bg-[#F0FDF4] text-[#22C55E] border-[#BBF7D0]", label: "Verified" },
  pending: { cls: "bg-[#FFFBEB] text-[#F59E0B] border-[#FDE68A]", label: "Pending Review" },
  unverified: { cls: "bg-[#F3F4F6] text-[#9CA3AF] border-[#E8EEF4]", label: "Unverified" },
  rejected: { cls: "bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]", label: "Rejected" },
};

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<{ sellers: Seller[] }>("/api/users/sellers", { silent: true });
        setSellers(res?.sellers || []);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="min-h-screen"><Header /><div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-[#1A6FD4]" /></div></div>;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="p-6 xl:p-8">
        <div className="mb-6">
          <h1 className="text-[20px] font-bold text-anga-text">Registered Sellers</h1>
          <p className="text-[13px] text-anga-text-secondary">{sellers.length} seller{sellers.length !== 1 ? "s" : ""} registered</p>
        </div>

        {sellers.length === 0 ? (
          <div className="bg-white rounded-xl border border-anga-border p-12 text-center">
            <Store className="w-12 h-12 text-[#E8EEF4] mx-auto mb-4" />
            <h2 className="text-[16px] font-bold text-anga-text mb-2">No Sellers Yet</h2>
            <p className="text-[13px] text-anga-text-secondary">Sellers will appear here after they complete onboarding</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-anga-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-anga-border bg-[#F8FBFF]">
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Business Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Location</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Joined</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map((s) => {
                    const badge = STATUS_BADGE[s.verification_status] || STATUS_BADGE.unverified;
                    return (
                      <tr key={s.id} className="border-b border-anga-border last:border-0 hover:bg-[#F8FBFF] transition-colors">
                        <td className="px-4 py-3 font-medium text-anga-text">{s.business_name || "—"}</td>
                        <td className="px-4 py-3 text-[#4B5563] capitalize">{s.business_type?.replace("_", " ") || "—"}</td>
                        <td className="px-4 py-3 text-[#4B5563]">{[s.city, s.state].filter(Boolean).join(", ") || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badge.cls}`}>{badge.label}</span>
                        </td>
                        <td className="px-4 py-3 text-[#9CA3AF]">{new Date(s.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          {s.verification_status === "pending" && (
                            <div className="flex gap-2">
                              <button className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#22C55E] text-white text-[11px] font-semibold hover:bg-[#16A34A] transition-colors">
                                <CheckCircle2 className="w-3 h-3" /> Approve
                              </button>
                              <button className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#EF4444] text-white text-[11px] font-semibold hover:bg-[#DC2626] transition-colors">
                                <XCircle className="w-3 h-3" /> Reject
                              </button>
                            </div>
                          )}
                          {s.verification_status === "verified" && (
                            <span className="text-[11px] text-[#22C55E] font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</span>
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
      </main>
    </div>
  );
}
