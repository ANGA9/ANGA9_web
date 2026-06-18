import { api } from "./api";

export interface RiskEvent {
  id: string;
  user_id: string;
  action: string;
  score: number;
  signals: string[];
  context: Record<string, any>;
  created_at: string;
  user_email?: string;
  user_phone?: string;
  user_name?: string;
}

export interface RiskBlocklistEntry {
  id: string;
  type: string;
  value: string;
  reason: string;
  created_by: string;
  created_at: string;
}

export const riskApi = {
  listEvents: (params?: Record<string, string>) => {
    const qs = params ? new URLSearchParams(params).toString() : "";
    return api.get<RiskEvent[]>(`/api/admin/risk/events${qs ? `?${qs}` : ""}`);
  },

  getBlocklist: () => {
    return api.get<RiskBlocklistEntry[]>("/api/admin/risk/blocklist");
  },

  addBlocklist: (data: { type: string; value: string; reason: string }) => {
    return api.post<RiskBlocklistEntry>("/api/admin/risk/blocklist", data);
  },

  removeBlocklist: (id: string) => {
    return api.delete(`/api/admin/risk/blocklist/${id}`);
  },

  // Example action to manually review an event (optional, depending on backend implementation)
  overrideEvent: (id: string, action: string) => {
    return api.patch(`/api/admin/risk/events/${id}`, { action });
  }
};
