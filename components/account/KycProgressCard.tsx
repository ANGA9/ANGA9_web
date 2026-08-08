"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert, ShieldCheck, Clock, FileText, ChevronRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface KycStatusData {
  verification_status: "unverified" | "pending" | "verified" | "rejected";
  progress_percent?: number;
  can_order?: boolean;
  submitted_at?: string;
  rejection_reason?: string;
  /** True for pre-KYC customers who can order but still owe us their details. */
  needs_profile_completion?: boolean;
}

export default function KycProgressCard() {
  const [kycData, setKycData] = useState<KycStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKyc() {
      try {
        // api.get resolves to the parsed body directly — there is no `.data`
        // wrapper. Reading res.data meant this card never showed real progress.
        const res = await api.get<KycStatusData>("/api/users/kyc");
        setKycData(res ?? { verification_status: "unverified", progress_percent: 0 });
      } catch (err: any) {
        // The client throws a plain Error (no err.response). Fall back to the
        // "not started" state so the card still renders a call to action.
        console.error("Failed to fetch KYC", err);
        setKycData({ verification_status: "unverified", progress_percent: 0 });
      } finally {
        setLoading(false);
      }
    }
    fetchKyc();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 p-6 bg-white flex justify-center items-center h-[120px]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const status = kycData?.verification_status || "unverified";
  const percent = kycData?.progress_percent || 0;

  // Grandfathered customers are 'verified' but have never filled in details.
  // Hiding the card on status alone would leave them with no prompt at all.
  const needsCompletion = kycData?.needs_profile_completion === true;

  if (status === "verified" && !needsCompletion) {
    return null; // Genuinely approved — nothing to prompt for.
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 text-[#1A6FD4] shadow-sm">
            {/* needsCompletion is checked first: a grandfathered customer has
                status 'verified', which would otherwise render no icon. */}
            {needsCompletion ? (
              <FileText className="w-6 h-6" />
            ) : (
              <>
                {status === "unverified" && <FileText className="w-6 h-6" />}
                {status === "pending" && <Clock className="w-6 h-6 text-amber-500" />}
                {status === "rejected" && <ShieldAlert className="w-6 h-6 text-red-500" />}
              </>
            )}
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-gray-900 flex items-center gap-2">
              Business KYC Verification
              {status === "pending" && (
                <span className="text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  Under Review
                </span>
              )}
              {status === "rejected" && (
                <span className="text-[11px] font-black uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  Action Required
                </span>
              )}
            </h3>
            <p className="text-[14px] text-gray-600 mt-1 max-w-xl">
              {needsCompletion
                ? "Your ordering access is active. Please add your business details when convenient — nothing will be interrupted while we review them."
                : status === "unverified" && "Complete your KYC verification to unlock wholesale buying, bulk discounts, and B2B features."}
              {status === "pending" && "Your documents are currently under review by our team. This usually takes 1-2 business days."}
              {status === "rejected" && `Your KYC was rejected. ${kycData?.rejection_reason ? `Reason: ${kycData.rejection_reason}` : "Please update your documents and try again."}`}
            </p>
          </div>
        </div>
        
        <div className="shrink-0 pt-2 sm:pt-0">
          {(status === "unverified" || status === "rejected" || needsCompletion) && (
            <Link 
              href="/account/kyc"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A6FD4] text-white text-[14px] font-bold shadow-md hover:bg-blue-700 active:scale-95 transition-all w-full sm:w-auto"
            >
              {status === "rejected" ? "Update KYC" : (percent > 0 ? "Continue KYC" : "Start KYC")}
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
          {status === "pending" && (
            <Link 
              href="/account/kyc"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-700 text-[14px] font-bold hover:bg-gray-50 active:scale-95 transition-all w-full sm:w-auto"
            >
              View Application
            </Link>
          )}
        </div>
      </div>
      
      {/* 0-100% Progress Bar */}
      {(status === "unverified" || needsCompletion) && (
        <div className="mt-4 bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Profile Completeness</span>
            <span className="text-[13px] font-black text-[#1A6FD4]">{percent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-[#1A6FD4] h-2 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
