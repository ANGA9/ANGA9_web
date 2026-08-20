"use client";

import { useState, useEffect } from "react";
import { 
  Building2, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  UploadCloud, 
  Info,
  MapPin,
  HelpCircle
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import toast from "react-hot-toast";

interface BusinessProfileForm {
  business_name: string;
  business_type: string;
  pan_number: string;
  gstin: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  gst_certificate_path?: string;
}

const BUSINESS_TYPES = [
  { value: "proprietorship", label: "Sole Proprietorship / Individual" },
  { value: "pvt_ltd", label: "Private Limited Company (Pvt Ltd)" },
  { value: "partnership", label: "Partnership Firm" },
  { value: "llp", label: "Limited Liability Partnership (LLP)" },
  { value: "other", label: "Other / Enterprise" },
];

export default function BusinessProfileView() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [gstCertUrl, setGstCertUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState<BusinessProfileForm>({
    business_name: "",
    business_type: "proprietorship",
    pan_number: "",
    gstin: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    gst_certificate_path: "",
  });

  const [gstError, setGstError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>("/api/users/kyc");
      if (res) {
        setFormData({
          business_name: res.business_name || "",
          business_type: res.business_type || "proprietorship",
          pan_number: res.pan_number || "",
          gstin: res.gstin || "",
          address_line1: res.address_line1 || "",
          address_line2: res.address_line2 || "",
          city: res.city || "",
          state: res.state || "",
          pincode: res.pincode || "",
          gst_certificate_path: res.gst_certificate_path || "",
        });
        if (res.gst_certificate_url) {
          setGstCertUrl(res.gst_certificate_url);
        }
      }
    } catch {
      // Default blank state is fine
    } finally {
      setLoading(false);
    }
  };

  const handleGstinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
    let autoPan = formData.pan_number;
    
    // Auto-extract PAN from characters 3-12 of 15-char GSTIN
    if (val.length >= 12) {
      autoPan = val.substring(2, 12);
    }

    if (val.length > 0 && val.length < 15) {
      setGstError("GSTIN must be exactly 15 characters");
    } else {
      setGstError(null);
    }

    setFormData((prev) => ({
      ...prev,
      gstin: val,
      pan_number: autoPan,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }

    try {
      setUploadingCert(true);
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("document_type", "gst_certificate");

      const res = await api.post<any>("/api/users/kyc/documents", uploadData);
      if (res?.path) {
        setFormData((prev) => ({ ...prev, gst_certificate_path: res.path }));
        toast.success("GST Certificate uploaded");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload document");
    } finally {
      setUploadingCert(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.business_name.trim()) {
      toast.error("Please enter your registered Business Name");
      return;
    }
    if (formData.gstin && formData.gstin.length !== 15) {
      toast.error("GSTIN must be exactly 15 characters");
      return;
    }

    try {
      setSaving(true);
      setSavedSuccess(false);

      await api.post("/api/users/kyc", {
        business_name: formData.business_name.trim(),
        business_type: formData.business_type,
        gstin: formData.gstin.trim(),
        pan_number: formData.pan_number.trim(),
        address_line1: formData.address_line1.trim(),
        address_line2: formData.address_line2?.trim() || "",
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        gst_certificate_path: formData.gst_certificate_path || "",
      });

      setSavedSuccess(true);
      toast.success("Business Profile saved! 18% GST Invoicing is active.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save business profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 p-12 bg-white flex flex-col justify-center items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4]" />
        <p className="text-[14px] text-gray-500 font-medium">Loading your business profile...</p>
      </div>
    );
  }

  const isConfigured = Boolean(formData.gstin && formData.business_name);

  return (
    <div className="space-y-6">
      {/* ── Value Proposition & Notice Banner ── */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-[#F0F7FF] to-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1A6FD4] text-white flex items-center justify-center shrink-0 shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-gray-900">
                Business Profile & GST Invoicing
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-[#1A6FD4] px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" /> Save up to 18%
              </span>
            </div>
            <p className="text-[14px] text-gray-600 font-medium mt-1 leading-relaxed">
              Buying for a registered shop, company, or business? Link your GSTIN below. All your business orders will receive automated B2B GST tax invoices, allowing you to claim <strong>up to 18% GST Input Tax Credit (ITC)</strong>.
            </p>
            
            <div className="mt-3 flex items-center gap-2 text-[12px] font-bold text-gray-500">
              <Info className="w-4 h-4 text-[#1A6FD4] shrink-0" />
              <span>Optional for business buyers. Regular customers can shop freely without adding GST details.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Status Indicator if already configured ── */}
      {isConfigured && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold text-emerald-950">
              GST Invoicing is Active for: {formData.business_name}
            </h3>
            <p className="text-[13px] text-emerald-800 font-medium mt-0.5">
              GSTIN: <span className="font-mono font-bold">{formData.gstin}</span> • Eligible for 18% Input Tax Credit on tax invoices.
            </p>
          </div>
        </div>
      )}

      {/* ── Form Card ── */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-5 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-[17px] font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1A6FD4]" />
            Business Identification
          </h3>
          <p className="text-[13px] text-gray-500 font-medium mt-0.5">
            Enter your official company / enterprise registration details.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Business / Legal Entity Name */}
          <div className="sm:col-span-2">
            <label className="block text-[14px] font-bold text-gray-700 mb-1.5">
              Registered Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              placeholder="e.g. Royal Apparels & Fabrics Private Limited"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] font-medium text-gray-900 outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Business Type */}
          <div>
            <label className="block text-[14px] font-bold text-gray-700 mb-1.5">
              Business Constitution
            </label>
            <select
              value={formData.business_type}
              onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] font-medium text-gray-900 outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all bg-white"
            >
              {BUSINESS_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* GSTIN */}
          <div>
            <label className="block text-[14px] font-bold text-gray-700 mb-1.5">
              GSTIN (15 Digits) <span className="text-gray-400 font-normal">(For 18% Tax Credit)</span>
            </label>
            <input
              type="text"
              value={formData.gstin}
              onChange={handleGstinChange}
              maxLength={15}
              placeholder="e.g. 27AAPFU0939F1ZV"
              className={`w-full rounded-xl border px-4 py-3 text-[14px] font-mono font-bold text-gray-900 outline-none transition-all placeholder:text-gray-400 ${
                gstError ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10"
              }`}
            />
            {gstError && (
              <p className="text-[12px] text-red-500 font-bold mt-1">{gstError}</p>
            )}
          </div>

          {/* PAN Number */}
          <div className="sm:col-span-2">
            <label className="block text-[14px] font-bold text-gray-700 mb-1.5">
              PAN Number (10 Characters)
            </label>
            <input
              type="text"
              value={formData.pan_number}
              onChange={(e) => setFormData({ ...formData, pan_number: e.target.value.toUpperCase().slice(0, 10) })}
              maxLength={10}
              placeholder="e.g. AAPFU0939F"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] font-mono font-bold text-gray-900 outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all placeholder:text-gray-400 max-w-sm"
            />
          </div>
        </div>

        {/* ── Registered Business Address ── */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-[17px] font-bold text-gray-900 flex items-center gap-2 mb-1">
            <MapPin className="w-5 h-5 text-[#1A6FD4]" />
            Registered Business Address
          </h3>
          <p className="text-[13px] text-gray-500 font-medium mb-4">
            This address will appear on your official tax invoices.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[14px] font-bold text-gray-700 mb-1">Address Line 1</label>
              <input
                type="text"
                value={formData.address_line1}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                placeholder="Building Name, Street, Commercial Complex"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] font-medium text-gray-900 outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-[14px] font-bold text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Mumbai"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] font-medium text-gray-900 outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-[14px] font-bold text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g. Maharashtra"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] font-medium text-gray-900 outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-[14px] font-bold text-gray-700 mb-1">Pincode</label>
              <input
                type="text"
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                placeholder="e.g. 400001"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] font-medium text-gray-900 outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* ── Optional Document Upload ── */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[14px] font-bold text-gray-700">
              GST Registration Certificate (Optional)
            </label>
            <span className="text-[12px] font-medium text-gray-400">PDF, JPG, PNG up to 5MB</span>
          </div>

          <div className="mt-2 border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-[#1A6FD4]/40 transition-colors bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1A6FD4] flex items-center justify-center shrink-0">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-800">
                  {formData.gst_certificate_path ? "Certificate Uploaded" : "Upload GST Certificate"}
                </p>
                <p className="text-[12px] text-gray-500 font-medium">
                  {formData.gst_certificate_path ? "Your document is saved on file" : "Recommended for fast GST verification"}
                </p>
              </div>
            </div>

            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-[13px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm active:scale-95 transition-all">
              {uploadingCert ? <Loader2 className="w-4 h-4 animate-spin text-[#1A6FD4]" /> : "Browse File"}
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                disabled={uploadingCert}
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        {/* ── Save Action Button ── */}
        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[13px] text-gray-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Information encrypted & used strictly for GST B2B invoice generation.</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#1A6FD4] text-white text-[15px] font-bold rounded-2xl shadow-md hover:bg-[#1559B3] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            {saving ? "Saving Profile..." : "Save Business Profile"}
          </button>
        </div>

        {savedSuccess && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center text-emerald-800 text-[14px] font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Business Profile saved successfully! Your 18% GST tax invoices will be generated for eligible orders.
          </div>
        )}
      </form>
    </div>
  );
}
