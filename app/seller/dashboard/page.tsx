"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { IndianRupee, ShoppingCart, Package, Eye, Plus, Clock, CheckCircle2, Store, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
type VStatus = "unverified" | "pending" | "verified" | "rejected";

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#E8EEF4] p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl md:text-3xl font-bold text-[#1A1A2E]">{value}</p>
        <p className="text-xs md:text-sm text-[#9CA3AF] font-medium">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const { loading: authLoading, getToken } = useAuth();
  const [status, setStatus] = useState<VStatus | null>(null);
  const [bizName, setBizName] = useState("");
  const [stats, setStats] = useState({ products: 0, pending: 0, active: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      try {
        const token = await getToken();
        if (!token) { setLoaded(true); return; }

        // Fetch profile
        const profileRes = await fetch(`${API}/api/users/seller-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileRes.ok) {
          const { sellerProfile } = await profileRes.json();
          if (sellerProfile) {
            setStatus(sellerProfile.verification_status || "unverified");
            setBizName(sellerProfile.business_name || "");
          }
        }

        // Fetch product counts (only if verified seller)
        try {
          const prodRes = await fetch(`${API}/api/products?seller_id=me&limit=1`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (prodRes.ok) {
            const d = await prodRes.json();
            setStats(prev => ({ ...prev, products: d.total || 0 }));
          }
        } catch { /* ignore */ }
      } catch { /* ignore */ }
      setLoaded(true);
    })();
  }, [authLoading, getToken]);

  if (authLoading || !loaded) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4]" /></div>;
  }

  // Unverified / pending / rejected — show status card
  if (status !== "verified") {
    const cfg: Record<string, { icon: React.ReactNode; bg: string; title: string; desc: string }> = {
      unverified: { icon: <Store className="w-10 h-10 text-[#9CA3AF]" />, bg: "bg-[#F3F4F6] border-[#E8EEF4]", title: "Complete Your Onboarding", desc: "Please complete the onboarding to start selling." },
      pending: { icon: <Clock className="w-10 h-10 text-[#F59E0B]" />, bg: "bg-[#FFFBEB] border-[#FDE68A]", title: "Your Profile is Under Review", desc: "Our team is reviewing your profile. You'll get access to list products once verified. This typically takes 1-2 business days." },
      rejected: { icon: <CheckCircle2 className="w-10 h-10 text-[#EF4444]" />, bg: "bg-[#FEF2F2] border-[#FECACA]", title: "Verification Unsuccessful", desc: "Please contact sell@anga9.com for assistance." },
    };
    const c = cfg[status || "unverified"];
    return (
      <div className="max-w-lg mx-auto mt-12">
        <div className={`rounded-2xl border-2 p-8 text-center ${c.bg}`}>
          <div className="flex justify-center mb-4">{c.icon}</div>
          <h1 className="text-xl md:text-2xl font-bold text-[#1A1A2E] mb-2">{c.title}</h1>
          {bizName && status === "pending" && <p className="text-sm md:text-base font-medium text-[#1A6FD4] mb-1">{bizName}</p>}
          <p className="text-sm md:text-base text-[#4B5563] leading-relaxed mb-6">{c.desc}</p>
          {status === "unverified" && <Link href="/seller/onboarding" className="inline-flex h-10 px-5 bg-[#1A6FD4] text-white text-sm md:text-base font-semibold rounded-lg items-center hover:bg-[#155bb5] transition-colors">Continue Onboarding</Link>}
          {status === "pending" && (
            <div className="mt-4 pt-4 border-t border-[#FDE68A] flex justify-center gap-6">
              {[{ l: "Submitted", d: true }, { l: "Under Review", d: false }, { l: "Verified", d: false }].map(s => (
                <div key={s.l} className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${s.d ? "bg-[#22C55E] text-white" : "bg-white text-[#9CA3AF] border"}`}>{s.d ? "✓" : "…"}</div>
                  <span className={`text-xs md:text-sm ${s.d ? "text-[#1A1A2E]" : "text-[#9CA3AF]"}`}>{s.l}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Verified seller — show full dashboard
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#1A1A2E]">Welcome{bizName ? `, ${bizName}` : ""}!</h1>
          <p className="text-sm md:text-base text-[#9CA3AF]">Here&apos;s an overview of your store</p>
        </div>
        <Link
          href="/seller/dashboard/products/new"
          className="flex items-center gap-2 h-10 px-5 bg-[#6C47FF] text-white text-sm md:text-base font-semibold rounded-lg hover:bg-[#5A3AE0] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<IndianRupee className="w-5 h-5 text-[#22C55E]" />} label="Total Revenue" value="₹0" color="bg-[#F0FDF4]" />
        <StatCard icon={<ShoppingCart className="w-5 h-5 text-[#1A6FD4]" />} label="Total Orders" value={0} color="bg-[#EAF2FF]" />
        <StatCard icon={<Package className="w-5 h-5 text-[#6C47FF]" />} label="Products" value={stats.products} color="bg-[#F3EEFF]" />
        <StatCard icon={<Eye className="w-5 h-5 text-[#F59E0B]" />} label="Store Views" value={0} color="bg-[#FFFBEB]" />
      </div>

      <div className="bg-white rounded-xl border border-[#E8EEF4] p-6">
        <h2 className="text-base md:text-lg font-bold text-[#1A1A2E] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/seller/dashboard/products/new" className="flex items-center gap-3 p-4 rounded-lg border border-[#E8EEF4] hover:border-[#1A6FD4]/30 transition-colors">
            <Package className="w-5 h-5 text-[#6C47FF]" />
            <div><p className="text-sm md:text-base font-semibold text-[#1A1A2E]">Add Product</p><p className="text-xs md:text-sm text-[#9CA3AF]">List a new product for sale</p></div>
          </Link>
          <Link href="/seller/dashboard/products" className="flex items-center gap-3 p-4 rounded-lg border border-[#E8EEF4] hover:border-[#1A6FD4]/30 transition-colors">
            <Eye className="w-5 h-5 text-[#1A6FD4]" />
            <div><p className="text-sm md:text-base font-semibold text-[#1A1A2E]">View Products</p><p className="text-xs md:text-sm text-[#9CA3AF]">Manage your listings</p></div>
          </Link>
          <Link href="/seller/dashboard/profile" className="flex items-center gap-3 p-4 rounded-lg border border-[#E8EEF4] hover:border-[#1A6FD4]/30 transition-colors">
            <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
            <div><p className="text-sm md:text-base font-semibold text-[#1A1A2E]">Edit Profile</p><p className="text-xs md:text-sm text-[#9CA3AF]">Update your business info</p></div>
          </Link>
        </div>
      </div>
    </div>
  );
}
