"use client";

import { useState, useEffect } from "react";
import { loyaltyApi, type LoyaltyConfig, type LoyaltyTier } from "@/lib/loyaltyApi";
import { Crown, Loader2, Save, Users, Edit3, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";

const DEFAULT_CONFIG: LoyaltyConfig = {
  base_earn_rate: 0.01,
  tiers: [
    { name: "Silver", multiplier: 1.0, threshold: 0 },
    { name: "Gold", multiplier: 1.5, threshold: 10000 },
    { name: "Platinum", multiplier: 2.0, threshold: 50000 },
  ],
};

export default function AdminLoyaltyPage() {
  const [config, setConfig] = useState<LoyaltyConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loyaltyApi.getAdminConfig()
      .then(res => {
        if (res) setConfig(res);
      })
      .catch(() => toast.error("Failed to load loyalty config"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await loyaltyApi.updateAdminConfig(config);
      toast.success("Loyalty config saved successfully!");
    } catch {
      toast.error("Failed to save config");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTier = (index: number, key: keyof LoyaltyTier, value: any) => {
    const newTiers = [...config.tiers];
    newTiers[index] = { ...newTiers[index], [key]: value };
    setConfig({ ...config, tiers: newTiers });
  };

  const handleAddTier = () => {
    setConfig({
      ...config,
      tiers: [...config.tiers, { name: "New Tier", multiplier: 1.0, threshold: 1000 }],
    });
  };

  const handleRemoveTier = (index: number) => {
    const newTiers = [...config.tiers];
    newTiers.splice(index, 1);
    setConfig({ ...config, tiers: newTiers });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
      </div>
    );
  }

  const inputClass = "h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-[14px] font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all shadow-inner";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-4 h-4 text-purple-600" />
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Loyalty & Memberships</span>
          </div>
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Loyalty Config</h1>
          <p className="text-[15px] text-gray-500 font-medium">Manage earn rates and tier thresholds</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-purple-600 text-white text-[14px] font-bold hover:bg-purple-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Config
        </button>
      </div>

      {/* Global Config */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
        <h2 className="text-[18px] font-bold text-gray-900 mb-6">Global Rates</h2>
        <div className="max-w-md">
          <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Base Earn Rate (%)</label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={config.base_earn_rate * 100}
              onChange={(e) => setConfig({ ...config, base_earn_rate: Number(e.target.value) / 100 })}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</div>
          </div>
          <p className="text-[13px] text-gray-500 mt-2 font-medium">The default percentage of the order value converted to coins.</p>
        </div>
      </div>

      {/* Tiers */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[18px] font-bold text-gray-900">Loyalty Tiers</h2>
          <button onClick={handleAddTier} className="flex items-center gap-1.5 text-[14px] font-bold text-purple-600 hover:text-purple-700">
            <Plus className="w-4 h-4" /> Add Tier
          </button>
        </div>
        
        <div className="space-y-4">
          {config.tiers.map((tier, idx) => (
            <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tier Name</label>
                <input
                  type="text"
                  className={inputClass}
                  value={tier.name}
                  onChange={(e) => handleUpdateTier(idx, "name", e.target.value)}
                />
              </div>
              <div className="w-32">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Threshold (₹)</label>
                <input
                  type="number"
                  className={inputClass}
                  value={tier.threshold}
                  onChange={(e) => handleUpdateTier(idx, "threshold", Number(e.target.value))}
                />
              </div>
              <div className="w-32">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Multiplier</label>
                <input
                  type="number"
                  step="0.1"
                  className={inputClass}
                  value={tier.multiplier}
                  onChange={(e) => handleUpdateTier(idx, "multiplier", Number(e.target.value))}
                />
              </div>
              <button
                onClick={() => handleRemoveTier(idx)}
                className="mt-6 p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                title="Remove Tier"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
        <p className="text-[13px] text-gray-500 mt-4 font-medium">Tiers are determined by the user's rolling 365-day spend. The multiplier increases the base earn rate.</p>
      </div>

    </div>
  );
}
