import { api } from "./api";

export interface Deal {
  id: string;
  product_id: string;
  type: string;
  deal_price: number;
  starts_at: string;
  ends_at: string;
  stock_cap: number | null;
  quantity_threshold: number;
  active: boolean;
  created_by: string;
  products?: {
    seller_id: string;
    name: string;
    base_price: number;
    sale_price?: number;
    images?: string[];
    min_order_qty?: number;
    unit?: string;
    category_id?: string;
  };
}

export interface DealFilters {
  product_id?: string;
  active_only?: boolean;
}

export const dealsApi = {
  async getDeals(filters?: DealFilters) {
    const params = new URLSearchParams();
    if (filters?.product_id) params.set("product_id", filters.product_id);
    if (filters?.active_only !== undefined) params.set("active_only", String(filters.active_only));

    const path = `/api/deals${params.toString() ? `?${params.toString()}` : ""}`;
    const res = await api.get<{ deals: Deal[] }>(path);
    return res.deals;
  },

  async subscribePriceAlert(productId: string, targetPrice: number) {
    return api.post("/api/deals/price-alert", { product_id: productId, target_price: targetPrice });
  },

  async subscribeStockAlert(productId: string) {
    return api.post("/api/deals/stock-alert", { product_id: productId });
  },

  async listAlerts() {
    return api.get<{ price_alerts: any[]; stock_alerts: any[] }>("/api/deals/alerts");
  },

  async deleteAlert(type: "price" | "stock", id: string) {
    return api.delete(`/api/deals/alerts/${type}/${id}`);
  },

  async createDeal(payload: Partial<Deal>) {
    return api.post<Deal>("/api/deals", payload);
  },

  async updateDeal(id: string, payload: Partial<Deal>) {
    return api.put<Deal>(`/api/deals/${id}`, payload);
  },

  async deleteDeal(id: string) {
    return api.delete(`/api/deals/${id}`);
  },
};
