import { api } from "./api";

export interface PdcEligibilityResponse {
  eligible: boolean;
  total_coins: number;
  bonus_coins: number;
  reason?: string;
}

export const pdcApi = {
  checkEligibility: (orderItemId: string) =>
    api.get<PdcEligibilityResponse>(`/api/orders/items/${orderItemId}/pdc/eligibility`),
    
  acceptCoins: (disputeId: string) =>
    api.post<{ message: string }>(`/api/orders/disputes/${disputeId}/pdc/accept-coins`, {}),
};
