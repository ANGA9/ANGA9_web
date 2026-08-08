"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Loader2,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Store,
  MapPin,
  ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";

interface KycDetail {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  gstin: string;
  pan_number: string;
  verification_status: string;
  rejection_reason?: string;
  submitted_at: string;
  shopPhotoUrl?: string;
  gstCertUrl?: string;
  users: {
    email?: string;
    phone?: string;
  };
}

export default function KycDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [kyc, setKyc] = useState<KycDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await api.get<KycDetail>(`/api/users/admin/kyc/${userId}`);
        setKyc(res);
      } catch {
        toast.error("Failed to load KYC detail");
        router.push("/admin/kyc");
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [userId, router]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await api.patch(`/api/users/admin/kyc/${userId}/verify`, { status: "verified" });
      toast.success("KYC approved successfully");
      router.push("/admin/kyc");
    } catch {
      toast.error("Failed to approve KYC");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setActionLoading(true);
    try {
      await api.patch(`/api/users/admin/kyc/${userId}/verify`, { 
        status: "rejected", 
        reason: rejectReason.trim() 
      });
      toast.success("KYC rejected successfully");
      router.push("/admin/kyc");
    } catch {
      toast.error("Failed to reject KYC");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#8B5CF6]" />
      </div>
    );
  }

  if (!kyc) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-medium text-[14px]"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to queue
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center border border-purple-100 shadow-sm shrink-0">
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">
              {kyc.business_name}
            </h1>
            <p className="text-[15px] text-gray-500 font-medium">
              Submitted: {new Date(kyc.submitted_at).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
        
        {kyc.verification_status === "pending" && !rejectMode && (
          <div className="flex gap-3">
            <button
              onClick={() => setRejectMode(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-red-200 text-red-600 text-[14px] font-bold hover:bg-red-50 transition-all shadow-sm"
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[14px] font-bold transition-all shadow-sm disabled:opacity-50 bg-green-500 text-white hover:bg-green-600"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Approve B2B
            </button>
          </div>
        )}
      </div>

      {rejectMode && (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 mb-8">
          <h3 className="text-red-900 font-bold mb-2">Reject KYC Application</h3>
          <p className="text-red-700 text-sm mb-4">Provide a clear reason so the user can fix the issue and re-apply.</p>
          <textarea 
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full p-3 border border-red-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-red-400"
            rows={3}
            placeholder="e.g., GST certificate is blurry, Business name doesn't match..."
          />
          <div className="flex justify-end gap-3">
            <button 
              onClick={() => setRejectMode(false)}
              className="px-4 py-2 text-red-700 hover:bg-red-100 rounded-xl font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 flex items-center gap-2"
            >
              {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm Rejection
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-5 h-5 text-[#8B5CF6]" />
            <h3 className="text-[16px] font-bold text-gray-900">Business Details</h3>
          </div>
          <div className="space-y-4">
            <DetailRow label="Business Name" value={kyc.business_name} />
            <DetailRow label="Business Type" value={kyc.business_type} />
            <DetailRow label="GSTIN" value={kyc.gstin} font="font-mono" />
            <DetailRow label="PAN Number" value={kyc.pan_number} font="font-mono" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-[#8B5CF6]" />
            <h3 className="text-[16px] font-bold text-gray-900">Contact & Address</h3>
          </div>
          <div className="space-y-4">
            <DetailRow label="Email" value={kyc.users?.email} />
            <DetailRow label="Phone" value={kyc.users?.phone} />
            <DetailRow 
              label="Address" 
              value={[
                kyc.address_line1, 
                kyc.address_line2, 
                kyc.city, 
                kyc.state, 
                kyc.pincode, 
                kyc.country
              ].filter(Boolean).join(", ")} 
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-[16px] font-bold text-gray-900 mb-4">Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DocumentCard 
            title="Shop Front Photo" 
            url={kyc.shopPhotoUrl} 
            filename="shop_photo.jpg" 
          />
          <DocumentCard 
            title="GST Certificate" 
            url={kyc.gstCertUrl} 
            filename="gst_certificate.pdf" 
            optional 
          />
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, font = "" }: { label: string; value?: string; font?: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">{label}</div>
      <div className={`text-[14px] font-medium text-gray-900 ${font}`}>
        {value || "—"}
      </div>
    </div>
  );
}

function DocumentCard({ title, url, filename, optional }: { title: string; url?: string; filename: string, optional?: boolean }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between">
      <div>
        <div className="text-[14px] font-bold text-gray-900">
          {title} {optional && <span className="text-gray-400 font-normal">(Optional)</span>}
        </div>
        <div className="text-[12px] text-gray-500 mt-1">
          {url ? filename : "Not provided"}
        </div>
      </div>
      {url ? (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-bold"
        >
          View <ExternalLink className="w-4 h-4" />
        </a>
      ) : (
        <div className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium">
          Missing
        </div>
      )}
    </div>
  );
}
