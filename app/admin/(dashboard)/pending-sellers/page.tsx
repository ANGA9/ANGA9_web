"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import {
  Loader2,
  Store,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  X,
  UserCheck,
  MapPin,
  Briefcase,
  Landmark,
  FileText,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

/**
 * Full seller profile shape as returned by GET /api/users/sellers.
 * Mirrors SELLER_FIELDS in backend/services/user-service/src/services/profile.service.ts.
 * All optional because not every onboarding step is required to be filled
 * before the seller submits for review.
 */
interface SellerProfile {
  id: string;
  user_id: string;
  store_name?: string;
  store_description?: string;
  store_slug?: string;
  logo_url?: string;
  business_name?: string;
  business_type?: string;
  business_category?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  gstin?: string;
  pan_number?: string;
  aadhaar_number?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  bank_name?: string;
  bank_branch?: string;
  pickup_address_same?: boolean;
  pickup_address?: Record<string, unknown> | null;
  onboarding_step?: number;
  onboarding_complete?: boolean;
  is_verified?: boolean;
  verification_status: string;
  created_at: string;
  updated_at?: string;
}

const REJECTION_REASONS = [
  "Invalid or unreadable documents",
  "GSTIN / PAN mismatch with business name",
  "Suspicious or incomplete information",
  "Business category not allowed",
  "Duplicate seller account",
  "Other",
] as const;

function maskMiddle(value: string | undefined, visibleStart = 0, visibleEnd = 4): string {
  if (!value) return "—";
  if (value.length <= visibleStart + visibleEnd) return value;
  const start = value.slice(0, visibleStart);
  const end = value.slice(-visibleEnd);
  const masked = "•".repeat(Math.max(4, value.length - visibleStart - visibleEnd));
  return `${start}${masked}${end}`;
}

