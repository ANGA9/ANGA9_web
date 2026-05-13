import { api } from "./api";

export type DisputeType = 'return' | 'refund' | 'wrong_item' | 'damaged' | 'not_received' | 'other';
export type DisputeStatus = 'open' | 'seller_responded' | 'admin_review' | 'resolved_refund' | 'resolved_replace' | 'resolved_rejected' | 'closed';

export interface Dispute {
  id: string;
  order_id: string;
  order_item_id: string;
  customer_id: string;
  seller_id: string;
  type: DisputeType;
  reason: string;
  evidence_images: string[];
  status: DisputeStatus;
  seller_response: string | null;
  seller_responded_at: string | null;
  admin_resolution: string | null;
  admin_resolved_by: string | null;
  admin_resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DisputeListResponse {
  data: Dispute[];
  total: number;
  page: number;
  limit: number;
}

export interface RaiseDisputeBody {
  order_item_id: string;
  type: DisputeType;
  reason: string;
  evidence_images?: string[];
}

export interface SellerRespondBody {
  seller_response: string;
  request_admin?: boolean;
}

export interface AdminResolveBody {
  status: 'resolved_refund' | 'resolved_replace' | 'resolved_rejected';
  admin_resolution?: string;
}

export const disputesApi = {
  // Customer
  raiseDispute: (orderId: string, payload: RaiseDisputeBody) =>
    api.post<{ dispute: Dispute }>(`/api/orders/${orderId}/dispute`, payload),
  getDisputesForOrder: (orderId: string) =>
    api.get<{ items: Dispute[] }>(`/api/orders/${orderId}/dispute`),

  // Seller
  sellerList: (params?: { page?: number; limit?: number; status?: DisputeStatus }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.status) q.set("status", params.status);
    return api.get<DisputeListResponse>(`/api/seller/orders/disputes?${q.toString()}`);
  },
  sellerRespond: (orderId: string, disputeId: string, payload: SellerRespondBody) =>
    api.patch<{ dispute: Dispute }>(`/api/orders/${orderId}/dispute/${disputeId}`, payload),

  // Admin
  adminList: (params?: { page?: number; limit?: number; status?: DisputeStatus }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.status) q.set("status", params.status);
    return api.get<DisputeListResponse>(`/api/admin/orders/disputes?${q.toString()}`);
  },
  adminResolve: (disputeId: string, payload: AdminResolveBody) =>
    api.patch<{ dispute: Dispute }>(`/api/admin/orders/disputes/${disputeId}`, payload),
};
