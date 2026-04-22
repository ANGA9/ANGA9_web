"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, Save } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const labelCls = "block text-[13px] font-medium text-[#4B5563] mb-1.5";
const inputCls = "h-11 w-full rounded-lg border border-[#E8EEF4] bg-white px-4 text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] focus:border-[#1A6FD4] focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/10 transition-colors";

export default function SettingsPage() {
  const { loading: authLoading, getToken } = useAuth();
  const [form, setForm] = useState({ bank_account_name: "", bank_account_number: "", bank_ifsc: "", bank_name: "", bank_branch: "" });
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
        if (p) setForm({
          bank_account_name: p.bank_account_name || "", bank_account_number: p.bank_account_number || "",
          bank_ifsc: p.bank_ifsc || "", bank_name: p.bank_name || "", bank_branch: p.bank_branch || "",
        });
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

  return (
    <div className="max-w-[580px]">
      <h1 className="text-[20px] font-bold text-[#1A1A2E] mb-1">Settings</h1>
      <p className="text-[13px] text-[#9CA3AF] mb-6">Manage your bank account and preferences</p>
      <div className="bg-white rounded-xl border border-[#E8EEF4] p-6 space-y-5">
        <h2 className="text-[15px] font-bold text-[#1A1A2E]">Bank Account</h2>
        <div><label className={labelCls}>Account Holder Name</label><input className={inputCls} value={form.bank_account_name} onChange={e => setForm(p => ({ ...p, bank_account_name: e.target.value }))} /></div>
        <div><label className={labelCls}>Account Number</label><input className={inputCls} type="password" value={form.bank_account_number} onChange={e => setForm(p => ({ ...p, bank_account_number: e.target.value }))} /></div>
        <div><label className={labelCls}>IFSC Code</label><input className={inputCls} value={form.bank_ifsc} onChange={e => setForm(p => ({ ...p, bank_ifsc: e.target.value.toUpperCase() }))} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>Bank Name</label><input className={inputCls + " bg-[#F8FBFF]"} value={form.bank_name} readOnly /></div>
          <div><label className={labelCls}>Branch</label><input className={inputCls + " bg-[#F8FBFF]"} value={form.bank_branch} readOnly /></div>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 h-11 px-6 bg-[#1A6FD4] text-white text-[14px] font-semibold rounded-lg hover:bg-[#155bb5] transition-colors disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
        </button>
        {saved && <p className="text-[13px] text-[#22C55E] font-medium">✓ Settings saved successfully</p>}
      </div>
    </div>
  );
}
