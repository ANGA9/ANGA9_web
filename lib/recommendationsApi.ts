import { api } from "./api";
import type { Product } from "@/components/customer/ProductCard";

export interface HomeRails {
  recentlyViewed: Product[];
  wishlistBased: Product[];
  trending: Product[];
}

export const recommendationsApi = {
  getAlsoBought: async (productId: string): Promise<Product[]> => {
    try {
      const res = await api.get<any[]>(`/api/recommendations/also-bought/${productId}`, { silent: true });
      if (!Array.isArray(res)) return [];
      return mapToProducts(res.map(r => r?.product).filter(Boolean));
    } catch {
      return [];
    }
  },

  getSimilar: async (productId: string): Promise<Product[]> => {
    try {
      const res = await api.get<any[]>(`/api/recommendations/similar/${productId}`, { silent: true });
      if (!Array.isArray(res)) return [];
      return mapToProducts(res);
    } catch {
      return [];
    }
  },

  getHomeRails: async (): Promise<HomeRails> => {
    try {
      const res = await api.get<Array<{ title: string; type: string; items: any[] }>>("/api/recommendations/home-rails", { silent: true });
      if (!Array.isArray(res)) {
        return { recentlyViewed: [], wishlistBased: [], trending: [] };
      }
      
      const recentlyViewed = res.find(r => r.type === 'recently_viewed')?.items || [];
      const wishlistBased = res.find(r => r.type === 'wishlist')?.items || [];
      const trending = res.find(r => r.type === 'popular')?.items || [];

      return {
        recentlyViewed: mapToProducts(recentlyViewed),
        wishlistBased: mapToProducts(wishlistBased),
        trending: mapToProducts(trending),
      };
    } catch {
      return { recentlyViewed: [], wishlistBased: [], trending: [] };
    }
  },

  recordView: async (productId: string): Promise<void> => {
    try {
      // Fire and forget
      api.post("/api/recommendations/view", { productId }, { silent: true }).catch(() => {});
    } catch {
      // ignore
    }
  }
};

import { getProductImage } from "@/lib/utils";

/** Helper to map backend product to UI ProductCard shape */
function mapToProducts(items: any[]): Product[] {
  if (!Array.isArray(items)) return [];
  return items.map((p) => ({
    id: p.id,
    name: p.name,
    seller: "", // not always joined in recommendation queries
    category: p.category_id || "", 
    originalPrice: p.base_price || p.price || 0,
    price: p.sale_price ?? p.base_price ?? p.price ?? 0,
    minOrder: `${p.min_order_qty || 1} ${p.unit || 'unit'}${p.min_order_qty > 1 ? "s" : ""}`,
    badge: undefined,
    imageUrl: getProductImage(p),
  }));
}
