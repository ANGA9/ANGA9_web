import { request } from "./api";

export type AdStatus = 'pending' | 'approved' | 'active' | 'rejected' | 'completed';

export interface AdCampaign {
  id: string;
  seller_id: string;
  product_id: string;
  placement: string;
  starts_at: string;
  ends_at: string;
  banner_url: string;
  headline: string;
  cta_text: string;
  budget_inr: number;
  approved_fee_inr: number | null;
  status: AdStatus;
  reject_reason: string | null;
  impressions: number;
  clicks: number;
  created_at: string;
  updated_at: string;
  products?: { name: string; slug: string };
}

export interface AdListResponse {
  data: AdCampaign[];
  total: number;
  page: number;
  limit: number;
}

export interface RequestAdBody {
  product_id: string;
  placement: string;
  starts_at: string;
  ends_at: string;
  banner_url: string;
  headline: string;
  cta_text?: string;
  budget_inr: number;
}

export const adsApi = {
  // Public
  listActive: (placement: string) =>
    request<{ ads: AdCampaign[] }>(`/api/products/ads/active?placement=${encodeURIComponent(placement)}`),
  recordClick: (adId: string) =>
    request<{ success: boolean }>(`/api/products/ads/${adId}/click`, { method: "POST" }),
  recordImpression: (adId: string) =>
    request<{ success: boolean }>(`/api/products/ads/${adId}/impression`, { method: "POST" }),

  // Seller
  requestAd: (payload: RequestAdBody) =>
    request<{ ad: AdCampaign }>("/api/seller/ads/request", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listMine: () =>
    request<{ ads: AdCampaign[] }>("/api/seller/ads"),

  // Admin
  adminList: (params?: { page?: number; limit?: number; status?: AdStatus }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.status) q.set("status", params.status);
    return request<AdListResponse>(`/api/admin/ads?${q.toString()}`);
  },
  adminApprove: (adId: string, fee_inr: number) =>
    request<{ ad: AdCampaign }>(`/api/admin/ads/${adId}/approve`, {
      method: "PATCH",
      body: JSON.stringify({ fee_inr }),
    }),
  adminReject: (adId: string, reason: string) =>
    request<{ ad: AdCampaign }>(`/api/admin/ads/${adId}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),
};
