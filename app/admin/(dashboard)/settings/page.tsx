"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface ConfigState {
  commission_rates: { standard: number; premium: number; enterprise: number };
  shipping_fee: number;
  free_shipping_threshold: number;
  tax_rate: number;
  payout_hold_days: number;
}

const DEFAULT_CONFIG: ConfigState = {
  commission_rates: { standard: 0.10, premium: 0.08, enterprise: 0.05 },
  shipping_fee: 500,
  free_shipping_threshold: 10000,
  tax_rate: 0.18,
  payout_hold_days: 7,
};

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<ConfigState>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<Record<string, unknown>>("/api/admin/config", { silent: true });
        if (res) {
          const cr = res.commission_rates as ConfigState["commission_rates"] | undefined;
          setConfig({
            commission_rates: cr || DEFAULT_CONFIG.commission_rates,
            shipping_fee: Number(res.shipping_fee) || DEFAULT_CONFIG.shipping_fee,
            free_shipping_threshold: Number(res.free_shipping_threshold) || DEFAULT_CONFIG.free_shipping_threshold,
            tax_rate: Number(res.tax_rate) || DEFAULT_CONFIG.tax_rate,
            payout_hold_days: Number(res.payout_hold_days) || DEFAULT_CONFIG.payout_hold_days,
          });
        }
      } catch { /* use defaults */ }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/api/admin/config", {
        commission_rates: config.commission_rates,
        shipping_fee: config.shipping_fee,
        free_shipping_threshold: config.free_shipping_threshold,
        tax_rate: config.tax_rate,
        payout_hold_days: config.payout_hold_days,
      });
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const inputClass = "h-11 w-full rounded-lg border border-[#E8EEF4] bg-white px-4 text-sm placeholder:text-[#9CA3AF] focus:border-[#1A6FD4] focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/10";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-[#1A6FD4]" />
          <h1 className="text-xl font-bold text-[#1A1A2E]">Platform Settings</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "#1A6FD4" }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* Commission Rates */}
      <div className="rounded-xl border border-[#E8EEF4] bg-white p-6">
        <h2 className="text-base font-semibold text-[#1A1A2E] mb-4">Commission Rates</h2>
        <p className="text-sm text-[#4B5563] mb-4">Platform commission deducted from seller earnings per order.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#4B5563] mb-1.5">Standard (%)</label>
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={Math.round(config.commission_rates.standard * 100)}
              onChange={(e) => setConfig((c) => ({
                ...c,
                commission_rates: { ...c.commission_rates, standard: Number(e.target.value) / 100 },
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4B5563] mb-1.5">Premium (%)</label>
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={Math.round(config.commission_rates.premium * 100)}
              onChange={(e) => setConfig((c) => ({
                ...c,
                commission_rates: { ...c.commission_rates, premium: Number(e.target.value) / 100 },
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4B5563] mb-1.5">Enterprise (%)</label>
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={Math.round(config.commission_rates.enterprise * 100)}
              onChange={(e) => setConfig((c) => ({
                ...c,
                commission_rates: { ...c.commission_rates, enterprise: Number(e.target.value) / 100 },
              }))}
            />
          </div>
        </div>
      </div>

      {/* Shipping */}
      <div className="rounded-xl border border-[#E8EEF4] bg-white p-6">
        <h2 className="text-base font-semibold text-[#1A1A2E] mb-4">Shipping</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#4B5563] mb-1.5">Flat Shipping Fee (INR)</label>
            <input
              type="number"
              className={inputClass}
              value={config.shipping_fee}
              onChange={(e) => setConfig((c) => ({ ...c, shipping_fee: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4B5563] mb-1.5">Free Shipping Threshold (INR)</label>
            <input
              type="number"
              className={inputClass}
              value={config.free_shipping_threshold}
              onChange={(e) => setConfig((c) => ({ ...c, free_shipping_threshold: Number(e.target.value) }))}
            />
          </div>
        </div>
      </div>

      {/* Tax & Payouts */}
      <div className="rounded-xl border border-[#E8EEF4] bg-white p-6">
        <h2 className="text-base font-semibold text-[#1A1A2E] mb-4">Tax & Payouts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#4B5563] mb-1.5">GST Rate (%)</label>
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={Math.round(config.tax_rate * 100)}
              onChange={(e) => setConfig((c) => ({ ...c, tax_rate: Number(e.target.value) / 100 }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4B5563] mb-1.5">Payout Hold Period (days)</label>
            <input
              type="number"
              className={inputClass}
              value={config.payout_hold_days}
              onChange={(e) => setConfig((c) => ({ ...c, payout_hold_days: Number(e.target.value) }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
