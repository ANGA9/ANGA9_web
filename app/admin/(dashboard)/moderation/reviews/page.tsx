"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, EyeOff, MessageSquare, X, Star } from "lucide-react";
import Header from "@/components/Header";
import {
  adminListReviews,
  adminModerateReview,
  type Review,
  type ReviewStatus,
} from "@/lib/reviewsApi";

const TABS: { key: ReviewStatus; label: string }[] = [
  { key: "pending_review", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "hidden", label: "Hidden" },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="inline-flex items-center gap-0.5 align-middle">
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
    <div className="min-h-screen">
      <Header />
      <main className="p-6 xl:p-8">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-anga-text">Review Moderation</h1>
          <p className="text-sm md:text-base text-anga-text-secondary">
            {total} review{total !== 1 ? "s" : ""} in {TABS.find((t) => t.key === tab)?.label.toLowerCase()}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto">
          {TABS.map((tabDef) => {
            const active = tab === tabDef.key;
            return (
              <button
                key={tabDef.key}
                onClick={() => setTab(tabDef.key)}
                className="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors border"
                style={{
                  background: active ? "#1A6FD4" : "#FFFFFF",
                  color: active ? "#FFFFFF" : "#4B5563",
                  borderColor: active ? "#1A6FD4" : "#E8EEF4",
                }}
              >
                {tabDef.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#1A6FD4]" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-xl border border-anga-border p-12 text-center">
            <MessageSquare className="w-12 h-12 text-[#E8EEF4] mx-auto mb-4" />
            <h2 className="text-base md:text-lg font-bold text-anga-text mb-1">No reviews</h2>
            <p className="text-sm md:text-base text-anga-text-secondary">Nothing in this tab right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <article
                key={r.id}
                className="bg-white rounded-xl border border-anga-border p-4 md:p-5 flex flex-col"
              >
                <header className="flex items-center justify-between mb-2">
                  <StarRow rating={r.rating} />
                  <time className="text-xs text-[#9CA3AF]">
                    {new Date(r.created_at).toLocaleDateString()}
                  </time>
                </header>
                {r.title && (
                  <h3 className="font-semibold text-sm md:text-base text-anga-text mb-1">{r.title}</h3>
                )}
                {r.body && (
                  <p className="text-sm text-[#4B5563] whitespace-pre-wrap leading-relaxed mb-3">
                    {r.body}
                  </p>
                )}
                {r.images && r.images.length > 0 && (
                  <div className="flex gap-2 mb-3 overflow-x-auto">
                    {r.images.map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={src}
                        alt={`Review image ${i + 1}`}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-[#E8EEF4]"
                      />
                    ))}
                  </div>
                )}
                <div className="text-xs text-[#9CA3AF] mb-3 space-y-0.5">
                  <div>Product: <span className="font-mono">{r.product_id.slice(0, 8)}…</span></div>
                  <div>Customer: <span className="font-mono">{r.customer_id.slice(0, 8)}…</span></div>
                  {r.moderation_note && (
                    <div className="text-[#EF4444]">Note: {r.moderation_note}</div>
                  )}
                </div>

                <div className="mt-auto flex flex-wrap gap-2">
                  {tab !== "approved" && (
                    <button
                      onClick={() => applyAction(r, "approved")}
                      disabled={actionId === r.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#22C55E] text-white text-xs font-semibold hover:bg-[#16A34A] transition-colors disabled:opacity-50"
                    >
                      {actionId === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                      Approve
                    </button>
                  )}
                  {tab !== "rejected" && (
                    <button
                      onClick={() => { setModalTarget({ review: r, action: "rejected" }); setNote(""); }}
                      disabled={actionId === r.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#EF4444] text-white text-xs font-semibold hover:bg-[#DC2626] transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3 h-3" /> Reject
                    </button>
                  )}
                  {tab !== "hidden" && (
                    <button
                      onClick={() => { setModalTarget({ review: r, action: "hidden" }); setNote(""); }}
                      disabled={actionId === r.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#6B7280] text-white text-xs font-semibold hover:bg-[#4B5563] transition-colors disabled:opacity-50"
                    >
                      <EyeOff className="w-3 h-3" /> Hide
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {modalTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base md:text-lg font-bold text-anga-text">
                {modalTarget.action === "rejected" ? "Reject review" : "Hide review"}
              </h3>
              <button onClick={() => setModalTarget(null)} className="text-[#9CA3AF] hover:text-anga-text">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-[#4B5563] mb-3">
              Add an internal note explaining the decision (optional, shown to admins only).
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Contains profanity / off-topic / spam"
              className="h-28 w-full rounded-lg border border-[#E8EEF4] bg-white px-4 py-3 text-sm text-anga-text placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/20 resize-none"
              maxLength={1000}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setModalTarget(null)}
                className="flex-1 h-10 rounded-lg border border-[#E8EEF4] text-sm font-medium text-[#4B5563] hover:bg-[#F8FBFF]"
              >
                Cancel
              </button>
              <button
                onClick={() => applyAction(modalTarget.review, modalTarget.action, note.trim() || undefined)}
                disabled={actionId === modalTarget.review.id}
                className="flex-1 h-10 rounded-lg text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: modalTarget.action === "rejected" ? "#EF4444" : "#6B7280" }}
              >
                {actionId === modalTarget.review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
