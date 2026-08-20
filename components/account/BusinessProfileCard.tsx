"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, CheckCircle2, ChevronRight, Loader2, Sparkles, Receipt } from "lucide-react";
import { api } from "@/lib/api";

interface BusinessProfileData {
  verification_status?: "unverified" | "pending" | "verified" | "rejected";
  business_name?: string;
  gstin?: string;
  is_business_profile_active?: boolean;
}

interface BusinessProfileCardProps {
  onOpenBusinessTab?: () => void;
}

export default function BusinessProfileCard({ onOpenBusinessTab }: BusinessProfileCardProps) {
  const [data, setData] = useState<BusinessProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get<BusinessProfileData>("/api/users/kyc");
        setData(res ?? null);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return null;
  }

  const isBusinessActive = Boolean(data?.is_business_profile_active || (data?.gstin && data?.business_name));

  // If business profile with GST is already active
  if (isBusinessActive) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/90 to-teal-50/70 p-4 sm:p-5 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-gray-900">
                  {data?.business_name || "Business Profile Active"}
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 18% GST Invoicing Active
                </span>
              </div>
              <p className="text-[13px] text-gray-600 font-medium mt-0.5">
                GSTIN: <span className="font-mono font-bold text-gray-800">{data?.gstin}</span> • Eligible for 18% GST Input Tax Credit
              </p>
            </div>
          </div>

          <div className="shrink-0 pt-1 sm:pt-0">
            {onOpenBusinessTab ? (
              <button
                onClick={onOpenBusinessTab}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-[13px] font-bold shadow-sm hover:bg-emerald-50 active:scale-95 transition-all w-full sm:w-auto justify-center"
              >
                Manage GST Profile <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Link
                href="/account/business"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-[13px] font-bold shadow-sm hover:bg-emerald-50 active:scale-95 transition-all w-full sm:w-auto justify-center"
              >
                Manage GST Profile <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Flipkart-style lightweight prompt banner to claim 18% GST Input Tax Credit
  return (
    <div className="rounded-2xl border border-blue-100 bg-[#F8FBFF] p-4 sm:p-5 mb-6 shadow-sm relative overflow-hidden group">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#1A6FD4] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-bold text-gray-900">
                Claim 18% GST Input Tax Credit
              </h3>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-[#1A6FD4] px-2 py-0.5 rounded-md">
                18% ITC
              </span>
            </div>
            <p className="text-[13px] text-gray-600 font-medium mt-0.5 max-w-xl">
              Buying for your business? Add your GSTIN to receive B2B tax invoices & claim GST input credit.
            </p>
          </div>
        </div>

        <div className="shrink-0 pt-1 sm:pt-0">
          {onOpenBusinessTab ? (
            <button
              onClick={onOpenBusinessTab}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1A6FD4] text-white text-[13px] font-bold shadow-md hover:bg-[#1559B3] active:scale-95 transition-all w-full sm:w-auto whitespace-nowrap"
            >
              Add GSTIN / Claim 18% <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <Link
              href="/account/business"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1A6FD4] text-white text-[13px] font-bold shadow-md hover:bg-[#1559B3] active:scale-95 transition-all w-full sm:w-auto whitespace-nowrap"
            >
              Add GSTIN / Claim 18% <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
