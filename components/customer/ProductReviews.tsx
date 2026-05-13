"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Star, ThumbsUp, X, Loader2, ChevronDown } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { useAuth } from "@/lib/AuthContext";
import { useLoginSheet } from "@/lib/LoginSheetContext";
import toast from "react-hot-toast";
import {
  listProductReviews,
  getReviewEligibility,
  submitReview,
  markHelpful,
  type Review,
  type EligibleOrderItem,
  type ReviewSort,
} from "@/lib/reviewsApi";

interface Props {
  productId: string;
}

function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          fill={n <= rating ? "#F59E0B" : "transparent"}
          color={n <= rating ? "#F59E0B" : "#D1D5DB"}
        />
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function ProductReviews({ productId }: Props) {
  const { user } = useAuth();
  const { open: openLoginSheet } = useLoginSheet();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<ReviewSort>("newest");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [eligible, setEligible] = useState<EligibleOrderItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [helpfulIds, setHelpfulIds] = useState<Set<string>>(new Set());

  const LIMIT = 5;

  const fetchPage = useCallback(
    async (p: number, replace: boolean) => {
      if (replace) setLoading(true);
      else setLoadingMore(true);
      try {
        const res = await listProductReviews(productId, { page: p, limit: LIMIT, sort });
        setTotal(res.total);
        setReviews((prev) => (replace ? res.data : [...prev, ...res.data]));
        setPage(p);
      } catch (err) {
        console.error("Failed to load reviews", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [productId, sort],
  );

  useEffect(() => {
    fetchPage(1, true);
  }, [fetchPage]);

  useEffect(() => {
    if (!user) {
      setEligible([]);
      return;
    }
    getReviewEligibility(productId)
      .then((r) => setEligible(r.items))
      .catch(() => setEligible([]));
  }, [productId, user]);

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  }, [reviews]);

  const handleHelpful = async (reviewId: string) => {
    if (!user) {
      openLoginSheet();
      return;
    }
    if (helpfulIds.has(reviewId)) return;
    try {
      const res = await markHelpful(reviewId);
      setHelpfulIds((prev) => new Set(prev).add(reviewId));
      if (!res.alreadyVoted) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r,
          ),
        );
      }
    } catch {
      toast.error("Couldn't record your vote");
    }
  };

  const handleSubmitted = async () => {
    setShowForm(false);
    toast.success("Review submitted! It will appear once approved.");
    setEligible([]);
    fetchPage(1, true);
  };

  const hasMore = reviews.length < total;

  return (
    <section className="mt-10 border-t pt-8" style={{ borderColor: t.border }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-bold" style={{ color: t.textPrimary }}>
          Customer Reviews
          {total > 0 && (
            <span className="ml-2 text-sm font-medium" style={{ color: t.textSecondary }}>
              ({total})
            </span>
          )}
        </h2>
        {user && eligible.length > 0 && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-white active:scale-[0.98] transition-all"
            style={{ background: t.bluePrimary }}
          >
            Write a review
          </button>
        )}
      </div>

      {reviews.length > 0 && (
        <div className="flex items-center gap-3 mb-6">
          <StarRow rating={Math.round(avgRating)} size={20} />
          <span className="text-sm font-semibold" style={{ color: t.textPrimary }}>
            {avgRating.toFixed(1)} / 5
          </span>
          <div className="ml-auto">
            <label className="text-xs mr-2" style={{ color: t.textSecondary }}>
              Sort:
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as ReviewSort)}
              className="text-sm rounded-md border px-2 py-1 bg-white"
              style={{ borderColor: t.border, color: t.textPrimary }}
            >
              <option value="newest">Newest</option>
              <option value="helpful">Most helpful</option>
              <option value="rating_desc">Highest rated</option>
              <option value="rating_asc">Lowest rated</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: t.bluePrimary }} />
        </div>
      ) : reviews.length === 0 ? (
        <div
          className="rounded-xl border p-6 text-center text-sm"
          style={{ borderColor: t.border, color: t.textSecondary }}
        >
          No reviews yet. Be the first to share your experience.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <article
              key={r.id}
              className="rounded-xl border p-4 md:p-5"
              style={{ borderColor: t.border, background: "#FFFFFF" }}
            >
              <header className="flex items-center justify-between mb-2">
                <StarRow rating={r.rating} />
                <time className="text-xs" style={{ color: t.textSecondary }}>
                  {formatDate(r.created_at)}
                </time>
              </header>
              {r.title && (
                <h3 className="font-semibold mb-1 text-sm md:text-base" style={{ color: t.textPrimary }}>
                  {r.title}
                </h3>
              )}
              {r.body && (
                <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: t.textSecondary }}>
                  {r.body}
                </p>
              )}
              {r.images && r.images.length > 0 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {r.images.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={src}
                      alt={`Review image ${i + 1}`}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover flex-shrink-0 border"
                      style={{ borderColor: t.border }}
                    />
                  ))}
                </div>
              )}
              <button
                onClick={() => handleHelpful(r.id)}
                disabled={helpfulIds.has(r.id)}
                className="mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium border min-h-[40px] disabled:opacity-60"
                style={{ borderColor: t.border, color: t.textSecondary }}
              >
                <ThumbsUp size={14} />
                Helpful ({r.helpful_count})
              </button>
            </article>
          ))}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => fetchPage(page + 1, false)}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-60"
                style={{ borderColor: t.border, color: t.textPrimary }}
              >
                {loadingMore ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ChevronDown size={14} />
                )}
                Show more reviews
              </button>
            </div>
          )}
        </div>
      )}

      {showForm && eligible.length > 0 && (
        <ReviewForm
          productId={productId}
          eligible={eligible}
          onClose={() => setShowForm(false)}
          onSubmitted={handleSubmitted}
        />
      )}
    </section>
  );
}

