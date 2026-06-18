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
      return mapToProducts(res);
    } catch {
      return [];
    }
  },

  getSimilar: async (productId: string): Promise<Product[]> => {
    try {
      const res = await api.get<any[]>(`/api/recommendations/similar/${productId}`, { silent: true });
      return mapToProducts(res);
    } catch {
      return [];
    }
  },

  getHomeRails: async (): Promise<HomeRails> => {
    try {
      const res = await api.get<{
        recentlyViewed?: any[];
        wishlistBased?: any[];
        trending?: any[];
      }>("/api/recommendations/home-rails", { silent: true });
      
      return {
        recentlyViewed: mapToProducts(res?.recentlyViewed || []),
        wishlistBased: mapToProducts(res?.wishlistBased || []),
        trending: mapToProducts(res?.trending || []),
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
    imageUrl: p.images?.[0] || p.image_url || undefined,
  }));
}
