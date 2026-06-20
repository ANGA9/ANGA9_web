import { api } from "./api";
export interface LoyaltyTier {
  name: string;
  min_spend?: number;
  multiplier: number;
  threshold?: number;
}

export interface Membership {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  starts_at: string;
  ends_at: string;
}

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
    return api.post<{ success: boolean; membership?: Membership }>(
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
  }
};
