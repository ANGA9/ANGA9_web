"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, UploadCloud, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import toast from "react-hot-toast";

/**
 * The API client throws a plain Error whose message is already the server's
 * `error` field, so there is no axios-style err.response.data to unwrap.
 */
function apiMessage(err: unknown, fallback: string): string {
  return (err instanceof Error && err.message) || fallback;
}

interface KycData {
  business_name: string;
  business_type: string;
  pan_number: string;
  gstin: string;
  address_line1: string;
  city: string;
  state: string;
  pincode: string;
  shop_photo_path: string;
  gst_certificate_path: string;
}

export default function KycView() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"unverified" | "pending" | "verified" | "rejected" | "none">("none");
  const [notes, setNotes] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // True when the customer predates KYC and still has details to fill in.
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const [formData, setFormData] = useState<KycData>({
    business_name: "",
    business_type: "proprietorship",
    pan_number: "",
    gstin: "",
    address_line1: "",
    city: "",
    state: "",
    pincode: "",
    shop_photo_path: "",
    gst_certificate_path: "",
  });

  useEffect(() => {
    fetchKycStatus();
  }, []);

  const fetchKycStatus = async () => {
    try {
      setLoading(true);
      // api.get resolves to the parsed JSON body directly — there is no
      // axios-style `.data` wrapper. Reading res.data yielded undefined and
      // left the form permanently blank.
      const res = await api.get<Partial<KycData> & { verification_status?: string }>(
        "/api/users/kyc",
      );
      if (res) {
        setStatus((res.verification_status as typeof status) || "unverified");
        setNotes((res as any).rejection_reason || null);
        setNeedsProfileCompletion((res as any).needs_profile_completion === true);
        setFormData({
          business_name: res.business_name || "",
          business_type: res.business_type || "proprietorship",
          pan_number: res.pan_number || "",
          gstin: res.gstin || "",
          address_line1: res.address_line1 || "",
          city: res.city || "",
          state: res.state || "",
          pincode: res.pincode || "",
          shop_photo_path: res.shop_photo_path || "",
          gst_certificate_path: res.gst_certificate_path || "",
        });
      } else {
        setStatus("unverified");
      }
    } catch (err: any) {
      // The API client throws a plain Error, so there is no err.response.
      // A brand-new customer now gets a default payload rather than a 404.
      console.error("Failed to fetch KYC", err);
      setStatus("unverified");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof KycData) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setUploadingField(fieldName);
    try {
      // Reject oversized files up front — the bucket caps at 5 MB and a
      // rejected PUT surfaces as an opaque storage failure.
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File is too large. Maximum size is 5MB.");
        return;
      }

      // 1. Get signed upload URL from backend
      const res = await api.post<{ uploadUrl: string; path: string }>(
        "/api/users/kyc/documents",
        {
          fileName: file.name,
          contentType: file.type || "application/octet-stream"
        },
      );
      const { uploadUrl, path } = res;

      // 2. PUT file directly to the signed URL
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file
      });

      if (!putRes.ok) throw new Error("Failed to upload to storage");

      // Build the next state explicitly and persist THAT. Reading `formData`
      // here would capture the value from render time and silently discard
      // any edits made while the upload was in flight.
      const next = { ...formData, [fieldName]: path };
      setFormData(next);
      await saveDraft(next);
      toast.success("Document uploaded successfully");
    } catch (err: any) {
      toast.error(apiMessage(err, "Failed to upload document"));
    } finally {
      setUploadingField(null);
      // Allow re-selecting the same file after a failed attempt.
      e.target.value = "";
    }
  };

  // Shared draft writer. Callers pass the exact snapshot to persist so this
  // never depends on state that may have moved on.
  const saveDraft = async (snapshot: KycData) => {
    setSaving(true);
    try {
      await api.patch("/api/users/kyc", snapshot);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await saveDraft(formData);
    } catch (err: any) {
      // Validation errors (bad GSTIN checksum, bad PAN) surface here on blur.
      toast.error(apiMessage(err, "Failed to save draft"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.business_name || !formData.pan_number || !formData.gstin || !formData.shop_photo_path) {
      toast.error("Please fill all required fields and upload required documents");
      return;
    }
    
    setSubmitting(true);
    try {
      await api.patch("/api/users/kyc", formData); // ensure latest data is saved
      await api.post("/api/users/kyc/submit", {});
      toast.success("KYC submitted successfully");
      fetchKycStatus();
    } catch (err: any) {
      toast.error(apiMessage(err, "Failed to submit KYC"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 bg-white rounded-xl border border-gray-200">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4]" />
      </div>
    );
  }

  // Grandfathered customers are 'verified' but have never filled anything in.
  // Showing them the "Approved" screen would hide the form forever, leaving
  // them permanently at 0% with no way to register real business details.
  if ((status === "pending" || status === "verified") && !needsProfileCompletion) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-2xl mx-auto mt-8 shadow-sm">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${status === 'verified' ? 'bg-green-50' : 'bg-amber-50'}`}>
          {status === 'verified' ? (
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          ) : (
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          )}
        </div>
        <h2 className="text-[24px] font-black text-gray-900 tracking-tight mb-3">
          {status === "verified" ? "KYC Approved" : "KYC Under Review"}
        </h2>
        <p className="text-[15px] text-gray-500 mb-8 max-w-md mx-auto">
          {status === "verified" 
            ? "Your business account is fully verified. You can now access wholesale pricing and bulk ordering."
            : "Your documents are currently being reviewed by our team. This usually takes 1-2 business days. We will notify you once approved."}
        </p>
      </div>
    );
  }

  const inputCls = "h-12 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 text-[14px] placeholder:text-gray-400 focus:border-[#1A6FD4] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/10 transition-all";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-5 h-5 text-[#1A6FD4]" />
          </div>
          <div>
            <h2 className="text-[18px] font-black text-gray-900 tracking-tight">Business KYC Verification</h2>
            <p className="text-[13px] font-medium text-gray-500 mt-0.5">Required for wholesale access</p>
          </div>
        </div>
      </div>

      {needsProfileCompletion && (
        <div className="mx-6 mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#1A6FD4] mt-0.5 shrink-0" />
          <div>
            <h4 className="text-[14px] font-bold text-blue-900">
              Your ordering access is active
            </h4>
            <p className="text-[13px] text-blue-800 mt-1">
              As an existing customer you can keep ordering as normal. Please complete your
              business details below when convenient — your access will not be interrupted
              while we review them.
            </p>
          </div>
        </div>
      )}

      {status === "rejected" && (
        <div className="mx-6 mt-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-[14px] font-bold text-red-900">KYC Rejected</h4>
            <p className="text-[13px] text-red-700 mt-1">{notes || "Please review your details and submit again."}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[12px] font-bold uppercase tracking-wider text-gray-500 block">Business Name *</label>
            <input type="text" required placeholder="e.g. Acme Corporation" className={inputCls} value={formData.business_name} onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))} onBlur={handleSaveDraft} />
          </div>
          
          <div className="space-y-2">
            <label className="text-[12px] font-bold uppercase tracking-wider text-gray-500 block">Business Type</label>
            <select className={inputCls} value={formData.business_type} onChange={(e) => { setFormData(prev => ({ ...prev, business_type: e.target.value })); handleSaveDraft(); }}>
              <option value="proprietorship">Proprietorship</option>
              <option value="partnership">Partnership</option>
              <option value="pvt_ltd">Private Limited</option>
              <option value="llp">LLP</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-bold uppercase tracking-wider text-gray-500 block">PAN Number *</label>
            <input type="text" required placeholder="ABCDE1234F" className={inputCls} value={formData.pan_number} onChange={(e) => setFormData(prev => ({ ...prev, pan_number: e.target.value.toUpperCase() }))} onBlur={handleSaveDraft} />
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-bold uppercase tracking-wider text-gray-500 block">GSTIN *</label>
            <input type="text" required placeholder="22AAAAA0000A1Z5" className={inputCls} value={formData.gstin} onChange={(e) => setFormData(prev => ({ ...prev, gstin: e.target.value.toUpperCase() }))} onBlur={handleSaveDraft} />
          </div>
          
          <div className="space-y-2 md:col-span-2 mt-4 pt-4 border-t border-gray-100">
            <h4 className="font-bold text-gray-900 mb-2">Business Address</h4>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[12px] font-bold uppercase tracking-wider text-gray-500 block">Address Line 1 *</label>
            <input type="text" required className={inputCls} value={formData.address_line1} onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))} onBlur={handleSaveDraft} />
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-bold uppercase tracking-wider text-gray-500 block">City *</label>
            <input type="text" required className={inputCls} value={formData.city} onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))} onBlur={handleSaveDraft} />
          </div>
          
          <div className="space-y-2">
            <label className="text-[12px] font-bold uppercase tracking-wider text-gray-500 block">State *</label>
            <input type="text" required className={inputCls} value={formData.state} onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))} onBlur={handleSaveDraft} />
          </div>
          
          <div className="space-y-2">
            <label className="text-[12px] font-bold uppercase tracking-wider text-gray-500 block">Pincode *</label>
            <input type="text" required className={inputCls} value={formData.pincode} onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))} onBlur={handleSaveDraft} />
          </div>
          
          <div className="space-y-2 md:col-span-2 mt-4 pt-4 border-t border-gray-100">
            <h4 className="font-bold text-gray-900 mb-2">Documents</h4>
          </div>

          <div className="space-y-2 md:col-span-1">
            <label className="text-[12px] font-bold uppercase tracking-wider text-gray-500 block">Shop Front Photo *</label>
            <DocumentUploader 
              path={formData.shop_photo_path} 
              isUploading={uploadingField === 'shop_photo_path'} 
              onChange={(e) => handleFileUpload(e, 'shop_photo_path')} 
              label="Upload Shop Photo"
            />
          </div>
          
          <div className="space-y-2 md:col-span-1">
            <label className="text-[12px] font-bold uppercase tracking-wider text-gray-500 block">GST Certificate</label>
            <DocumentUploader 
              path={formData.gst_certificate_path} 
              isUploading={uploadingField === 'gst_certificate_path'} 
              onChange={(e) => handleFileUpload(e, 'gst_certificate_path')} 
              label="Upload GST Cert (Optional)"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
          <div className="text-[13px] text-gray-500">
            {saving ? <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Saving draft...</span> : "Draft saved automatically"}
          </div>
          <button
            type="submit"
            disabled={submitting || !formData.shop_photo_path || !!uploadingField}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-[15px] font-bold text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50 active:scale-95"
            style={{ background: "linear-gradient(135deg, #1A6FD4, #1557AB)" }}
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
            Submit for Verification
          </button>
        </div>
      </form>
    </div>
  );
}

function DocumentUploader({ path, isUploading, onChange, label }: { path: string, isUploading: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, label: string }) {
  return (
    <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${path ? 'border-green-300 bg-green-50/30' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
      {path ? (
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-[13px] font-bold text-gray-900 mb-3">Document Uploaded</p>
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-[12px] font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all">
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            Replace
            <input type="file" className="hidden" accept="image/*,.pdf" onChange={onChange} disabled={isUploading} />
          </label>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2">
            <FileText className="w-5 h-5 text-[#1A6FD4]" />
          </div>
          <p className="text-[13px] font-bold text-gray-900 mb-1">{label}</p>
          <p className="text-[11px] text-gray-500 mb-3">JPEG, PNG, or PDF up to 5MB</p>
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-[#1A6FD4] text-[12px] font-bold text-[#1A6FD4] hover:bg-blue-50 active:scale-95 transition-all">
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            Browse
            <input type="file" className="hidden" accept="image/*,.pdf" onChange={onChange} disabled={isUploading} />
          </label>
        </div>
      )}
    </div>
  );
}
