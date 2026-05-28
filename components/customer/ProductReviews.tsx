"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Star, ThumbsUp, X, Loader2, ChevronDown, Image as ImageIcon, Video as VideoIcon, Trash2 } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { useAuth } from "@/lib/AuthContext";
import { useLoginSheet } from "@/lib/LoginSheetContext";
import toast from "react-hot-toast";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { cdnUrl } from "@/lib/utils";
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
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
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
      setEligibilityChecked(false);
      return;
    }
    setEligibilityChecked(false);
    getReviewEligibility(productId)
      .then((r) => setEligible(r.items))
      .catch(() => setEligible([]))
      .finally(() => setEligibilityChecked(true));
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
    toast.success("Review submitted! It is now visible.");
    setEligible([]);
    fetchPage(1, true);
  };

  const hasMore = reviews.length < total;

  return (
    <section className="mt-12 md:mt-16 border-t pt-8 md:pt-10" style={{ borderColor: t.border }}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-3" style={{ color: t.textPrimary }}>
            Customer Reviews
          </h2>
          {reviews.length > 0 ? (
            <div className="flex items-center gap-4">
              <span className="text-4xl font-extrabold tracking-tight" style={{ color: t.textPrimary }}>
                {avgRating.toFixed(1)}
              </span>
              <div className="flex flex-col gap-1">
                <StarRow rating={Math.round(avgRating)} size={18} />
                <span className="text-xs md:text-sm font-medium" style={{ color: t.textSecondary }}>
                  Based on {total} review{total !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {reviews.length > 0 && (
            <div className="flex-1 md:flex-none">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as ReviewSort)}
                className="w-full md:w-auto text-sm font-medium rounded-xl border px-4 py-2.5 bg-gray-50/50 hover:bg-gray-50 transition-colors outline-none cursor-pointer appearance-none"
                style={{ borderColor: t.border, color: t.textPrimary }}
              >
                <option value="newest">Newest first</option>
                <option value="helpful">Most helpful</option>
                <option value="rating_desc">Highest rated</option>
                <option value="rating_asc">Lowest rated</option>
              </select>
            </div>
          )}
          {user && eligible.length > 0 && reviews.length > 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="flex-1 md:flex-none rounded-xl px-6 py-2.5 text-sm font-semibold text-white active:scale-[0.98] transition-all hover:opacity-90 shadow-sm whitespace-nowrap"
              style={{ background: t.bluePrimary }}
            >
              Write a review
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: t.bluePrimary }} />
        </div>
      ) : reviews.length === 0 ? (
        <div
          className="rounded-2xl border p-10 md:p-16 text-center bg-gray-50/30 flex flex-col items-center"
          style={{ borderColor: t.border }}
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border mb-5" style={{ borderColor: t.border }}>
            <Star className="w-8 h-8 text-gray-300" />
          </div>
          {user && eligible.length > 0 ? (
            <>
              <h3 className="text-lg md:text-xl font-bold mb-2" style={{ color: t.textPrimary }}>
                You purchased this product!
              </h3>
              <p className="text-sm md:text-base mb-6 max-w-md" style={{ color: t.textSecondary }}>
                Share your experience with other customers by writing a review. Your feedback helps others make better choices.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="rounded-xl px-8 py-3 text-sm font-semibold text-white active:scale-[0.98] transition-all hover:opacity-90 shadow-md"
                style={{ background: t.bluePrimary }}
              >
                Write a review
              </button>
            </>
          ) : user && eligibilityChecked && eligible.length === 0 ? (
            <>
               <h3 className="text-lg md:text-xl font-bold mb-2" style={{ color: t.textPrimary }}>
                No reviews yet
              </h3>
              <p className="text-sm md:text-base max-w-sm" style={{ color: t.textSecondary }}>
                Purchase this product to be the first to share your experience!
              </p>
            </>
          ) : (
            <>
               <h3 className="text-lg md:text-xl font-bold mb-2" style={{ color: t.textPrimary }}>
                No reviews yet
              </h3>
              <p className="text-sm md:text-base max-w-sm" style={{ color: t.textSecondary }}>
                Order this product and share your experience!
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((r) => (
            <article
              key={r.id}
              className="group rounded-2xl border p-5 md:p-7 transition-all hover:shadow-sm bg-white"
              style={{ borderColor: t.border }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col gap-1.5">
                  <StarRow rating={r.rating} size={15} />
                  <time className="text-[11px] md:text-xs font-semibold uppercase tracking-wider" style={{ color: t.textSecondary }}>
                    {formatDate(r.created_at)}
                  </time>
                </div>
              </div>
              
              <div className="mb-4">
                {r.title && (
                  <h3 className="font-bold text-base md:text-lg mb-2" style={{ color: t.textPrimary }}>
                    {r.title}
                  </h3>
                )}
                {r.body && (
                  <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed" style={{ color: t.textSecondary }}>
                    {r.body}
                  </p>
                )}
              </div>

              {r.images && r.images.length > 0 && (
                <div className="flex gap-3 mt-5 overflow-x-auto pb-3 scrollbar-hide">
                  {r.images.map((src, i) => {
                    const isVideo = src.match(/\.(mp4|webm|ogg|mov)$/i);
                    return isVideo ? (
                      <video
                        key={i}
                        src={cdnUrl(src)}
                        controls
                        className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover flex-shrink-0 border bg-black shadow-sm"
                        style={{ borderColor: t.border }}
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={cdnUrl(src)}
                        alt={`Review media ${i + 1}`}
                        className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover flex-shrink-0 border shadow-sm"
                        style={{ borderColor: t.border }}
                      />
                    );
                  })}
                </div>
              )}

              <div className="mt-6 pt-5 border-t flex items-center justify-between" style={{ borderColor: t.border }}>
                <span className="text-xs md:text-sm font-medium" style={{ color: t.textSecondary }}>
                  Was this helpful?
                </span>
                <button
                  onClick={() => handleHelpful(r.id)}
                  disabled={helpfulIds.has(r.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs md:text-sm font-semibold transition-all ${
                    helpfulIds.has(r.id) 
                      ? "bg-gray-100 text-gray-500" 
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <ThumbsUp size={16} className={helpfulIds.has(r.id) ? "fill-current" : ""} />
                  {r.helpful_count > 0 ? r.helpful_count : "Helpful"}
                </button>
              </div>
            </article>
          ))}

          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => fetchPage(page + 1, false)}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold disabled:opacity-60 hover:bg-gray-50 transition-colors"
                style={{ borderColor: t.border, color: t.textPrimary }}
              >
                {loadingMore ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ChevronDown size={16} />
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
  const [photos, setPhotos] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
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
      const supabase = getSupabaseBrowserClient();
      const uploadedUrls: string[] = [];
      const uploadFile = async (f: File) => {
        const ext = f.name.split('.').pop();
        const path = `reviews/${productId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        const { data, error } = await supabase.storage.from("public-assets").upload(path, f);
        if (data) uploadedUrls.push(`/${path}`);
      };

      for (const p of photos) await uploadFile(p);
      if (video) await uploadFile(video);

      await submitReview(productId, {
        order_item_id: orderItemId,
        rating,
        title: title.trim() || undefined,
        body: body.trim() || undefined,
        images: uploadedUrls,
      });
      onSubmitted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center bg-black/50 p-0 md:p-4">
      <div
        className="bg-white w-full md:max-w-lg md:rounded-2xl md:max-h-[90vh] rounded-t-2xl overflow-hidden flex flex-col"
        style={{ height: "55dvh" }}
      >
        <header className="bg-white flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: t.border }}>
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

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
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

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: t.textPrimary }}>
              Add Media (optional)
            </label>
            <div className="flex flex-wrap gap-3">
              {photos.map((p, i) => (
                <div key={i} className="relative w-16 h-16 md:w-20 md:h-20 border rounded-lg overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(p)} className="w-full h-full object-cover" alt="" />
                  <button
                    onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                    className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {video && (
                <div className="relative w-16 h-16 md:w-20 md:h-20 border rounded-lg overflow-hidden group bg-black">
                  <video src={URL.createObjectURL(video)} className="w-full h-full object-cover" />
                  <button
                    onClick={() => setVideo(null)}
                    className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white"
                  >
                    <Trash2 size={16} />
                  </button>
                  <VideoIcon className="absolute bottom-1 left-1 text-white drop-shadow" size={14} />
                </div>
              )}
              {photos.length < 5 && (
                <label className="w-16 h-16 md:w-20 md:h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: t.border }}>
                  <ImageIcon size={20} style={{ color: t.textSecondary }} />
                  <span className="text-[10px] mt-1 font-medium" style={{ color: t.textSecondary }}>Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        setPhotos(prev => [...prev, ...Array.from(e.target.files!)].slice(0, 5));
                      }
                    }}
                  />
                </label>
              )}
              {!video && (
                <label className="w-16 h-16 md:w-20 md:h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: t.border }}>
                  <VideoIcon size={20} style={{ color: t.textSecondary }} />
                  <span className="text-[10px] mt-1 font-medium" style={{ color: t.textSecondary }}>1 Video</span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setVideo(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <footer
          className="sticky bottom-0 bg-white px-4 py-3 border-t flex gap-3 shrink-0"
          style={{
            borderColor: t.border,
            paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))",
          }}
        >
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
