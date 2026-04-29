"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, Save, CheckCircle2, Clock, XCircle } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const labelCls = "block text-sm md:text-base font-medium text-[#4B5563] mb-1.5";
const inputCls = "h-11 w-full rounded-lg border border-[#E8EEF4] bg-white px-4 text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] focus:border-[#1A6FD4] focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/10 transition-colors";
const readOnlyCls = "h-11 w-full rounded-lg border border-[#E8EEF4] bg-[#F8FBFF] px-4 text-sm text-[#4B5563]";

const VERIFICATION_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  verified: { icon: CheckCircle2, color: "#22C55E", bg: "bg-[#F0FDF4] border-[#BBF7D0]", label: "Verified" },
  pending: { icon: Clock, color: "#F59E0B", bg: "bg-[#FFFBEB] border-[#FDE68A]", label: "Pending Review" },
  rejected: { icon: XCircle, color: "#EF4444", bg: "bg-[#FEF2F2] border-[#FECACA]", label: "Rejected" },
  unverified: { icon: Clock, color: "#9CA3AF", bg: "bg-[#F3F4F6] border-[#E8EEF4]", label: "Unverified" },
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

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-6 h-6 animate-spin text-[#1A6FD4]" /></div>;

  const vCfg = VERIFICATION_CONFIG[verificationStatus] || VERIFICATION_CONFIG.unverified;
  const VIcon = vCfg.icon;
  const descLen = form.store_description.length;

  return (
    <div className="max-w-[620px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#1A1A2E] mb-1">Business Profile</h1>
          <p className="text-sm md:text-base text-[#9CA3AF]">Update your business information</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold ${vCfg.bg}`}>
          <VIcon className="w-4 h-4" style={{ color: vCfg.color }} />
          <span style={{ color: vCfg.color }}>{vCfg.label}</span>
        </div>
      </div>

      {/* Business Details */}
      <div className="bg-white rounded-xl border border-[#E8EEF4] p-6 space-y-5 mb-6">
        <h2 className="text-base font-bold text-[#1A1A2E]">Business Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Store Name</label>
            <input className={inputCls} value={form.store_name} onChange={e => setForm(p => ({ ...p, store_name: e.target.value }))} placeholder="Public store name" />
          </div>
          <div>
            <label className={labelCls}>Business Name</label>
            <input className={inputCls} value={form.business_name} onChange={e => setForm(p => ({ ...p, business_name: e.target.value }))} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Business Type</label>
            <input className={inputCls} value={form.business_type} onChange={e => setForm(p => ({ ...p, business_type: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <input className={inputCls} value={form.business_category} onChange={e => setForm(p => ({ ...p, business_category: e.target.value }))} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm md:text-base font-medium text-[#4B5563]">Store Description</label>
            <span className={`text-xs ${descLen > 900 ? "text-[#F59E0B]" : "text-[#9CA3AF]"}`}>{descLen}/1000</span>
          </div>
          <textarea
            className={inputCls + " h-24 py-3 resize-none"}
            value={form.store_description}
            onChange={e => setForm(p => ({ ...p, store_description: e.target.value.slice(0, 1000) }))}
            maxLength={1000}
          />
        </div>

        {/* KYC — read-only */}
        {(gstin || pan) && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#E8EEF4]">
            {gstin && (
              <div>
                <label className={labelCls}>GSTIN</label>
                <input className={readOnlyCls} value={maskValue(gstin)} readOnly />
              </div>
            )}
            {pan && (
              <div>
                <label className={labelCls}>PAN</label>
                <input className={readOnlyCls} value={maskValue(pan)} readOnly />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Address */}
      <div className="bg-white rounded-xl border border-[#E8EEF4] p-6 space-y-5 mb-6">
        <h2 className="text-base font-bold text-[#1A1A2E]">Address</h2>
        <div>
          <label className={labelCls}>Address Line</label>
          <input className={inputCls} value={form.address_line1} onChange={e => setForm(p => ({ ...p, address_line1: e.target.value }))} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className={labelCls}>City</label><input className={inputCls} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} /></div>
          <div><label className={labelCls}>State</label><input className={inputCls} value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} /></div>
          <div><label className={labelCls}>Pincode</label><input className={inputCls} value={form.pincode} onChange={e => setForm(p => ({ ...p, pincode: e.target.value }))} /></div>
        </div>
      </div>

      {/* Bank Account */}
      <div className="bg-white rounded-xl border border-[#E8EEF4] p-6 space-y-5 mb-6">
        <h2 className="text-base font-bold text-[#1A1A2E]">Bank Account</h2>
        <div>
          <label className={labelCls}>Account Holder Name</label>
          <input className={inputCls} value={form.bank_account_name} onChange={e => setForm(p => ({ ...p, bank_account_name: e.target.value }))} />
        </div>
        <div>
          <label className={labelCls}>Account Number</label>
          <input className={inputCls} type="password" value={form.bank_account_number} onChange={e => setForm(p => ({ ...p, bank_account_number: e.target.value }))} />
        </div>
        <div>
          <label className={labelCls}>IFSC Code</label>
          <input className={inputCls} value={form.bank_ifsc} onChange={e => setForm(p => ({ ...p, bank_ifsc: e.target.value.toUpperCase() }))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>Bank Name</label><input className={readOnlyCls} value={form.bank_name} readOnly /></div>
          <div><label className={labelCls}>Branch</label><input className={readOnlyCls} value={form.bank_branch} readOnly /></div>
        </div>
      </div>

      {/* Save button */}
      <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 h-11 px-6 bg-[#1A6FD4] text-white text-sm md:text-base font-semibold rounded-lg hover:bg-[#155bb5] transition-colors disabled:opacity-60">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
      </button>
      {saved && <p className="text-sm md:text-base text-[#22C55E] font-medium mt-3">Profile saved successfully</p>}
    </div>
  );
}