function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PendingSellersPage() {
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [reviewing, setReviewing] = useState<SellerProfile | null>(null);
  const [rejecting, setRejecting] = useState<SellerProfile | null>(null);

  const refresh = async () => {
    try {
      const res = await api.get<{ sellers: SellerProfile[] }>("/api/users/sellers", { silent: true });
      // Only keep sellers actually waiting on admin action. The backend
      // returns everyone; admin action is only meaningful for `pending`.
      const all = res?.sellers ?? [];
      setSellers(all.filter((s) => s.verification_status === "pending"));
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const pendingCount = sellers.length;

  const handleApprove = async (seller: SellerProfile) => {
    setActionLoading(seller.id);
    try {
      await api.patch(`/api/users/sellers/${seller.id}/verify`, { status: "verified" });
      toast.success(`${seller.business_name || "Seller"} approved`);
      setSellers((prev) => prev.filter((s) => s.id !== seller.id));
      setReviewing(null);
    } catch {
      toast.error("Failed to approve seller");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (seller: SellerProfile, reason: string, notes: string) => {
    setActionLoading(seller.id);
    try {
      // The backend only persists `status` today (see verifySeller in
      // user-service profile.controller). reason + notes go in the payload
      // so once the backend stores them, no frontend change is needed.
      await api.patch(`/api/users/sellers/${seller.id}/verify`, {
        status: "rejected",
        reason,
        notes,
      });
      toast.success(`${seller.business_name || "Seller"} rejected`);
      setSellers((prev) => prev.filter((s) => s.id !== seller.id));
      setRejecting(null);
      setReviewing(null);
    } catch {
      toast.error("Failed to reject seller");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Pending Sellers</h1>
          <p className="text-[15px] text-gray-500 font-medium">
            {pendingCount} seller{pendingCount !== 1 ? "s" : ""} waiting for verification
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-[#8B5CF6]" />
        </div>
      ) : pendingCount === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <UserCheck className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-[20px] font-bold text-gray-900 mb-2">All caught up</h2>
          <p className="text-[15px] text-gray-500 font-medium">
            No sellers are waiting for review right now.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Business</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sellers.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center border border-purple-100 shadow-sm shrink-0">
                          <Store className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-[14px] text-gray-900">
                            {s.business_name || s.store_name || "—"}
                          </span>
                          {s.store_name && s.store_name !== s.business_name && (
                            <span className="text-[12px] text-gray-500">{s.store_name}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-medium text-gray-600 capitalize">
                        {s.business_type?.replace(/_/g, " ") || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-medium text-gray-600">
                        {[s.city, s.state].filter(Boolean).join(", ") || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-gray-500">
                      {formatDateTime(s.updated_at || s.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setReviewing(s)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all shadow-sm bg-white border-2 border-[#8B5CF6] text-[#8B5CF6] hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4" /> Review
                        </button>
                        <button
                          onClick={() => setRejecting(s)}
                          disabled={actionLoading === s.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-red-200 text-red-600 text-[13px] font-bold hover:bg-red-50 transition-all shadow-sm disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reviewing && (
        <ReviewModal
          seller={reviewing}
          onClose={() => setReviewing(null)}
          onApprove={() => handleApprove(reviewing)}
          onReject={() => setRejecting(reviewing)}
          actionLoading={actionLoading === reviewing.id}
        />
      )}

      {rejecting && (
        <RejectModal
          seller={rejecting}
          onCancel={() => setRejecting(null)}
          onConfirm={(reason, notes) => handleReject(rejecting, reason, notes)}
          actionLoading={actionLoading === rejecting.id}
        />
      )}
    </div>
  );
}

/* ── Review modal ─────────────────────────────────────────────── */

function ReviewModal({
  seller,
  onClose,
  onApprove,
  onReject,
  actionLoading,
}: {
  seller: SellerProfile;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  actionLoading: boolean;
}) {
  // Click-to-reveal for sensitive fields. State is per-modal-open, so
  // closing and reopening re-masks. Aadhaar/PAN/bank stay hidden by default
  // so a casual screen-share doesn't leak them.
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setRevealed((r) => ({ ...r, [key]: !r[key] }));

  const pickup = useMemo(() => {
    if (seller.pickup_address_same) return "Same as business address";
    if (!seller.pickup_address) return "—";
    if (typeof seller.pickup_address !== "object") return String(seller.pickup_address);
    const a = seller.pickup_address as Record<string, unknown>;
    const parts = [a.line1, a.line2, a.city, a.state, a.pincode]
      .filter((v) => v && typeof v === "string")
      .map(String);
    return parts.length ? parts.join(", ") : "—";
  }, [seller.pickup_address, seller.pickup_address_same]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center border border-purple-100">
              <Store className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-gray-900 leading-tight">
                {seller.business_name || seller.store_name || "Unnamed seller"}
              </h2>
              <p className="text-[13px] text-gray-500 font-medium">
                Submitted {formatDateTime(seller.updated_at || seller.created_at)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-6">
          <Section icon={Briefcase} title="Business">
            <Row label="Business name" value={seller.business_name} />
            <Row label="Store name" value={seller.store_name} />
            <Row label="Store slug" value={seller.store_slug} />
            <Row label="Type" value={seller.business_type?.replace(/_/g, " ")} capitalize />
            <Row label="Category" value={seller.business_category?.replace(/_/g, " ")} capitalize />
            <Row label="Description" value={seller.store_description} multiline />
          </Section>

          <Section icon={MapPin} title="Address">
            <Row label="Line 1" value={seller.address_line1} />
            <Row label="Line 2" value={seller.address_line2} />
            <Row
              label="City / State"
              value={[seller.city, seller.state].filter(Boolean).join(", ")}
            />
            <Row label="Pincode" value={seller.pincode} />
            <Row label="Country" value={seller.country} />
            <Row label="Pickup address" value={pickup} />
          </Section>

          <Section icon={FileText} title="Tax & identity">
            <SensitiveRow
              label="GSTIN"
              value={seller.gstin}
              revealed={revealed.gstin}
              onToggle={() => toggle("gstin")}
              visibleStart={2}
              visibleEnd={3}
            />
            <SensitiveRow
              label="PAN number"
              value={seller.pan_number}
              revealed={revealed.pan}
              onToggle={() => toggle("pan")}
              visibleStart={2}
              visibleEnd={3}
            />
            <SensitiveRow
              label="Aadhaar number"
              value={seller.aadhaar_number}
              revealed={revealed.aadhaar}
              onToggle={() => toggle("aadhaar")}
              visibleStart={0}
              visibleEnd={4}
            />
          </Section>

          <Section icon={Landmark} title="Banking">
            <Row label="Account holder" value={seller.bank_account_name} />
            <SensitiveRow
              label="Account number"
              value={seller.bank_account_number}
              revealed={revealed.acct}
              onToggle={() => toggle("acct")}
              visibleStart={0}
              visibleEnd={4}
            />
            <Row label="IFSC" value={seller.bank_ifsc} />
            <Row label="Bank" value={seller.bank_name} />
            <Row label="Branch" value={seller.bank_branch} />
          </Section>

          <Section icon={Calendar} title="Onboarding">
            <Row
              label="Onboarding step"
              value={seller.onboarding_step != null ? `${seller.onboarding_step} / 7` : "—"}
            />
            <Row
              label="Completed onboarding"
              value={seller.onboarding_complete ? "Yes" : "No"}
            />
            <Row label="Created" value={formatDateTime(seller.created_at)} />
            <Row label="Last updated" value={formatDateTime(seller.updated_at)} />
          </Section>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 bg-gray-50/50">
          <button
            onClick={onReject}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-red-200 text-red-600 text-[14px] font-bold hover:bg-red-50 transition-all shadow-sm disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" /> Reject
          </button>
          <button
            onClick={onApprove}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[14px] font-bold transition-all shadow-sm disabled:opacity-50 bg-white border-2 border-green-500 text-green-500 hover:bg-green-50"
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Reject modal ─────────────────────────────────────────────── */

function RejectModal({
  seller,
  onCancel,
  onConfirm,
  actionLoading,
}: {
  seller: SellerProfile;
  onCancel: () => void;
  onConfirm: (reason: string, notes: string) => void;
  actionLoading: boolean;
}) {
  const [reason, setReason] = useState<string>(REJECTION_REASONS[0]);
  const [notes, setNotes] = useState("");

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-[18px] font-bold text-gray-900">Reject seller</h3>
          <p className="text-[13px] text-gray-500 mt-1">
            {seller.business_name || seller.store_name || "This seller"} will be moved to{" "}
            <span className="font-bold text-red-600">rejected</span>. They will need to fix
            issues and resubmit.
          </p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[12px] font-bold uppercase tracking-wider text-gray-500 mb-2">
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 focus:border-[#8B5CF6]"
            >
              {REJECTION_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-bold uppercase tracking-wider text-gray-500 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Extra context for the seller and the audit log…"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 focus:border-[#8B5CF6] resize-none"
            />
          </div>
        </div>

        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 bg-gray-50/50">
          <button
            onClick={onCancel}
            disabled={actionLoading}
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-[14px] font-bold hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason, notes.trim())}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[14px] font-bold transition-all shadow-sm disabled:opacity-50 bg-white border-2 border-red-500 text-red-500 hover:bg-red-50"
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            Confirm reject
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Small presentational helpers ─────────────────────────────── */

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Store;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-[#8B5CF6]" />
        <h4 className="text-[13px] font-bold uppercase tracking-widest text-gray-700">{title}</h4>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 bg-gray-50/60 rounded-2xl border border-gray-100 px-4 py-3">
        {children}
      </dl>
    </section>
  );
}

function Row({
  label,
  value,
  multiline,
  capitalize,
}: {
  label: string;
  value?: string | null;
  multiline?: boolean;
  capitalize?: boolean;
}) {
  const display = value && String(value).trim() ? String(value) : "—";
  return (
    <div className={multiline ? "sm:col-span-2" : undefined}>
      <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{label}</dt>
      <dd
        className={`text-[14px] font-medium text-gray-800 ${capitalize ? "capitalize" : ""} ${
          multiline ? "whitespace-pre-line" : ""
        }`}
      >
        {display}
      </dd>
    </div>
  );
}

function SensitiveRow({
  label,
  value,
  revealed,
  onToggle,
  visibleStart,
  visibleEnd,
}: {
  label: string;
  value?: string;
  revealed?: boolean;
  onToggle: () => void;
  visibleStart: number;
  visibleEnd: number;
}) {
  const hasValue = !!value && value.trim().length > 0;
  const display = !hasValue
    ? "—"
    : revealed
      ? value
      : maskMiddle(value, visibleStart, visibleEnd);

  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{label}</dt>
      <dd className="flex items-center gap-2">
        <span className="text-[14px] font-medium text-gray-800 font-mono">{display}</span>
        {hasValue && (
          <button
            type="button"
            onClick={onToggle}
            className="text-gray-400 hover:text-[#8B5CF6] transition-colors"
            title={revealed ? "Hide" : "Reveal"}
          >
            {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        )}
      </dd>
    </div>
  );
}
