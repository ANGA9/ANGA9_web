import { api } from "./api";

export interface PdcEligibilityResponse {
  eligible: boolean;
  total_coins: number;
  bonus_coins: number;
  reason?: string;
}

export const pdcApi = {
  checkEligibility: (orderId: string, orderItemId: string, requestedQty: number) =>
    api.get<PdcEligibilityResponse>(`/api/orders/pdc/eligibility?order_id=${orderId}&order_item_id=${orderItemId}&requested_qty=${requestedQty}`),
    
  acceptCoins: (disputeId: string) =>
    api.post<{ message: string }>(`/api/orders/pdc/accept-coins`, { dispute_id: disputeId }),
};
