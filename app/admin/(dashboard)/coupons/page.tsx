"use client";

import { useState, useEffect, useCallback } from "react";
import { Ticket, Plus, Loader2, Search, Trash2, Power, PowerOff, X } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

// ── Types ──────────────────────────────────────────────────────────

interface Coupon {
  id: string;
  code: string;
  discount_type: "percent" | "flat";
  discount_value: number;
  max_discount: number | null;
  min_order: number | null;
  usage_limit: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface ListResp {
  coupons: Coupon[];
  total: number;
  page: number;
  limit: number;
}

// ── Helpers ────────────────────────────────────────────────────────

const CODE_REGEX = /^[A-Z0-9]{6}$/;

function formatINR(n: number | null | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function formatExpiry(iso: string | null): string {
  if (!iso) return "No expiry";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function isExpired(iso: string | null): boolean {
  return !!iso && new Date(iso).getTime() < Date.now();
}

// ── Page ───────────────────────────────────────────────────────────

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "true" | "false">("all");
  const [showCreate, setShowCreate] = useState(false);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeFilter !== "all") params.set("active", activeFilter);
      if (search.trim()) params.set("search", search.trim());
      const resp = await api.get<ListResp>(`/api/admin/coupons?${params.toString()}`);
      setCoupons(resp?.coupons ?? []);
    } catch {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, search]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      await api.patch(`/api/admin/coupons/${coupon.id}`, { active: !coupon.active });
      toast.success(coupon.active ? "Coupon deactivated" : "Coupon activated");
      setCoupons((cs) => cs.map((c) => (c.id === coupon.id ? { ...c, active: !c.active } : c)));
    } catch {
      toast.error("Failed to update coupon");
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!confirm(`Delete coupon ${coupon.code}? It will be deactivated; existing orders that used it are unaffected.`)) return;
    try {
      await api.delete(`/api/admin/coupons/${coupon.id}`);
      toast.success("Coupon deleted");
      setCoupons((cs) => cs.filter((c) => c.id !== coupon.id));
    } catch {
      toast.error("Failed to delete coupon");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center">
            <Ticket className="w-5 h-5 text-[#8B5CF6]" />
          </div>
          <div>
            <h1 className="text-[22px] font-black text-gray-900 leading-tight">Coupons</h1>
            <p className="text-[13px] font-medium text-gray-500">Create and manage discount codes</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#8B5CF6] text-white text-[13px] font-bold hover:bg-[#7C3AED] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Coupon
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value.toUpperCase())}
            placeholder="Search by code"
            className="w-full pl-10 pr-3 py-2.5 text-[13px] font-medium bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] uppercase tracking-wider"
            maxLength={6}
          />
        </div>
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value as "all" | "true" | "false")}
          className="px-3 py-2.5 text-[13px] font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6]"
        >
          <option value="all">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16 px-6">
            <Ticket className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-[14px] font-bold text-gray-900">No coupons yet</p>
            <p className="text-[12px] font-medium text-gray-500 mt-1">Click &quot;New Coupon&quot; to create your first one.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="bg-gray-50 text-gray-500 font-bold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-5 py-3">Code</th>
                    <th className="text-left px-5 py-3">Discount</th>
                    <th className="text-left px-5 py-3">Min Order</th>
                    <th className="text-left px-5 py-3">Usage</th>
                    <th className="text-left px-5 py-3">Expires</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-right px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {coupons.map((c) => {
                    const expired = isExpired(c.expires_at);
                    return (
                      <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-black text-gray-900 tracking-wider">{c.code}</td>
                        <td className="px-5 py-3.5 font-bold text-gray-900">
                          {c.discount_type === "percent" ? `${c.discount_value}%` : formatINR(c.discount_value)}
                          {c.discount_type === "percent" && c.max_discount != null && (
                            <span className="text-gray-500 font-medium"> (max {formatINR(c.max_discount)})</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-gray-700">{c.min_order ? formatINR(c.min_order) : "—"}</td>
                        <td className="px-5 py-3.5 font-medium text-gray-700">
                          {c.used_count}
                          {c.usage_limit != null && <span className="text-gray-400"> / {c.usage_limit}</span>}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-gray-700">
                          {formatExpiry(c.expires_at)}
                          {expired && <span className="ml-2 text-[11px] font-bold text-red-600 uppercase">Expired</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          {c.active ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase">Active</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold uppercase">Inactive</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleToggleActive(c)}
                              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                              title={c.active ? "Deactivate" : "Activate"}
                            >
                              {c.active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDelete(c)}
                              className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {coupons.map((c) => {
                const expired = isExpired(c.expires_at);
                return (
                  <div key={c.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-gray-900 tracking-wider text-[15px]">{c.code}</span>
                          {c.active ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">Active</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold uppercase">Inactive</span>
                          )}
                          {expired && <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-bold uppercase">Expired</span>}
                        </div>
                        <p className="text-[14px] font-bold text-gray-900 mt-1.5">
                          {c.discount_type === "percent" ? `${c.discount_value}% off` : `${formatINR(c.discount_value)} off`}
                          {c.discount_type === "percent" && c.max_discount != null && (
                            <span className="text-gray-500 font-medium text-[12px]"> · max {formatINR(c.max_discount)}</span>
                          )}
                        </p>
                        <p className="text-[12px] font-medium text-gray-500 mt-0.5">
                          {c.min_order ? `Min ${formatINR(c.min_order)} · ` : ""}
                          {c.used_count}{c.usage_limit != null ? ` / ${c.usage_limit}` : ""} used · {formatExpiry(c.expires_at)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button onClick={() => handleToggleActive(c)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title={c.active ? "Deactivate" : "Activate"}>
                          {c.active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDelete(c)} className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {showCreate && (
        <CreateCouponModal
          onClose={() => setShowCreate(false)}
          onCreated={(c) => {
            setCoupons((cs) => [c, ...cs]);
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}

// ── Create modal ──────────────────────────────────────────────────

function CreateCouponModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: Coupon) => void }) {
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "flat">("percent");
  const [discountValue, setDiscountValue] = useState<string>("");
  const [maxDiscount, setMaxDiscount] = useState<string>("");
  const [minOrder, setMinOrder] = useState<string>("");
  const [usageLimit, setUsageLimit] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const codeValid = CODE_REGEX.test(code);
  const valueValid = discountValue !== "" && Number(discountValue) > 0 && (discountType !== "percent" || Number(discountValue) <= 100);
  const canSubmit = codeValid && valueValid && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const body = {
        code,
        discount_type: discountType,
        discount_value: Number(discountValue),
        max_discount: discountType === "percent" && maxDiscount ? Number(maxDiscount) : null,
        min_order: minOrder ? Number(minOrder) : 0,
        usage_limit: usageLimit ? parseInt(usageLimit, 10) : null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      };
      const created = await api.post<Coupon>("/api/admin/coupons", body);
      toast.success(`Coupon ${created!.code} created`);
      onCreated(created!);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create coupon";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-[17px] font-black text-gray-900">New Coupon</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Code */}
          <div>
            <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
              placeholder="ABCD12"
              className="mt-1.5 w-full px-4 py-3 text-[16px] font-mono font-black tracking-[0.3em] uppercase bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] text-center"
              maxLength={6}
              required
            />
            <p className={`text-[11px] font-medium mt-1.5 ${code.length === 0 ? "text-gray-500" : codeValid ? "text-emerald-600" : "text-red-600"}`}>
              {code.length === 0 ? "Exactly 6 characters, A–Z and 0–9 only" : codeValid ? "Looks good" : `${6 - code.length} more character${6 - code.length === 1 ? "" : "s"}`}
            </p>
          </div>

          {/* Discount type */}
          <div>
            <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Discount Type</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDiscountType("percent")}
                className={`px-4 py-3 rounded-xl text-[14px] font-bold border-2 transition-colors ${
                  discountType === "percent"
                    ? "border-[#8B5CF6] bg-[#8B5CF6]/5 text-[#8B5CF6]"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                % Off
              </button>
              <button
                type="button"
                onClick={() => setDiscountType("flat")}
                className={`px-4 py-3 rounded-xl text-[14px] font-bold border-2 transition-colors ${
                  discountType === "flat"
                    ? "border-[#8B5CF6] bg-[#8B5CF6]/5 text-[#8B5CF6]"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                ₹ Off
              </button>
            </div>
          </div>

          {/* Value */}
          <div>
            <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">
              {discountType === "percent" ? "Percent" : "Amount (₹)"}
            </label>
            <input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              min={0}
              step={discountType === "percent" ? 1 : 10}
              max={discountType === "percent" ? 100 : undefined}
              placeholder={discountType === "percent" ? "10" : "200"}
              className="mt-1.5 w-full px-4 py-3 text-[15px] font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6]"
              required
            />
          </div>

          {/* Max discount (percent only) */}
          {discountType === "percent" && (
            <div>
              <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Max Discount (₹) <span className="text-gray-400 font-medium normal-case">— optional cap</span></label>
              <input
                type="number"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                min={0}
                step={10}
                placeholder="500"
                className="mt-1.5 w-full px-4 py-3 text-[15px] font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6]"
              />
            </div>
          )}

          {/* Min order */}
          <div>
            <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Min Order (₹) <span className="text-gray-400 font-medium normal-case">— optional</span></label>
            <input
              type="number"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              min={0}
              step={10}
              placeholder="0"
              className="mt-1.5 w-full px-4 py-3 text-[15px] font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6]"
            />
          </div>

          {/* Usage limit */}
          <div>
            <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Total Uses <span className="text-gray-400 font-medium normal-case">— blank = unlimited</span></label>
            <input
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              min={1}
              step={1}
              placeholder="Unlimited"
              className="mt-1.5 w-full px-4 py-3 text-[15px] font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6]"
            />
          </div>

          {/* Expiry */}
          <div>
            <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Expires <span className="text-gray-400 font-medium normal-case">— blank = no expiry</span></label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="mt-1.5 w-full px-4 py-3 text-[15px] font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 text-[14px] font-bold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 px-4 py-3 rounded-2xl bg-[#8B5CF6] text-white text-[14px] font-bold hover:bg-[#7C3AED] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
