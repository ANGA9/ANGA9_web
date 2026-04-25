"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, Save } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const labelCls = "block text-sm md:text-base font-medium text-[#4B5563] mb-1.5";
const inputCls = "h-11 w-full rounded-lg border border-[#E8EEF4] bg-white px-4 text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] focus:border-[#1A6FD4] focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/10 transition-colors";

export default function ProfilePage() {
  const { loading: authLoading, getToken } = useAuth();
  const [form, setForm] = useState({ business_name: "", business_type: "", business_category: "", store_description: "", address_line1: "", city: "", state: "", pincode: "" });
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
          business_name: p.business_name || "", business_type: p.business_type || "",
          business_category: p.business_category || "", store_description: p.store_description || "",
          address_line1: p.address_line1 || "", city: p.city || "", state: p.state || "", pincode: p.pincode || "",
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
      <h1 className="text-xl md:text-2xl font-bold text-[#1A1A2E] mb-1">Business Profile</h1>
      <p className="text-sm md:text-base text-[#9CA3AF] mb-6">Update your business information</p>
      <div className="bg-white rounded-xl border border-[#E8EEF4] p-6 space-y-5">
        <div><label className={labelCls}>Business Name</label><input className={inputCls} value={form.business_name} onChange={e => setForm(p => ({ ...p, business_name: e.target.value }))} /></div>
        <div><label className={labelCls}>Business Type</label><input className={inputCls} value={form.business_type} onChange={e => setForm(p => ({ ...p, business_type: e.target.value }))} /></div>
        <div><label className={labelCls}>Category</label><input className={inputCls} value={form.business_category} onChange={e => setForm(p => ({ ...p, business_category: e.target.value }))} /></div>
        <div><label className={labelCls}>Description</label><textarea className={inputCls + " h-24 py-3 resize-none"} value={form.store_description} onChange={e => setForm(p => ({ ...p, store_description: e.target.value }))} /></div>
        <div><label className={labelCls}>Address</label><input className={inputCls} value={form.address_line1} onChange={e => setForm(p => ({ ...p, address_line1: e.target.value }))} /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className={labelCls}>City</label><input className={inputCls} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} /></div>
          <div><label className={labelCls}>State</label><input className={inputCls} value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} /></div>
          <div><label className={labelCls}>Pincode</label><input className={inputCls} value={form.pincode} onChange={e => setForm(p => ({ ...p, pincode: e.target.value }))} /></div>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 h-11 px-6 bg-[#1A6FD4] text-white text-sm md:text-base font-semibold rounded-lg hover:bg-[#155bb5] transition-colors disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
        </button>
        {saved && <p className="text-sm md:text-base text-[#22C55E] font-medium">✓ Profile saved successfully</p>}
      </div>
    </div>
  );
}
