"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { Clock, CheckCircle2, ShieldCheck, Store, LogOut, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export default function SellerDashboardPage() {
  const { user, loading: authLoading, getToken, logout } = useAuth();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      try {
        const token = await getToken();
        if (!token) { setLoaded(true); return; }
        const res = await fetch(`${API}/api/users/seller-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { setLoaded(true); return; }
        const { sellerProfile } = await res.json();
        if (sellerProfile) {
          setStatus(sellerProfile.verification_status || "unverified");
          setBusinessName(sellerProfile.business_name || "");
        }
      } catch { /* ignore */ }
      setLoaded(true);
    })();
  }, [authLoading, getToken]);

  if (authLoading || !loaded) {
    return (
      <div className="min-h-screen bg-[#F8FBFF] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4]" />
      </div>
    );
  }

  const statusConfig = {
    unverified: {
      icon: <Store className="w-12 h-12 text-[#9CA3AF]" />,
      color: "bg-[#F3F4F6] border-[#E8EEF4]",
      title: "Complete Your Onboarding",
      desc: "Please complete the onboarding process to start selling.",
      action: <Link href="/seller/onboarding" className="h-11 px-6 bg-[#1A6FD4] text-white font-semibold rounded-lg flex items-center gap-2 hover:bg-[#155bb5] transition-colors">Continue Onboarding</Link>,
    },
    pending: {
      icon: <Clock className="w-12 h-12 text-[#F59E0B]" />,
      color: "bg-[#FFFBEB] border-[#FDE68A]",
      title: "Your Profile is Submitted for Review",
      desc: "Our admin team is reviewing your seller profile. Once verified, you will get full access to list your products and manage orders. This typically takes 1-2 business days.",
      action: null,
    },
    verified: {
      icon: <CheckCircle2 className="w-12 h-12 text-[#22C55E]" />,
      color: "bg-[#F0FDF4] border-[#BBF7D0]",
      title: "Welcome to Your Dashboard!",
      desc: "Your seller profile is verified. You can now list products and manage your store.",
      action: null,
    },
    rejected: {
      icon: <ShieldCheck className="w-12 h-12 text-[#EF4444]" />,
      color: "bg-[#FEF2F2] border-[#FECACA]",
      title: "Verification Unsuccessful",
      desc: "Your profile verification was not approved. Please contact support at sell@anga9.com for assistance.",
      action: <a href="mailto:sell@anga9.com" className="h-11 px-6 bg-[#EF4444] text-white font-semibold rounded-lg flex items-center gap-2 hover:bg-[#DC2626] transition-colors">Contact Support</a>,
    },
  };

  const cfg = statusConfig[status || "unverified"];

  return (
    <div className="min-h-screen bg-[#F8FBFF]" style={{ fontFamily: "var(--font-gilroy)" }}>
      {/* Header */}
      <header className="bg-white border-b border-[#E8EEF4]">
        <div className="mx-auto max-w-[1200px] flex items-center justify-between h-14 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Image src="/anga9-logo.png" alt="ANGA9" width={100} height={34} priority style={{ objectFit: "contain" }} />
            </Link>
            <span className="text-[12px] font-bold text-[#1A6FD4] bg-[#EAF2FF] px-2 py-0.5 rounded">Seller</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-[#4B5563]">{user?.email}</span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#9CA3AF] hover:text-[#EF4444] transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-[680px] px-4 py-12 sm:py-20">
        <div className={`rounded-2xl border-2 p-8 sm:p-12 text-center ${cfg.color}`}>
          <div className="flex justify-center mb-6">
            {cfg.icon}
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-bold text-[#1A1A2E] mb-3">
            {cfg.title}
          </h1>
          {businessName && status === "pending" && (
            <p className="text-[15px] font-medium text-[#1A6FD4] mb-2">
              {businessName}
            </p>
          )}
          <p className="text-[15px] text-[#4B5563] leading-relaxed max-w-md mx-auto mb-8">
            {cfg.desc}
          </p>
          {cfg.action && (
            <div className="flex justify-center">
              {cfg.action}
            </div>
          )}

          {status === "pending" && (
            <div className="mt-8 pt-6 border-t border-[#FDE68A]">
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { label: "Submitted", icon: "✓", done: true },
                  { label: "Under Review", icon: "⏳", done: false },
                  { label: "Verified", icon: "🛡️", done: false },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center gap-1.5">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      s.done ? "bg-[#22C55E] text-white" : "bg-white text-[#9CA3AF] border border-[#E8EEF4]"
                    }`}>
                      {s.icon}
                    </div>
                    <span className={`text-[12px] font-medium ${s.done ? "text-[#1A1A2E]" : "text-[#9CA3AF]"}`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/seller/sell-on-anga9"
            className="text-[13px] font-medium text-[#1A6FD4] hover:underline"
          >
            ← Back to Sell on ANGA9
          </Link>
        </div>
      </div>
    </div>
  );
}
