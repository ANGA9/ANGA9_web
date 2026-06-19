"use client";

import { useEffect, useState } from "react";
import { dealsApi } from "@/lib/dealsApi";
import { Loader2, BellOff, ArrowLeft, Trash2, ArrowDownRight, PackageOpen } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";

interface AlertItem {
  id: string;
  target_price?: number;
  active: boolean;
  created_at: string;
  products: {
    id: string;
    name: string;
    images?: string[];
  };
}

export default function MyAlertsPage() {
  const [loading, setLoading] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState<AlertItem[]>([]);
  const [stockAlerts, setStockAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await dealsApi.listAlerts();
      setPriceAlerts(data.price_alerts || []);
      setStockAlerts(data.stock_alerts || []);
    } catch {
      toast.error("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: "price" | "stock", id: string) => {
    try {
      await dealsApi.deleteAlert(type, id);
      toast.success("Alert removed");
      if (type === "price") {
        setPriceAlerts(prev => prev.filter(a => a.id !== id));
      } else {
        setStockAlerts(prev => prev.filter(a => a.id !== id));
      }
    } catch {
      toast.error("Failed to remove alert");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: t.bluePrimary }} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 md:px-0">
      <div className="mb-6">
        <Link href="/account" className="inline-flex items-center gap-2 text-sm font-semibold mb-4 transition-colors hover:text-gray-900 text-gray-500">
          <ArrowLeft className="w-4 h-4" /> Back to Account
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">My Product Alerts</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your price drop and back-in-stock notifications.</p>
      </div>

      {priceAlerts.length === 0 && stockAlerts.length === 0 ? (
        <div className="bg-gray-50 border rounded-2xl flex flex-col items-center justify-center py-20 px-4 text-center">
          <BellOff className="w-12 h-12 text-gray-300 mb-4" />
          <h2 className="text-lg font-bold text-gray-900">No active alerts</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            You haven't subscribed to any product alerts yet. When you see an out-of-stock item or want to wait for a price drop, click "Notify Me" on the product page.
          </p>
          <Link href="/" className="mt-6 px-6 py-2.5 bg-[#4338CA] text-white font-bold rounded-xl shadow-sm hover:opacity-90 transition-opacity">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {priceAlerts.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ArrowDownRight className="w-5 h-5 text-green-600" /> Price Drop Alerts
              </h2>
              <div className="grid gap-4">
                {priceAlerts.map(alert => (
                  <AlertCard key={alert.id} alert={alert} type="price" onDelete={() => handleDelete("price", alert.id)} />
                ))}
              </div>
            </section>
          )}

          {stockAlerts.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <PackageOpen className="w-5 h-5 text-orange-500" /> Back in Stock Alerts
              </h2>
              <div className="grid gap-4">
                {stockAlerts.map(alert => (
                  <AlertCard key={alert.id} alert={alert} type="stock" onDelete={() => handleDelete("stock", alert.id)} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function AlertCard({ alert, type, onDelete }: { alert: AlertItem, type: "price" | "stock", onDelete: () => void }) {
  const imageUrl = alert.products.images?.[0];

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/products/${alert.products.id}`} className="shrink-0 w-16 h-16 rounded-lg bg-gray-50 border overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={alert.products.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PackageOpen className="w-6 h-6 text-gray-300" />
          </div>
        )}
      </Link>
      
      <div className="flex-1 min-w-0">
        <Link href={`/products/${alert.products.id}`} className="block text-[15px] font-bold text-gray-900 truncate hover:text-[#4338CA]">
          {alert.products.name}
        </Link>
        <div className="text-sm mt-1 text-gray-500 flex items-center gap-2">
          {type === "price" && alert.target_price ? (
            <span className="font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
              Target: ₹{alert.target_price}
            </span>
          ) : (
            <span className="font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
              Notify when available
            </span>
          )}
          <span className="text-xs">&bull; Added {new Date(alert.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <button onClick={onDelete} className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete alert">
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}
