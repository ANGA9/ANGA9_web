"use client";

import { useState, useEffect } from "react";
import { dealsApi, type Deal } from "@/lib/dealsApi";
import { Tag, Calendar, Clock, Loader2, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const data = await dealsApi.getDeals();
      setDeals(data);
    } catch {
      toast.error("Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this deal?")) return;
    try {
      await dealsApi.deleteDeal(id);
      toast.success("Deal removed");
      setDeals((prev) => prev.filter((d) => d.id !== id));
    } catch {
      toast.error("Failed to delete deal");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Global Deals Monitor</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor and manage all promotional deals created by sellers across the platform.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : deals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <Tag className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No deals active</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-sm">
              Sellers have not created any promotional deals yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Seller ID</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Deal Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Timeline</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deals.map((deal) => {
                  const now = new Date();
                  const start = new Date(deal.starts_at);
                  const end = new Date(deal.ends_at);
                  let status = "Inactive";
                  let statusColor = "bg-gray-100 text-gray-700";
                  
                  if (deal.active) {
                    if (now < start) {
                      status = "Scheduled";
                      statusColor = "bg-amber-100 text-amber-700";
                    } else if (now > end) {
                      status = "Expired";
                      statusColor = "bg-red-100 text-red-700";
                    } else {
                      status = "Active";
                      statusColor = "bg-green-100 text-green-700";
                    }
                  }

                  return (
                    <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 max-w-[200px] truncate">
                        {deal.products?.name || "Unknown Product"}
                      </td>
                      <td className="px-6 py-4 text-gray-500 max-w-[150px] truncate" title={deal.products?.seller_id}>
                        {deal.products?.seller_id || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-bold capitalize">
                          {deal.type?.replace('_', ' ') || 'Flash'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">₹{deal.deal_price}</span>
                          {deal.quantity_threshold && (
                            <span className="text-xs text-gray-500">(Min: {deal.quantity_threshold})</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs text-gray-600">
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Start: {start.toLocaleString()}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> End: {end.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(deal.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Deal"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
