import { api } from "./api";

/* ─── Types ────────────────────────────────────────────────── */
export type ReviewStatus =
  | "pending_review"
  | "approved"
  | "rejected"
  | "hidden";

export interface Review {
  id: string;
  product_id: string;
  order_item_id: string;
  customer_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  images: string[];
  status: ReviewStatus;
  helpful_count: number;
  moderated_by: string | null;
  moderated_at: string | null;
  moderation_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewListResponse {
  data: Review[];
  page: number;
  limit: number;
  total: number;
}

export interface EligibleOrderItem {
  order_item_id: string;
  order_id: string;
  order_number: string;
  product_name: string;
  placed_at: string;
}

export interface CreateReviewBody {
  order_item_id: string;
  rating: number;
  title?: string;
  body?: string;
  images?: string[];
}

export type ReviewSort = "newest" | "helpful" | "rating_desc" | "rating_asc";

/* ─── Customer / public ─────────────────────────────────────── */
export function listProductReviews(
  productId: string,
  opts: { page?: number; limit?: number; sort?: ReviewSort } = {},
): Promise<ReviewListResponse> {
  const q = new URLSearchParams();
  if (opts.page) q.set("page", String(opts.page));
  if (opts.limit) q.set("limit", String(opts.limit));
  if (opts.sort) q.set("sort", opts.sort);
  const qs = q.toString();
  return api.get<ReviewListResponse>(
    `/api/products/${productId}/reviews${qs ? `?${qs}` : ""}`,
  );
}

export function getReviewEligibility(
  productId: string,
): Promise<{ items: EligibleOrderItem[] }> {
  return api.get<{ items: EligibleOrderItem[] }>(
    `/api/products/${productId}/reviews/eligibility`,
  );
}

export function submitReview(
  productId: string,
  body: CreateReviewBody,
): Promise<{ review: Review }> {
  return api.post<{ review: Review }>(
    `/api/products/${productId}/reviews`,
    body,
  );
}

export function markHelpful(
  reviewId: string,
): Promise<{ success: boolean; alreadyVoted?: boolean }> {
  return api.post<{ success: boolean; alreadyVoted?: boolean }>(
    `/api/products/reviews/${reviewId}/helpful`,
  );
}

/* ─── Admin moderation ──────────────────────────────────────── */
export function adminListReviews(
  opts: { page?: number; limit?: number; status?: ReviewStatus } = {},
): Promise<{ data: Review[]; total: number; page: number; limit: number }> {
  const q = new URLSearchParams();
  if (opts.page) q.set("page", String(opts.page));
  if (opts.limit) q.set("limit", String(opts.limit));
  if (opts.status) q.set("status", opts.status);
  const qs = q.toString();
  return api.get(
    `/api/admin/products/reviews${qs ? `?${qs}` : ""}`,
  );
}

export function adminModerateReview(
  reviewId: string,
  body: { status: ReviewStatus; note?: string },
): Promise<{ review: Review }> {
  return api.patch<{ review: Review }>(
    `/api/admin/products/reviews/${reviewId}`,
    body,
  );
}
