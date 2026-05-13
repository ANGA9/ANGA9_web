"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, EyeOff, MessageSquare, X, Star } from "lucide-react";
import {
  adminListReviews,
  adminModerateReview,
  type Review,
  type ReviewStatus,
} from "@/lib/reviewsApi";

const TABS: { key: ReviewStatus; label: string }[] = [
  { key: "pending_review", label: "Pending Review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "hidden", label: "Hidden" },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="inline-flex items-center gap-1 align-middle">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          fill={n <= rating ? "#F59E0B" : "transparent"}
          color={n <= rating ? "#F59E0B" : "#D1D5DB"}
        />
      ))}
    </div>
  );
}

export default function ReviewModerationPage() {
  const [tab, setTab] = useState<ReviewStatus>("pending_review");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [modalTarget, setModalTarget] = useState<{ review: Review; action: ReviewStatus } | null>(null);
  const [note, setNote] = useState("");

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminListReviews({ status: tab, limit: 50 });
      setReviews(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  async function applyAction(review: Review, action: ReviewStatus, withNote?: string) {
    setActionId(review.id);
    try {
      await adminModerateReview(review.id, { status: action, note: withNote });
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
      setTotal((t) => Math.max(0, t - 1));
      setModalTarget(null);
      setNote("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to moderate review");
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Review Moderation</h1>
          <p className="text-[15px] text-gray-500 font-medium">
            {total} review{total !== 1 ? "s" : ""} in {TABS.find((t) => t.key === tab)?.label.toLowerCase()}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-2xl shadow-sm self-start md:self-auto overflow-x-auto no-scrollbar">
          {TABS.map((tabDef) => {
            const active = tab === tabDef.key;
            return (
              <button
                key={tabDef.key}
                onClick={() => setTab(tabDef.key)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-[14px] font-bold transition-all ${
                  active
                    ? "bg-[#8B5CF6] text-white shadow-md shadow-purple-500/20"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tabDef.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-[#8B5CF6]" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-[20px] font-bold text-gray-900 mb-2">No reviews</h2>
          <p className="text-[15px] text-gray-500 font-medium">Nothing in this tab right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reviews.map((r) => (
            <article
              key={r.id}
              className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow"
            >
              <header className="flex items-center justify-between mb-4">
                <div className="bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100 flex items-center">
                  <StarRow rating={r.rating} />
                </div>
                <time className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">
                  {new Date(r.created_at).toLocaleDateString()}
                </time>
              </header>

              {r.title && (
                <h3 className="font-bold text-[18px] text-gray-900 mb-2 leading-tight">{r.title}</h3>
              )}
              {r.body && (
                <p className="text-[14px] text-gray-600 whitespace-pre-wrap leading-relaxed mb-4 flex-1">
                  {r.body}
                </p>
              )}

              {r.images && r.images.length > 0 && (
                <div className="flex gap-3 mb-4 overflow-x-auto pb-2 no-scrollbar">
                  {r.images.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={src}
                      alt={`Review image ${i + 1}`}
                      className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 border border-gray-200 shadow-sm"
                    />
                  ))}
                </div>
              )}

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-5 text-[13px] font-medium text-gray-500 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-16">Product:</span>
                  <span className="font-mono text-gray-900 font-bold">{r.product_id.slice(0, 8)}…</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16">Customer:</span>
                  <span className="font-mono text-gray-900 font-bold">{r.customer_id.slice(0, 8)}…</span>
                </div>
                {r.moderation_note && (
                  <div className="text-red-600 flex items-start gap-2 mt-2 bg-red-50 p-2 rounded-lg border border-red-100">
                    <span className="font-bold">Note:</span> {r.moderation_note}
                  </div>
                )}
              </div>

              <div className="mt-auto flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                {tab !== "approved" && (
                  <button
                    onClick={() => applyAction(r, "approved")}
                    disabled={actionId === r.id}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-500 text-white text-[13px] font-bold hover:bg-green-600 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {actionId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Approve
                  </button>
                )}
                {tab !== "rejected" && (
                  <button
                    onClick={() => { setModalTarget({ review: r, action: "rejected" }); setNote(""); }}
                    disabled={actionId === r.id}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-red-200 text-red-600 text-[13px] font-bold hover:bg-red-50 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                )}
                {tab !== "hidden" && (
                  <button
                    onClick={() => { setModalTarget({ review: r, action: "hidden" }); setNote(""); }}
                    disabled={actionId === r.id}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-600 text-[13px] font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    <EyeOff className="w-4 h-4" /> Hide
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[20px] font-bold text-gray-900">
                {modalTarget.action === "rejected" ? "Reject Review" : "Hide Review"}
              </h3>
              <button 
                onClick={() => setModalTarget(null)} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[14px] font-medium text-gray-500 mb-4">
              Add an internal note explaining the decision (optional, shown to admins only).
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Contains profanity / off-topic / spam"
              className="h-32 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all resize-none shadow-inner"
              maxLength={1000}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalTarget(null)}
                className="flex-1 h-12 rounded-xl border border-gray-200 bg-white text-[14px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => applyAction(modalTarget.review, modalTarget.action, note.trim() || undefined)}
                disabled={actionId === modalTarget.review.id}
                className="flex-1 h-12 rounded-xl text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                style={{ background: modalTarget.action === "rejected" ? "#EF4444" : "#4B5563" }}
              >
                {actionId === modalTarget.review.id ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
