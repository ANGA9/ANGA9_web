"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, Save, CheckCircle2, Clock, XCircle, Store, MapPin, Building2, UserCircle } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const VERIFICATION_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  verified: { icon: CheckCircle2, color: "#059669", bg: "bg-green-50 border-green-200 text-green-700", label: "Verified" },
  pending: { icon: Clock, color: "#D97706", bg: "bg-yellow-50 border-yellow-200 text-yellow-700", label: "Pending Review" },
  rejected: { icon: XCircle, color: "#DC2626", bg: "bg-red-50 border-red-200 text-red-700", label: "Rejected" },
  unverified: { icon: Clock, color: "#6B7280", bg: "bg-gray-100 border-gray-200 text-gray-700", label: "Unverified" },
};

function maskValue(val: string) {
  if (!val || val.length < 4) return val || "—";
  return val.slice(0, 2) + "****" + val.slice(-2);
}

export default function ProfilePage() {
  const { loading: authLoading, getToken } = useAuth();
  const [form, setForm] = useState({
    store_name: "", business_name: "", business_type: "", business_category: "",
    store_description: "", address_line1: "", city: "", state: "", pincode: "",
    bank_account_name: "", bank_account_number: "", bank_ifsc: "", bank_name: "", bank_branch: "",
  });
  const [verificationStatus, setVerificationStatus] = useState("unverified");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      const token = await getToken();
      if (!token) { setLoading(false); return; }
      const res = await fetch(`${API}/api/users/seller-profile`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const { sellerProfile: p } = await res.json();
        if (p) {
          setForm({
            store_name: p.store_name || "", business_name: p.business_name || "",
            business_type: p.business_type || "", business_category: p.business_category || "",
            store_description: p.store_description || "",
            address_line1: p.address_line1 || "", city: p.city || "", state: p.state || "", pincode: p.pincode || "",
            bank_account_name: p.bank_account_name || "", bank_account_number: p.bank_account_number || "",
            bank_ifsc: p.bank_ifsc || "", bank_name: p.bank_name || "", bank_branch: p.bank_branch || "",
          });
          setVerificationStatus(p.verification_status || "unverified");
          setGstin(p.gstin || "");
          setPan(p.pan_number || "");
        }
      }
      setLoading(false);
    })();
  }, [authLoading, getToken]);

  async function handleSave() {
    setSaving(true);
    const token = await getToken();
    if (token) {
      await fetch(`${API}/api/users/seller-profile`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4] mb-4" />
        <span className="text-[15px] font-medium">Loading profile...</span>
      </div>
    );
  }

  const vCfg = VERIFICATION_CONFIG[verificationStatus] || VERIFICATION_CONFIG.unverified;
  const VIcon = vCfg.icon;
  const descLen = form.store_description.length;

  const labelCls = "block text-[14px] font-bold text-gray-700 mb-1.5";
  const inputCls = "w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-[15px] font-medium text-gray-900 outline-none focus:bg-white focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all shadow-sm placeholder:text-gray-400";
  const readOnlyCls = "w-full rounded-2xl border border-gray-100 bg-gray-100 px-4 py-3 text-[15px] font-medium text-gray-500 cursor-not-allowed";

  return (
    <main className="w-full mx-auto max-w-5xl px-3 sm:px-4 py-6 md:px-8 md:py-10 bg-white md:bg-transparent min-h-[calc(100vh-64px)] text-[#1A1A2E]">
      
      {/* ── Desktop Header ── */}
      <div className="hidden md:flex items-center justify-between mb-8">
        <div className="flex items-baseline gap-3">
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">
            Business Profile
          </h1>
          <span className="text-[18px] font-bold text-gray-400">
            Manage your legal entity details
          </span>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[14px] font-bold shadow-sm ${vCfg.bg}`}>
          <VIcon className="w-4 h-4" />
          <span>{vCfg.label}</span>
        </div>
      </div>

      {/* ── Mobile Header ── */}
      <div className="md:hidden flex flex-col gap-3 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Business Profile</h1>
        </div>
        <p className="text-[14px] text-gray-500 font-medium">Update your business information</p>
        <div className={`inline-flex self-start items-center gap-2 px-3 py-1.5 rounded-full border text-[13px] font-bold ${vCfg.bg}`}>
          <VIcon className="w-4 h-4" />
          <span>{vCfg.label}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 md:gap-10">
        <div className="flex-1 max-w-3xl space-y-6 md:space-y-8">
          
          {/* ── Business Details ── */}
          <section className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm">
            <h2 className="text-[18px] font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Store className="w-5 h-5 text-[#1A6FD4]" /> Store Identity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className={labelCls}>Store Name</label>
                <input className={inputCls} value={form.store_name} onChange={e => setForm(p => ({ ...p, store_name: e.target.value }))} placeholder="Public store name" />
              </div>
              <div>
                <label className={labelCls}>Business Legal Name</label>
                <input className={inputCls} value={form.business_name} onChange={e => setForm(p => ({ ...p, business_name: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className={labelCls}>Business Entity Type</label>
                <input className={inputCls} value={form.business_type} onChange={e => setForm(p => ({ ...p, business_type: e.target.value }))} placeholder="e.g. LLC, Sole Proprietor" />
              </div>
              <div>
                <label className={labelCls}>Primary Category</label>
                <input className={inputCls} value={form.business_category} onChange={e => setForm(p => ({ ...p, business_category: e.target.value }))} placeholder="e.g. Electronics, Fashion" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls + " mb-0"}>Store Description</label>
                <span className={`text-[13px] font-medium ${descLen > 900 ? "text-yellow-600" : "text-gray-400"}`}>{descLen}/1000</span>
              </div>
              <textarea
                className={inputCls + " h-28 py-3 resize-y"}
                value={form.store_description}
                onChange={e => setForm(p => ({ ...p, store_description: e.target.value.slice(0, 1000) }))}
                maxLength={1000}
                placeholder="Describe your store..."
              />
            </div>
            
            {/* KYC Readonly */}
            {(gstin || pan) && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-[15px] font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <UserCircle className="w-4 h-4 text-gray-400" /> Identity Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {gstin && (
                    <div>
                      <label className={labelCls}>GSTIN Number</label>
                      <input className={readOnlyCls} value={maskValue(gstin)} readOnly />
                    </div>
                  )}
                  {pan && (
                    <div>
                      <label className={labelCls}>PAN Number</label>
                      <input className={readOnlyCls} value={maskValue(pan)} readOnly />
                    </div>
                  )}
                </div>
                <p className="text-[13px] text-gray-500 mt-3 font-medium">To update your KYC documents, please contact seller support.</p>
              </div>
            )}
          </section>

          {/* ── Address ── */}
          <section className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm">
            <h2 className="text-[18px] font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#1A6FD4]" /> Registered Address
            </h2>
            <div className="mb-5">
              <label className={labelCls}>Address Line 1</label>
              <input className={inputCls} value={form.address_line1} onChange={e => setForm(p => ({ ...p, address_line1: e.target.value }))} placeholder="Street address, building..." />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div><label className={labelCls}>City</label><input className={inputCls} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} /></div>
              <div><label className={labelCls}>State</label><input className={inputCls} value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} /></div>
              <div><label className={labelCls}>Pincode</label><input className={inputCls} value={form.pincode} onChange={e => setForm(p => ({ ...p, pincode: e.target.value }))} /></div>
            </div>
          </section>

          {/* ── Bank Account ── */}
          <section className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm">
            <h2 className="text-[18px] font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#1A6FD4]" /> Bank Account
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className={labelCls}>Account Holder Name</label>
                <input className={inputCls} value={form.bank_account_name} onChange={e => setForm(p => ({ ...p, bank_account_name: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Account Number</label>
                <input className={inputCls} type="password" value={form.bank_account_number} onChange={e => setForm(p => ({ ...p, bank_account_number: e.target.value }))} placeholder="••••••••••••" />
              </div>
            </div>
            <div className="mb-5">
              <label className={labelCls}>IFSC Code</label>
              <input className={inputCls} value={form.bank_ifsc} onChange={e => setForm(p => ({ ...p, bank_ifsc: e.target.value.toUpperCase() }))} placeholder="e.g. HDFC0000123" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5 border-t border-gray-100">
              <div><label className={labelCls}>Bank Name</label><input className={readOnlyCls} value={form.bank_name || "Fetched from IFSC"} readOnly /></div>
              <div><label className={labelCls}>Branch</label><input className={readOnlyCls} value={form.bank_branch || "Fetched from IFSC"} readOnly /></div>
            </div>
          </section>

          {/* ── Mobile Save Button ── */}
          <div className="md:hidden pb-10 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1A6FD4] px-8 py-4 text-[16px] font-bold text-white transition-all shadow-md hover:shadow-lg hover:bg-[#155bb5] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? "Saving..." : "Save changes"}
            </button>
            {saved && <p className="text-center text-[14px] text-green-600 font-bold mt-4">Profile saved successfully!</p>}
          </div>
        </div>

        {/* ── Desktop Save Panel (Sticky) ── */}
        <div className="hidden md:block w-[300px] shrink-0">
          <div className="sticky top-[104px] flex flex-col gap-4">
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-[16px] font-bold text-gray-900 mb-2">Save Profile</h3>
              <p className="text-[13px] text-gray-500 font-medium mb-6 leading-relaxed">
                Ensure your business and banking details match your KYC documents to avoid payout delays.
              </p>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1A6FD4] px-6 py-3.5 text-[15px] font-bold text-white transition-all shadow-md hover:shadow-lg hover:bg-[#155bb5] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? "Saving..." : "Save changes"}
              </button>
              {saved && (
                <div className="mt-4 rounded-xl bg-green-50 border border-green-200 p-3 flex items-center justify-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[13px] font-bold">Saved successfully!</span>
                </div>
              )}
            </div>
            
            {verificationStatus !== "verified" && (
              <div className="bg-[#FFFBEB] rounded-3xl border border-[#FDE68A] p-6 text-yellow-800">
                <h3 className="text-[14px] font-bold mb-1">Verification Required</h3>
                <p className="text-[13px] font-medium leading-relaxed">
                  Your account is not fully verified. Some features like payouts may be restricted until KYC is completed.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
