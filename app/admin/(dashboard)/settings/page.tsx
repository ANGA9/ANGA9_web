"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Loader2, Globe, ShieldCheck, Truck, Percent, ShieldAlert } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface ConfigState {
  commission_rates: { standard: number; premium: number; enterprise: number };
  shipping_fee: number;
  free_shipping_threshold: number;
  tax_rate: number;
  payout_hold_days: number;
  risk_cod_max_value_new_account: number;
  risk_pdc_claims_per_30d: number;
  risk_open_disputes_max: number;
  risk_returns_ratio_flag: number;
  risk_first_bonus_requires_otp: boolean;
  risk_rto_block_threshold: number;
}

const DEFAULT_CONFIG: ConfigState = {
  commission_rates: { standard: 0.10, premium: 0.08, enterprise: 0.05 },
  shipping_fee: 500,
  free_shipping_threshold: 10000,
  tax_rate: 0.18,
  payout_hold_days: 7,
  risk_cod_max_value_new_account: 1500,
  risk_pdc_claims_per_30d: 2,
  risk_open_disputes_max: 5,
  risk_returns_ratio_flag: 40,
  risk_first_bonus_requires_otp: true,
  risk_rto_block_threshold: 3,
};

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<ConfigState>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const configRes = await api.get<Record<string, unknown>>("/api/admin/config", { silent: true });
        
        if (configRes) {
          const cr = configRes.commission_rates as ConfigState["commission_rates"] | undefined;
          setConfig({
            commission_rates: cr || DEFAULT_CONFIG.commission_rates,
            shipping_fee: Number(configRes.shipping_fee) || DEFAULT_CONFIG.shipping_fee,
            free_shipping_threshold: Number(configRes.free_shipping_threshold) || DEFAULT_CONFIG.free_shipping_threshold,
            tax_rate: Number(configRes.tax_rate) || DEFAULT_CONFIG.tax_rate,
            payout_hold_days: Number(configRes.payout_hold_days) || DEFAULT_CONFIG.payout_hold_days,
            risk_cod_max_value_new_account: Number(configRes.risk_cod_max_value_new_account) || DEFAULT_CONFIG.risk_cod_max_value_new_account,
            risk_pdc_claims_per_30d: Number(configRes.risk_pdc_claims_per_30d) || DEFAULT_CONFIG.risk_pdc_claims_per_30d,
            risk_open_disputes_max: Number(configRes.risk_open_disputes_max) || DEFAULT_CONFIG.risk_open_disputes_max,
            risk_returns_ratio_flag: Number(configRes.risk_returns_ratio_flag) || DEFAULT_CONFIG.risk_returns_ratio_flag,
            risk_first_bonus_requires_otp: configRes.risk_first_bonus_requires_otp !== undefined ? Boolean(configRes.risk_first_bonus_requires_otp) : DEFAULT_CONFIG.risk_first_bonus_requires_otp,
            risk_rto_block_threshold: Number(configRes.risk_rto_block_threshold) || DEFAULT_CONFIG.risk_rto_block_threshold,
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
        risk_cod_max_value_new_account: config.risk_cod_max_value_new_account,
        risk_pdc_claims_per_30d: config.risk_pdc_claims_per_30d,
        risk_open_disputes_max: config.risk_open_disputes_max,
        risk_returns_ratio_flag: config.risk_returns_ratio_flag,
        risk_first_bonus_requires_otp: config.risk_first_bonus_requires_otp,
        risk_rto_block_threshold: config.risk_rto_block_threshold,
      });
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    }
    setSaving(false);
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#8B5CF6]" />
      </div>
    );
  }

  const inputClass = "h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-[14px] font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all shadow-inner";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-4 h-4 text-[#8B5CF6]" />
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Global Configuration</span>
          </div>
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Platform Settings</h1>
          <p className="text-[15px] text-gray-500 font-medium">Fine-tune the ANGA9 marketplace parameters</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-[14px] font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-50 bg-white border-2 border-[#8B5CF6] text-[#8B5CF6] hover:bg-gray-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Commission Rates */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-[#8B5CF6]/5 group-hover:scale-125 transition-transform duration-700" />
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Percent className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-gray-900 leading-tight">Commission Structure</h2>
              <p className="text-[13px] font-medium text-gray-500">Platform fees deducted per transaction</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div>
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Standard Rate (%)</label>
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
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Premium Rate (%)</label>
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
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Enterprise Rate (%)</label>
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
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-white border-2 border-[#1A6FD4] text-[#1A6FD4]/5 group-hover:scale-125 transition-transform duration-700" />
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Truck className="w-5 h-5 text-[#1A6FD4]" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-gray-900 leading-tight">Logistics & Shipping</h2>
              <p className="text-[13px] font-medium text-gray-500">Delivery fees and free shipping rules</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div>
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Flat Shipping Fee (INR)</label>
              <input
                type="number"
                className={inputClass}
                value={config.shipping_fee}
                onChange={(e) => setConfig((c) => ({ ...c, shipping_fee: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Free Shipping Threshold (INR)</label>
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
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-green-50 group-hover:scale-125 transition-transform duration-700" />
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-gray-900 leading-tight">Taxation & Compliance</h2>
              <p className="text-[13px] font-medium text-gray-500">GST rates and financial settlement windows</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div>
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">GST Rate (%)</label>
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={Math.round(config.tax_rate * 100)}
                onChange={(e) => setConfig((c) => ({ ...c, tax_rate: Number(e.target.value) / 100 }))}
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Payout Hold Period (Days)</label>
              <input
                type="number"
                className={inputClass}
                value={config.payout_hold_days}
                onChange={(e) => setConfig((c) => ({ ...c, payout_hold_days: Number(e.target.value) }))}
              />
            </div>
          </div>
        </div>

        {/* Risk & Safety Thresholds */}
        <div className="bg-white rounded-3xl border border-red-100 p-8 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-red-50 group-hover:scale-125 transition-transform duration-700" />
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-gray-900 leading-tight">Trust & Safety Thresholds</h2>
              <p className="text-[13px] font-medium text-gray-500">Global limits for fraud prevention and risk management</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div>
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">New Account Max COD (INR)</label>
              <input
                type="number"
                className={inputClass}
                value={config.risk_cod_max_value_new_account}
                onChange={(e) => setConfig((c) => ({ ...c, risk_cod_max_value_new_account: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Max RTO Before Block</label>
              <input
                type="number"
                className={inputClass}
                value={config.risk_rto_block_threshold}
                onChange={(e) => setConfig((c) => ({ ...c, risk_rto_block_threshold: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">PDC Claims Per 30 Days</label>
              <input
                type="number"
                className={inputClass}
                value={config.risk_pdc_claims_per_30d}
                onChange={(e) => setConfig((c) => ({ ...c, risk_pdc_claims_per_30d: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Max Open Disputes</label>
              <input
                type="number"
                className={inputClass}
                value={config.risk_open_disputes_max}
                onChange={(e) => setConfig((c) => ({ ...c, risk_open_disputes_max: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Returns Ratio Flag (%)</label>
              <input
                type="number"
                className={inputClass}
                value={config.risk_returns_ratio_flag}
                onChange={(e) => setConfig((c) => ({ ...c, risk_returns_ratio_flag: Number(e.target.value) }))}
              />
            </div>
            <div className="flex items-center gap-3 mt-8">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={config.risk_first_bonus_requires_otp}
                  onChange={(e) => setConfig((c) => ({ ...c, risk_first_bonus_requires_otp: e.target.checked }))}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
              <span className="text-[13px] font-bold text-gray-700">Require OTP for First Order Bonus</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
