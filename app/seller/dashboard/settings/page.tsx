"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, Save, Bell, Mail, Package, CreditCard, ShieldCheck, Truck, CheckCircle2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface NotifPref {
  order_received: boolean;
  payment_received: boolean;
  product_approved: boolean;
  product_rejected: boolean;
  payout_processed: boolean;
  shipping_updates: boolean;
}

const DEFAULTS: NotifPref = {
  order_received: true,
  payment_received: true,
  product_approved: true,
  product_rejected: true,
  payout_processed: true,
  shipping_updates: true,
};

const NOTIF_ITEMS: { key: keyof NotifPref; label: string; desc: string; icon: typeof Bell }[] = [
  { key: "order_received", label: "New Order Received", desc: "Get notified when a customer places an order", icon: Package },
  { key: "payment_received", label: "Payment Received", desc: "Get notified when a payment is confirmed", icon: CreditCard },
  { key: "shipping_updates", label: "Shipping Updates", desc: "Get notified about shipping and delivery status changes", icon: Truck },
  { key: "product_approved", label: "Product Approved", desc: "Get notified when your product is approved for listing", icon: ShieldCheck },
  { key: "product_rejected", label: "Product Rejected", desc: "Get notified if a product submission is rejected", icon: ShieldCheck },
  { key: "payout_processed", label: "Payout Processed", desc: "Get notified when a payout is sent to your bank account", icon: CreditCard },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-[#1A6FD4]/20 ${checked ? "bg-[#059669]" : "bg-gray-200 hover:bg-gray-300"}`}
    >
      <span className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

export default function SettingsPage() {
  const { loading: authLoading, getToken } = useAuth();
  const [prefs, setPrefs] = useState<NotifPref>(DEFAULTS);
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
        if (p?.notification_preferences) {
          setPrefs({ ...DEFAULTS, ...p.notification_preferences });
        }
      }
      setLoading(false);
    })();
  }, [authLoading, getToken]);

  function toggle(key: keyof NotifPref) {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    const token = await getToken();
    if (token) {
      await fetch(`${API}/api/users/seller-profile`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ notification_preferences: prefs }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
      <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4] mb-4" />
      <span className="text-[15px] font-medium">Loading preferences...</span>
    </div>
  );

  return (
    <main className="w-full mx-auto max-w-5xl px-3 sm:px-4 py-6 md:px-8 md:py-10 bg-white md:bg-transparent min-h-[calc(100vh-64px)] text-[#1A1A2E]">
      
      {/* ── Desktop Header ── */}
      <div className="hidden md:flex items-center justify-between mb-8">
        <div className="flex items-baseline gap-3">
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">
            Settings
          </h1>
          <span className="text-[18px] font-bold text-gray-400">
            Manage your preferences
          </span>
        </div>
      </div>

      {/* ── Mobile Header ── */}
      <div className="md:hidden flex flex-col gap-2 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-[14px] text-gray-500 font-medium">Manage your preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 md:gap-10">
        <div className="flex-1 max-w-3xl">
          
          <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#1A6FD4]" />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-gray-900 leading-tight">Email Notifications</h2>
                <p className="text-[14px] text-gray-500 font-medium">Choose which alerts to receive in your inbox.</p>
              </div>
            </div>

            <div className="space-y-2">
              {NOTIF_ITEMS.map(({ key, label, desc, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors group cursor-pointer" onClick={() => toggle(key)}>
                  <div className="flex items-start gap-4">
                    <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${prefs[key] ? "bg-green-50 text-[#059669]" : "bg-gray-100 text-gray-400"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-[15px] font-bold ${prefs[key] ? "text-gray-900" : "text-gray-500"}`}>{label}</p>
                      <p className="text-[13px] text-gray-500 font-medium mt-0.5">{desc}</p>
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Toggle checked={prefs[key]} onChange={() => toggle(key)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Mobile Save Button ── */}
          <div className="md:hidden pb-10 pt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1A6FD4] px-8 py-4 text-[16px] font-bold text-white transition-all shadow-md hover:shadow-lg hover:bg-[#155bb5] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? "Saving..." : "Save Preferences"}
            </button>
            {saved && <p className="text-center text-[14px] text-green-600 font-bold mt-4">Preferences saved successfully!</p>}
          </div>
        </div>

        {/* ── Desktop Save Panel (Sticky) ── */}
        <div className="hidden md:block w-[300px] shrink-0">
          <div className="sticky top-[104px] flex flex-col gap-4">
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-[16px] font-bold text-gray-900 mb-2">Save Preferences</h3>
              <p className="text-[13px] text-gray-500 font-medium mb-6 leading-relaxed">
                We'll only send you the emails you select above to help you manage your store efficiently.
              </p>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1A6FD4] px-6 py-3.5 text-[15px] font-bold text-white transition-all shadow-md hover:shadow-lg hover:bg-[#155bb5] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? "Saving..." : "Save Preferences"}
              </button>
              {saved && (
                <div className="mt-4 rounded-xl bg-green-50 border border-green-200 p-3 flex items-center justify-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[13px] font-bold">Saved successfully!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
