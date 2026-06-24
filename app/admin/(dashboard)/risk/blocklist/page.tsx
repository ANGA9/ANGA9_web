"use client";

import { useEffect, useState } from "react";
import { Ban, Loader2, Trash2, Plus, ArrowLeft, ShieldAlert } from "lucide-react";
import { riskApi, RiskBlocklistEntry } from "@/lib/riskApi";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminBlocklistPage() {
  const [entries, setEntries] = useState<RiskBlocklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formType, setFormType] = useState("phone");
  const [formValue, setFormValue] = useState("");
  const [formReason, setFormReason] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchBlocklist = async () => {
    setLoading(true);
    try {
      const data = await riskApi.getBlocklist();
      setEntries(data as any || []); // Handle raw array or wrapped
    } catch (err: any) {
      toast.error("Failed to load blocklist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocklist();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValue.trim() || !formReason.trim()) {
      toast.error("Value and Reason are required");
      return;
    }
    
    setAdding(true);
    try {
      await riskApi.addBlocklist({
        type: formType,
        value: formValue.trim(),
        reason: formReason.trim()
      });
      toast.success("Added to blocklist");
      setFormValue("");
      setFormReason("");
      setShowAddForm(false);
      fetchBlocklist();
    } catch (err: any) {
      toast.error(err.message || "Failed to add blocklist entry");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Remove this entry from the blocklist?")) return;
    try {
      await riskApi.removeBlocklist(id);
      toast.success("Removed from blocklist");
      setEntries(entries.filter(e => e.id !== id));
    } catch (err: any) {
      toast.error("Failed to remove entry");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* ── Header ── */}
      <div className="mb-6">
        <Link href="/admin/risk" className="inline-flex items-center gap-1 text-[13px] font-bold text-gray-500 hover:text-gray-900 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Risk Queue
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Ban className="w-4 h-4 text-red-500" />
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Trust & Safety</span>
            </div>
            <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Blocklist Manager</h1>
            <p className="text-[15px] text-gray-500 font-medium">Manage banned phones, emails, and devices</p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-[14px] font-bold transition-all shadow-sm hover:shadow-md bg-white border-2 border-red-600 text-red-600 hover:bg-red-50"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-2xl border border-red-100 p-6 mb-8 shadow-sm animate-in fade-in slide-in-from-top-2">
          <h2 className="text-[16px] font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            Add to Blocklist
          </h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              >
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="pincode">Pincode</option>
                <option value="payment_instrument">Payment Instrument</option>
                <option value="device">Device ID</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Value</label>
              <input
                type="text"
                placeholder="e.g. +919876543210"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Reason</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Reason for blocking..."
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  className="h-11 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={adding}
                  className="h-11 px-6 rounded-xl text-[14px] font-bold disabled:opacity-50 transition-all bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50"
                >
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8">
            <Ban className="w-16 h-16 text-gray-200 mb-4" />
            <h3 className="text-[16px] font-bold text-gray-900 mb-1">Blocklist is empty</h3>
            <p className="text-[14px] text-gray-500">No identities are currently banned.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Added On</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700 text-[11px] font-bold uppercase tracking-wider">
                        {entry.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-bold text-gray-900 font-mono">
                        {entry.value}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] text-gray-600">
                        {entry.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] text-gray-500">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRemove(entry.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove Block"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
