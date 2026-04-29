"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, Save, Bell, Mail, Package, CreditCard, ShieldCheck, Truck } from "lucide-react";

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
  { key: "product_approved", label: "Product Approved", desc: "Get notified when your product is approved for listing", icon: ShieldCheck },
  { key: "product_rejected", label: "Product Rejected", desc: "Get notified if a product submission is rejected", icon: ShieldCheck },
  { key: "payout_processed", label: "Payout Processed", desc: "Get notified when a payout is sent to your bank account", icon: CreditCard },
  { key: "shipping_updates", label: "Shipping Updates", desc: "Get notified about shipping and delivery status changes", icon: Truck },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${checked ? "bg-[#1A6FD4]" : "bg-[#D1D5DB]"}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
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

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-6 h-6 animate-spin text-[#1A6FD4]" /></div>;

  return (
    <div className="max-w-[620px]">
      <div className="flex items-center gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#1A1A2E] mb-1">Settings</h1>
          <p className="text-sm md:text-base text-[#9CA3AF]">Manage your notification preferences</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E8EEF4] p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Mail className="w-5 h-5 text-[#1A6FD4]" />
          <h2 className="text-base font-bold text-[#1A1A2E]">Email Notifications</h2>
        </div>
        <p className="text-sm text-[#9CA3AF] mb-5">Choose which email notifications you&apos;d like to receive.</p>

        <div className="space-y-0 divide-y divide-[#E8EEF4]">
          {NOTIF_ITEMS.map(({ key, label, desc, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-9 h-9 rounded-lg bg-[#F0F7FF] flex items-center justify-center shrink-0">
                  <Icon className="w-4.5 h-4.5 text-[#1A6FD4]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1A1A2E]">{label}</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{desc}</p>
                </div>
              </div>
              <Toggle checked={prefs[key]} onChange={() => toggle(key)} />
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 h-11 px-6 bg-[#1A6FD4] text-white text-sm md:text-base font-semibold rounded-lg hover:bg-[#155bb5] transition-colors disabled:opacity-60">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Preferences
      </button>
      {saved && <p className="text-sm md:text-base text-[#22C55E] font-medium mt-3">Preferences saved successfully</p>}
    </div>
  );
}
