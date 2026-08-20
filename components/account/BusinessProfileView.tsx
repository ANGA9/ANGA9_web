"use client";

import { useState, useEffect } from "react";
import { 
  Building2, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck, 
  UploadCloud, 
  Info,
  MapPin,
  Receipt,
  FileCheck2,
  Trash2
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
      // Default blank state
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
      setGstError("GSTIN must be 15 characters");
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
      <div className="rounded-3xl border border-gray-200 p-16 bg-white flex flex-col justify-center items-center gap-3 shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4]" />
        <p className="text-[14px] text-gray-500 font-medium">Loading your business profile...</p>
      </div>
    );
  }

  const isConfigured = Boolean(formData.gstin && formData.business_name);

  return (
    <form onSubmit={handleSave}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ── LEFT COLUMN (Main Form Sections - 8 cols) ── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Section 1: Business Details & GSTIN */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1A6FD4] flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-gray-900">
                  Business Entity Details
                </h2>
                <p className="text-[13px] text-gray-500 font-medium">
                  Official registration information for B2B GST invoices.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Registered Business Name */}
              <div className="sm:col-span-2">
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
                  Registered Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  placeholder="e.g. Acme Apparels & Textiles Pvt Ltd"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium text-gray-900 outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all placeholder:text-gray-400 bg-gray-50/40 focus:bg-white"
                />
              </div>

              {/* Business Constitution */}
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
                  Constitution of Business
                </label>
                <select
                  value={formData.business_type}
                  onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium text-gray-900 outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all bg-gray-50/40 focus:bg-white"
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[13px] font-bold text-gray-700">
                    GSTIN (15 Digits)
                  </label>
                  <span className="text-[11px] font-bold text-[#1A6FD4] bg-blue-50 px-2 py-0.5 rounded-md">
                    18% ITC
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={handleGstinChange}
                  maxLength={15}
                  placeholder="e.g. 27AAPFU0939F1ZV"
                  className={`w-full rounded-2xl border px-4 py-3 text-[14px] font-mono font-bold text-gray-900 outline-none transition-all placeholder:text-gray-400 bg-gray-50/40 focus:bg-white ${
                    gstError 
                      ? "border-red-300 focus:ring-red-100" 
                      : "border-gray-200 focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10"
                  }`}
                />
                {gstError && (
                  <p className="text-[12px] text-red-500 font-bold mt-1">{gstError}</p>
                )}
              </div>

              {/* PAN Number */}
              <div className="sm:col-span-2">
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
                  Permanent Account Number (PAN)
                </label>
                <input
                  type="text"
                  value={formData.pan_number}
                  onChange={(e) => setFormData({ ...formData, pan_number: e.target.value.toUpperCase().slice(0, 10) })}
                  maxLength={10}
                  placeholder="e.g. AAPFU0939F"
                  className="w-full sm:max-w-xs rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-mono font-bold text-gray-900 outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all placeholder:text-gray-400 bg-gray-50/40 focus:bg-white"
                />
                <p className="text-[12px] text-gray-400 font-medium mt-1">
                  Auto-populated from characters 3–12 of your GSTIN.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Registered Business Address */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1A6FD4] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-gray-900">
                  Registered Business Address
                </h2>
                <p className="text-[13px] text-gray-500 font-medium">
                  The principal place of business printed on your tax invoice.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
                  Address Line 1
                </label>
                <input
                  type="text"
                  value={formData.address_line1}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  placeholder="Unit / Shop No., Building, Commercial Complex"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium text-gray-900 outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all placeholder:text-gray-400 bg-gray-50/40 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Mumbai"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium text-gray-900 outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all placeholder:text-gray-400 bg-gray-50/40 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g. Maharashtra"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium text-gray-900 outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all placeholder:text-gray-400 bg-gray-50/40 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
                  Pincode
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                  placeholder="e.g. 400001"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium text-gray-900 outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all placeholder:text-gray-400 bg-gray-50/40 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Optional Document Upload */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[17px] font-bold text-gray-900">
                  GST Certificate (Optional)
                </h2>
                <p className="text-[13px] text-gray-500 font-medium">
                  Upload your GST registration certificate (PDF, JPG, PNG up to 5MB).
                </p>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 hover:border-[#1A6FD4]/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1A6FD4] flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-gray-800">
                    {formData.gst_certificate_path ? "Certificate on file" : "No document uploaded"}
                  </p>
                  <p className="text-[12px] text-gray-500 font-medium">
                    {formData.gst_certificate_path ? "Document stored securely" : "Optional verification document"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-[13px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm active:scale-95 transition-all">
                  {uploadingCert ? <Loader2 className="w-4 h-4 animate-spin text-[#1A6FD4]" /> : <UploadCloud className="w-4 h-4 text-[#1A6FD4]" />}
                  <span>{formData.gst_certificate_path ? "Replace File" : "Upload File"}</span>
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
          </div>

          {/* Mobile Save Button */}
          <div className="lg:hidden pb-8">
            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#1A6FD4] text-white text-[15px] font-bold rounded-2xl shadow-md hover:bg-[#1559B3] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              <span>Save Business Profile</span>
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN (Sticky Summary & Benefits Panel - 4 cols) ── */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-[90px]">
          
          {/* Status & Save Action Card */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                Status
              </span>
              {isConfigured ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active for B2B
                </span>
              ) : (
                <span className="text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                  Setup Incomplete
                </span>
              )}
            </div>

            <div>
              <h3 className="text-[18px] font-black text-gray-900 tracking-tight">
                {formData.business_name || "Your Business Profile"}
              </h3>
              <p className="text-[13px] text-gray-500 font-medium mt-1">
                {formData.gstin ? (
                  <>GSTIN: <span className="font-mono font-bold text-gray-800">{formData.gstin}</span></>
                ) : (
                  "Add your GSTIN to enable automatic 18% Input Tax Credit on your orders."
                )}
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full hidden lg:inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1A6FD4] text-white text-[15px] font-bold rounded-2xl shadow-md hover:bg-[#1559B3] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              <span>Save Business Profile</span>
            </button>

            {savedSuccess && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center text-emerald-800 text-[13px] font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Profile saved! GST Invoicing active.
              </div>
            )}
          </div>

          {/* Benefits Card */}
          <div className="bg-[#F8FBFF] rounded-3xl border border-blue-100 p-6 sm:p-7 shadow-sm space-y-4">
            <h4 className="text-[14px] font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#1A6FD4]" />
              GST Invoicing Benefits
            </h4>

            <ul className="space-y-3 text-[13px] text-gray-600 font-medium">
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-[#1A6FD4] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">
                  ✓
                </div>
                <span><strong>18% Input Tax Credit (ITC):</strong> Offset GST on purchases against your business tax liabilities.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-[#1A6FD4] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">
                  ✓
                </div>
                <span><strong>Automated B2B Invoices:</strong> Download compliance-ready GST invoices with your business name and GSTIN.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-[#1A6FD4] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">
                  ✓
                </div>
                <span><strong>Business Expense Claims:</strong> Seamless bookkeeping and tax deductions for commercial purchases.</span>
              </li>
            </ul>

            <div className="pt-3 border-t border-blue-200/60 flex items-center gap-2 text-[12px] text-gray-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Data used solely for generating official B2B invoices.</span>
            </div>
          </div>

        </div>

      </div>
    </form>
  );
}
