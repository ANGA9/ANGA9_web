import { api } from "./api";
import { type Membership, type LoyaltyTier } from "@anga9/shared";

export interface LoyaltyProfile {
  spend: number;
  tier: LoyaltyTier;
  base_earn_rate: number;
  membership: Membership | null;
}

export interface LoyaltyConfig {
  base_earn_rate: number;
  tiers: LoyaltyTier[];
}

export const loyaltyApi = {
  // Customer
  getLoyaltyProfile: async () => {
    return api.get<LoyaltyProfile>("/api/users/loyalty");
  },

  purchaseMembership: async (plan: string) => {
    return api.post<{ razorpayOrderId: string; amount: number; currency: string; plan: string }>(
      "/api/payments/memberships/purchase",
      { plan }
    );
  },

  verifyMembership: async (details: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    return api.post<{ membership: Membership }>(
      "/api/payments/memberships/verify",
      details
    );
  },

  // Admin
  getAdminConfig: async () => {
    // Loyalty config is stored in platform_config
    const res = await api.get<Record<string, unknown>>("/api/admin/config");
    return res.loyalty_config as LoyaltyConfig | undefined;
  },

  updateAdminConfig: async (config: LoyaltyConfig) => {
    return api.patch("/api/admin/config", { loyalty_config: config });
  },

  listMembers: async (page = 1, limit = 50) => {
    // If there is no dedicated members endpoint, we might have to add one.
    // For now, assume /api/admin/members exists or we will create it if needed.
    // Let's implement the UI, and if it fails, we'll add the backend.
    return api.get<{ data: any[]; total: number }>(`/api/admin/members?page=${page}&limit=${limit}`);
  }
};
