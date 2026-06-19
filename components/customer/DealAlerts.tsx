"use client";

import { useState } from "react";
import { Bell, BellRing, Loader2 } from "lucide-react";
import { dealsApi } from "@/lib/dealsApi";
import toast from "react-hot-toast";

interface DealAlertsProps {
  productId: string;
  isOutOfStock: boolean;
  targetPrice?: number;
}

export default function DealAlerts({ productId, isOutOfStock, targetPrice }: DealAlertsProps) {
  const [loading, setLoading] = useState(false);
  const [subscribedStock, setSubscribedStock] = useState(false);
  const [subscribedPrice, setSubscribedPrice] = useState(false);

  const handleStockAlert = async () => {
    setLoading(true);
    try {
      await dealsApi.subscribeStockAlert(productId);
      setSubscribedStock(true);
      toast.success("You will be notified when this item is back in stock!");
    } catch {
      toast.error("Failed to subscribe to stock alerts. Please make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  const handlePriceAlert = async () => {
    if (!targetPrice) return;
    setLoading(true);
    try {
      await dealsApi.subscribePriceAlert(productId, targetPrice);
      setSubscribedPrice(true);
      toast.success("You will be notified when the price drops!");
    } catch {
      toast.error("Failed to subscribe to price alerts. Please make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  if (isOutOfStock) {
    return (
      <button
        onClick={handleStockAlert}
        disabled={loading || subscribedStock}
        className="flex items-center gap-1.5 text-[13px] font-medium transition-colors hover:text-gray-900 hover:underline w-fit"
        style={{ color: subscribedStock ? "#059669" : "#64748B" }}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : subscribedStock ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
        {subscribedStock ? "Stock Alert Subscribed" : "Notify me when back in stock"}
      </button>
    );
  }

  // Active product, allow price drop alert
  return (
    <button
      onClick={handlePriceAlert}
      disabled={loading || subscribedPrice}
      className="flex items-center gap-1.5 text-[13px] font-medium transition-colors hover:text-gray-900 hover:underline w-fit"
      style={{ color: subscribedPrice ? "#059669" : "#64748B" }}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : subscribedPrice ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
      {subscribedPrice ? "Price Drop Alert Subscribed" : "Notify me when price drops"}
    </button>
  );
}
