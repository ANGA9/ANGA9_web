import { api } from "./api";

export interface StorefrontProfile {
  user_id: string;
  store_name: string | null;
  store_description: string | null;
  store_slug: string | null;
  logo_url: string | null;
  business_category: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  storefront_banner_url: string | null;
  about_md: string | null;
  social_links: Record<string, string>;
  is_verified: boolean;
  storefront_published: boolean;
  created_at: string;
}

export interface StorefrontUser {
  id: string;
  full_name: string | null;
  company_name: string | null;
  created_at: string;
}

export interface StorefrontStats {
  active_products: number;
  orders_fulfilled: number;
  avg_rating: number;
  rating_count: number;
}

export interface Storefront {
  seller_id: string;
  profile: StorefrontProfile;
  user: StorefrontUser | null;
  stats: StorefrontStats;
}

export interface RepeatBuyer {
  customer_id: string;
  full_name: string | null;
  order_count: number;
  total_spent: number;
  last_order_at: string;
}

export interface StorefrontUpdate {
  storefront_banner_url?: string;
  about_md?: string;
  storefront_published?: boolean;
  social_links?: Record<string, string>;
}

export function getStorefront(sellerId: string): Promise<Storefront> {
  return api.get<Storefront>(`/api/users/sellers/${sellerId}/storefront`);
}

export function getRepeatBuyers(sellerId: string): Promise<{ items: RepeatBuyer[] }> {
  return api.get<{ items: RepeatBuyer[] }>(`/api/users/sellers/${sellerId}/repeat-buyers`);
}

export function updateStorefrontSettings(
  body: StorefrontUpdate,
): Promise<{ storefront: StorefrontProfile }> {
  return api.patch<{ storefront: StorefrontProfile }>(`/api/users/storefront`, body);
}