function ReviewForm({
  productId,
  eligible,
  onClose,
  onSubmitted,
}: {
  productId: string;
  eligible: EligibleOrderItem[];
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [orderItemId, setOrderItemId] = useState(eligible[0]?.order_item_id ?? "");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!orderItemId) {
      toast.error("Select an order");
      return;
    }
    if (rating < 1 || rating > 5) {
      toast.error("Pick a rating between 1 and 5");
      return;
    }
    setSubmitting(true);
    try {
      await submitReview(productId, {
        order_item_id: orderItemId,
        rating,
        title: title.trim() || undefined,
        body: body.trim() || undefined,
      });
      onSubmitted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 p-0 md:p-4">
      <div
        className="bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto"
      >
        <header className="sticky top-0 bg-white flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: t.border }}>
          <h3 className="font-bold text-base" style={{ color: t.textPrimary }}>
            Write a review
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <div className="p-4 space-y-4">
          {eligible.length > 1 && (
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: t.textPrimary }}>
                Order
              </label>
              <select
                value={orderItemId}
                onChange={(e) => setOrderItemId(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm bg-white"
                style={{ borderColor: t.border, color: t.textPrimary }}
              >
                {eligible.map((it) => (
                  <option key={it.order_item_id} value={it.order_item_id}>
                    {it.order_number} — {new Date(it.placed_at).toLocaleDateString("en-IN")}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: t.textPrimary }}>
              Rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="min-w-[48px] min-h-[48px] flex items-center justify-center"
                  aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                >
                  <Star
                    size={32}
                    fill={n <= rating ? "#F59E0B" : "transparent"}
                    color={n <= rating ? "#F59E0B" : "#D1D5DB"}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: t.textPrimary }}>
              Title (optional)
            </label>
            <input
              type="text"
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarise your experience"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: t.border }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: t.textPrimary }}>
              Your review (optional)
            </label>
            <textarea
              maxLength={4000}
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What did you like or dislike?"
              className="w-full rounded-lg border px-3 py-2 text-sm resize-none"
              style={{ borderColor: t.border }}
            />
            <p className="text-xs mt-1" style={{ color: t.textSecondary }}>
              {body.length} / 4000
            </p>
          </div>
        </div>

        <footer className="sticky bottom-0 bg-white px-4 py-3 border-t flex gap-3" style={{ borderColor: t.border }}>
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-xl border px-4 py-3 text-sm font-semibold disabled:opacity-60"
            style={{ borderColor: t.border, color: t.textPrimary }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: t.bluePrimary }}
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Submit review
          </button>
        </footer>
      </div>
    </div>
  );
}
